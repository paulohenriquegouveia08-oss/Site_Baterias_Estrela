import { FastifyInstance } from 'fastify';
import { prisma } from '../../prisma';

export async function adminAuditRoutes(app: FastifyInstance) {
  app.get('/', { preHandler: [app.authenticate] }, async (request, reply) => {
    const query = request.query as { page?: string; limit?: string; entityType?: string };
    const page = Math.max(1, parseInt(query.page || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(query.limit || '25', 10)));
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query.entityType) {
      where.entityType = query.entityType;
    }

    const [total, logs] = await Promise.all([
      prisma.adminAuditLog.count({ where }),
      prisma.adminAuditLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          adminUser: {
            select: { id: true, name: true, email: true },
          },
        },
      }),
    ]);

    return reply.send({
      data: logs,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  });
}
