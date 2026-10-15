import { FastifyInstance } from 'fastify';
import { prisma } from '../../prisma';
import { AnalyticsEventSchema } from '@baterias-estrela/shared';

export async function publicAnalyticsRoutes(app: FastifyInstance) {
  app.post(
    '/events',
    {
      config: {
        rateLimit: {
          max: 60,
          timeWindow: '1 minute',
        },
      },
    },
    async (request, reply) => {
      try {
        const parseResult = AnalyticsEventSchema.safeParse(request.body);
        if (!parseResult.success) {
          // Retorna 200/400 de forma silenciosa para não quebrar a experiência do usuário
          return reply.status(400).send({ error: 'Payload de telemetria inválido' });
        }

        const data = parseResult.data;

        // Opcional: sanitiza metadata para nunca guardar números de cartão ou dados sensíveis
        let safeMetadata: any = null;
        if (data.metadata && typeof data.metadata === 'object') {
          safeMetadata = {};
          const allowedKeys = ['make', 'model', 'year', 'query', 'source', 'action', 'filter'];
          for (const key of allowedKeys) {
            if (data.metadata[key] !== undefined) {
              safeMetadata[key] = String(data.metadata[key]).slice(0, 100);
            }
          }
        }

        await prisma.analyticsEvent.create({
          data: {
            eventType: data.eventType,
            path: data.path.slice(0, 255),
            productId: data.productId || null,
            serviceId: data.serviceId || null,
            sessionId: data.sessionId.slice(0, 100),
            referrer: data.referrer ? data.referrer.slice(0, 500) : null,
            utmSource: data.utmSource ? data.utmSource.slice(0, 100) : null,
            utmMedium: data.utmMedium ? data.utmMedium.slice(0, 100) : null,
            utmCampaign: data.utmCampaign ? data.utmCampaign.slice(0, 100) : null,
            deviceCategory: data.deviceCategory,
            metadata: safeMetadata,
          },
        });

        return reply.status(202).send({ ok: true });
      } catch (err) {
        // Responde sem erro para o cliente
        return reply.status(202).send({ ok: true, ignored: true });
      }
    }
  );
}
