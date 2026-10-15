import { FastifyInstance } from 'fastify';
import { prisma } from '../../prisma';

function getDateRange(period?: string, startStr?: string, endStr?: string): { startDate: Date; endDate: Date } {
  const endDate = endStr ? new Date(endStr) : new Date();
  let startDate = new Date();

  if (period === 'today') {
    startDate.setHours(0, 0, 0, 0);
  } else if (period === '30d') {
    startDate.setDate(startDate.getDate() - 30);
  } else if (period === 'custom' && startStr) {
    startDate = new Date(startStr);
  } else {
    // Default 7d
    startDate.setDate(startDate.getDate() - 7);
  }

  return { startDate, endDate };
}

export async function adminDashboardRoutes(app: FastifyInstance) {
  // Resumo de Métricas (Dashboard Summary)
  app.get('/analytics/summary', { preHandler: [app.authenticate] }, async (request, reply) => {
    const query = request.query as {
      period?: 'today' | '7d' | '30d' | 'custom';
      startDate?: string;
      endDate?: string;
    };

    const { startDate, endDate } = getDateRange(query.period, query.startDate, query.endDate);

    const timeFilter = {
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    };

    const [
      totalPageViews,
      uniqueSessions,
      whatsappClicks,
      phoneClicks,
      productViews,
      vehicleSearches,
      unmatchedSearches,
      serviceInteractions,
    ] = await Promise.all([
      prisma.analyticsEvent.count({
        where: { ...timeFilter, eventType: 'page_view' },
      }),
      prisma.analyticsEvent.groupBy({
        by: ['sessionId'],
        where: timeFilter,
      }),
      prisma.analyticsEvent.count({
        where: { ...timeFilter, eventType: 'whatsapp_click' },
      }),
      prisma.analyticsEvent.count({
        where: { ...timeFilter, eventType: 'phone_click' },
      }),
      prisma.analyticsEvent.count({
        where: { ...timeFilter, eventType: 'product_view' },
      }),
      prisma.analyticsEvent.count({
        where: { ...timeFilter, eventType: 'vehicle_search' },
      }),
      prisma.analyticsEvent.count({
        where: {
          ...timeFilter,
          eventType: 'compatibility_result',
          metadata: { path: ['matched'], equals: false },
        },
      }),
      prisma.analyticsEvent.count({
        where: {
          ...timeFilter,
          eventType: { in: ['service_request_click', 'service_form_submit'] },
        },
      }),
    ]);

    const estimatedUniqueVisitors = uniqueSessions.length;
    const totalContacts = whatsappClicks + phoneClicks;
    const contactConversionRatePct =
      estimatedUniqueVisitors > 0
        ? parseFloat(((totalContacts / estimatedUniqueVisitors) * 100).toFixed(1))
        : 0;

    return reply.send({
      period: query.period || '7d',
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      totalPageViews,
      estimatedUniqueVisitors,
      whatsappClicks,
      phoneClicks,
      productViews,
      vehicleSearches,
      unmatchedVehicleSearches: unmatchedSearches,
      serviceInteractions,
      contactConversionRatePct,
    });
  });

  // Série temporal para gráficos
  app.get('/analytics/timeseries', { preHandler: [app.authenticate] }, async (request, reply) => {
    const query = request.query as {
      period?: 'today' | '7d' | '30d' | 'custom';
      startDate?: string;
      endDate?: string;
    };

    const { startDate, endDate } = getDateRange(query.period, query.startDate, query.endDate);

    const events = await prisma.analyticsEvent.findMany({
      where: {
        createdAt: { gte: startDate, lte: endDate },
        eventType: { in: ['page_view', 'whatsapp_click', 'phone_click', 'vehicle_search'] },
      },
      select: {
        eventType: true,
        createdAt: true,
      },
    });

    // Agrupa por dia (YYYY-MM-DD)
    const map = new Map<string, { pageViews: number; whatsappClicks: number; phoneClicks: number; vehicleSearches: number }>();

    // Inicializa todos os dias do período
    const curr = new Date(startDate);
    while (curr <= endDate) {
      const key = curr.toISOString().split('T')[0];
      map.set(key, { pageViews: 0, whatsappClicks: 0, phoneClicks: 0, vehicleSearches: 0 });
      curr.setDate(curr.getDate() + 1);
    }

    for (const ev of events) {
      const key = ev.createdAt.toISOString().split('T')[0];
      const entry = map.get(key) || { pageViews: 0, whatsappClicks: 0, phoneClicks: 0, vehicleSearches: 0 };
      if (ev.eventType === 'page_view') entry.pageViews++;
      else if (ev.eventType === 'whatsapp_click') entry.whatsappClicks++;
      else if (ev.eventType === 'phone_click') entry.phoneClicks++;
      else if (ev.eventType === 'vehicle_search') entry.vehicleSearches++;
      map.set(key, entry);
    }

    const series = Array.from(map.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, counts]) => ({
        date,
        ...counts,
      }));

    return reply.send({ data: series });
  });

  // Produtos mais acessados e mais consultados via WhatsApp
  app.get('/analytics/top-products', { preHandler: [app.authenticate] }, async (request, reply) => {
    const query = request.query as { period?: string };
    const { startDate, endDate } = getDateRange(query.period);

    const [viewsByProduct, waByProduct] = await Promise.all([
      prisma.analyticsEvent.groupBy({
        by: ['productId'],
        where: {
          eventType: 'product_view',
          productId: { not: null },
          createdAt: { gte: startDate, lte: endDate },
        },
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
        take: 10,
      }),
      prisma.analyticsEvent.groupBy({
        by: ['productId'],
        where: {
          eventType: 'whatsapp_click',
          productId: { not: null },
          createdAt: { gte: startDate, lte: endDate },
        },
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
        take: 10,
      }),
    ]);

    const productIds = Array.from(
      new Set([
        ...viewsByProduct.map((v) => v.productId!),
        ...waByProduct.map((w) => w.productId!),
      ])
    );

    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, name: true, brand: true, slug: true },
    });

    const productsMap = new Map(products.map((p) => [p.id, p]));

    const combined = productIds.map((id) => {
      const prod = productsMap.get(id);
      const views = viewsByProduct.find((v) => v.productId === id)?._count.id || 0;
      const waClicks = waByProduct.find((w) => w.productId === id)?._count.id || 0;
      return {
        id,
        name: prod?.name || 'Produto removido',
        brand: prod?.brand || '',
        slug: prod?.slug || '',
        views,
        whatsappClicks: waClicks,
      };
    }).sort((a, b) => (b.views + b.whatsappClicks * 2) - (a.views + a.whatsappClicks * 2));

    return reply.send({ data: combined });
  });

  // Páginas mais visitadas
  app.get('/analytics/top-pages', { preHandler: [app.authenticate] }, async (request, reply) => {
    const query = request.query as { period?: string };
    const { startDate, endDate } = getDateRange(query.period);

    const topPages = await prisma.analyticsEvent.groupBy({
      by: ['path'],
      where: {
        eventType: 'page_view',
        createdAt: { gte: startDate, lte: endDate },
      },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 10,
    });

    const formatted = topPages.map((p) => ({
      path: p.path,
      views: p._count.id,
    }));

    return reply.send({ data: formatted });
  });

  // Origem de tráfego
  app.get('/analytics/sources', { preHandler: [app.authenticate] }, async (request, reply) => {
    const query = request.query as { period?: string };
    const { startDate, endDate } = getDateRange(query.period);

    const totalEvents = await prisma.analyticsEvent.count({
      where: {
        eventType: 'page_view',
        createdAt: { gte: startDate, lte: endDate },
      },
    });

    const sources = await prisma.analyticsEvent.groupBy({
      by: ['utmSource', 'referrer'],
      where: {
        eventType: 'page_view',
        createdAt: { gte: startDate, lte: endDate },
      },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 10,
    });

    const formatted = sources.map((s) => {
      let label = 'Acesso Direto';
      if (s.utmSource) {
        label = `Campanha: ${s.utmSource}`;
      } else if (s.referrer) {
        try {
          const url = new URL(s.referrer);
          label = url.hostname.replace('www.', '');
        } catch {
          label = s.referrer;
        }
      }

      const count = s._count.id;
      const percentage = totalEvents > 0 ? parseFloat(((count / totalEvents) * 100).toFixed(1)) : 0;

      return {
        source: label,
        count,
        percentage,
      };
    });

    return reply.send({ data: formatted });
  });

  // Termos e buscas por veículo
  app.get('/analytics/vehicle-searches', { preHandler: [app.authenticate] }, async (request, reply) => {
    const query = request.query as { period?: string };
    const { startDate, endDate } = getDateRange(query.period);

    const searches = await prisma.analyticsEvent.findMany({
      where: {
        eventType: 'vehicle_search',
        createdAt: { gte: startDate, lte: endDate },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
      select: {
        id: true,
        metadata: true,
        deviceCategory: true,
        createdAt: true,
      },
    });

    return reply.send({ data: searches });
  });
}
