import { FastifyInstance } from 'fastify';
import { prisma } from '../../prisma';

export async function adminServiceRequestsRoutes(app: FastifyInstance) {
  app.get('/', { preHandler: [app.authenticate] }, async (request, reply) => {
    const query = request.query as { status?: string; page?: string; limit?: string };
    const page = Math.max(1, parseInt(query.page || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(query.limit || '20', 10)));
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query.status) {
      where.status = query.status;
    }

    const [total, requests] = await Promise.all([
      prisma.serviceRequest.count({ where }),
      prisma.serviceRequest.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          service: true,
        },
      }),
    ]);

    return reply.send({
      data: requests,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  });

  app.put('/:id/status', { preHandler: [app.authenticate] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const { status } = request.body as { status: string };

    const updated = await prisma.serviceRequest.update({
      where: { id },
      data: { status },
    });

    await app.logAudit('UPDATE_SERVICE_REQUEST_STATUS', 'ServiceRequest', id, { status }, request);

    return reply.send({ request: updated });
  });
}
