import { FastifyInstance } from 'fastify';
import { prisma } from '../../prisma';

export async function publicProductsRoutes(app: FastifyInstance) {
  // Catálogo público de produtos
  app.get('/', async (request, reply) => {
    const query = request.query as {
      search?: string;
      brand?: string;
      categoryId?: string;
      minAh?: string;
      maxAh?: string;
      technology?: string;
      polarity?: string;
      featured?: string;
      page?: string;
      limit?: string;
      sortBy?: string;
      sortOrder?: string;
    };

    const page = Math.max(1, parseInt(query.page || '1', 10));
    const limit = Math.min(50, Math.max(1, parseInt(query.limit || '12', 10)));
    const skip = (page - 1) * limit;

    const where: any = {
      status: 'active',
      deletedAt: null,
    };

    if (query.featured === 'true') {
      where.isFeatured = true;
    }

    if (query.brand) {
      where.brand = { equals: query.brand, mode: 'insensitive' };
    }

    if (query.technology) {
      where.technology = query.technology;
    }

    if (query.polarity) {
      where.polarity = query.polarity;
    }

    if (query.minAh || query.maxAh) {
      where.amperageAh = {};
      if (query.minAh) where.amperageAh.gte = parseFloat(query.minAh);
      if (query.maxAh) where.amperageAh.lte = parseFloat(query.maxAh);
    }

    if (query.categoryId) {
      where.categories = {
        some: {
          categoryId: query.categoryId,
        },
      };
    }

    if (query.search && query.search.trim()) {
      const term = query.search.trim();
      where.OR = [
        { name: { contains: term, mode: 'insensitive' } },
        { brand: { contains: term, mode: 'insensitive' } },
        { sku: { contains: term, mode: 'insensitive' } },
        { description: { contains: term, mode: 'insensitive' } },
      ];
    }

    // Ordenação
    let orderBy: any = { isFeatured: 'desc' };
    if (query.sortBy === 'amperage') {
      orderBy = { amperageAh: query.sortOrder === 'desc' ? 'desc' : 'asc' };
    } else if (query.sortBy === 'name') {
      orderBy = { name: query.sortOrder === 'desc' ? 'desc' : 'asc' };
    } else if (query.sortBy === 'brand') {
      orderBy = { brand: query.sortOrder === 'desc' ? 'desc' : 'asc' };
    }

    const [total, products] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        select: {
          id: true,
          name: true,
          slug: true,
          sku: true,
          brand: true,
          description: true,
          amperageAh: true,
          voltageV: true,
          ccaA: true,
          dimensionsMm: true,
          warrantyMonths: true,
          polarity: true,
          technology: true,
          isFeatured: true,
          stockStatus: true,
          createdAt: true,
          // CRITICAL: NEVER include internalCostNotes!
          images: {
            orderBy: [{ isCover: 'desc' }, { displayOrder: 'asc' }],
            select: {
              id: true,
              url: true,
              altText: true,
              displayOrder: true,
              isCover: true,
            },
          },
          categories: {
            select: {
              category: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                },
              },
            },
          },
          _count: {
            select: {
              compatibilities: true,
            },
          },
        },
      }),
    ]);

    // Format output
    const formatted = products.map((p) => ({
      ...p,
      categories: p.categories.map((c) => c.category),
      compatibilitiesCount: p._count.compatibilities,
    }));

    return reply.send({
      data: formatted,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  });

  // Detalhes do produto por slug
  app.get('/:slug', async (request, reply) => {
    const { slug } = request.params as { slug: string };

    const product = await prisma.product.findFirst({
      where: {
        slug,
        status: 'active',
        deletedAt: null,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        sku: true,
        brand: true,
        description: true,
        amperageAh: true,
        voltageV: true,
        ccaA: true,
        dimensionsMm: true,
        warrantyMonths: true,
        polarity: true,
        technology: true,
        isFeatured: true,
        stockStatus: true,
        createdAt: true,
        // CRITICAL: NEVER include internalCostNotes!
        images: {
          orderBy: [{ isCover: 'desc' }, { displayOrder: 'asc' }],
          select: {
            id: true,
            url: true,
            altText: true,
            displayOrder: true,
            isCover: true,
          },
        },
        categories: {
          select: {
            category: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
        },
        compatibilities: {
          where: {
            validationStatus: 'verified',
          },
          select: {
            id: true,
            technicalNotes: true,
            vehicleVariant: {
              select: {
                id: true,
                name: true,
                yearStart: true,
                yearEnd: true,
                engine: true,
                fuel: true,
                version: true,
                model: {
                  select: {
                    name: true,
                    make: {
                      select: {
                        name: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!product) {
      return reply.status(404).send({
        error: 'Produto não encontrado',
        message: 'A bateria solicitada não existe ou não está mais disponível no catálogo.',
      });
    }

    // Busca produtos relacionados (mesma categoria ou amperagem próxima)
    const related = await prisma.product.findMany({
      where: {
        id: { not: product.id },
        status: 'active',
        deletedAt: null,
        amperageAh: {
          gte: product.amperageAh - 10,
          lte: product.amperageAh + 10,
        },
      },
      take: 4,
      select: {
        id: true,
        name: true,
        slug: true,
        brand: true,
        amperageAh: true,
        voltageV: true,
        ccaA: true,
        warrantyMonths: true,
        technology: true,
        polarity: true,
        stockStatus: true,
        images: {
          where: { isCover: true },
          take: 1,
          select: {
            id: true,
            url: true,
            altText: true,
            isCover: true,
            displayOrder: true,
          },
        },
      },
    });

    const formattedCompatibilities = product.compatibilities.map((c) => ({
      id: c.id,
      vehicleMake: c.vehicleVariant.model.make.name,
      vehicleModel: c.vehicleVariant.model.name,
      variantName: c.vehicleVariant.name,
      years: c.vehicleVariant.yearEnd
        ? `${c.vehicleVariant.yearStart} a ${c.vehicleVariant.yearEnd}`
        : `${c.vehicleVariant.yearStart} em diante`,
      technicalNotes: c.technicalNotes,
    }));

    return reply.send({
      product: {
        ...product,
        categories: product.categories.map((c) => c.category),
        compatibilities: formattedCompatibilities,
      },
      relatedProducts: related,
    });
  });
}
