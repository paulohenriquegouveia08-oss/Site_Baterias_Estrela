import { FastifyInstance } from 'fastify';
import { prisma } from '../../prisma';

export async function publicServicesRoutes(app: FastifyInstance) {
  app.get('/', async (request, reply) => {
    const services = await prisma.service.findMany({
      where: { status: 'active' },
      orderBy: { displayOrder: 'asc' },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        iconName: true,
        imageUrl: true,
        regionServed: true,
        workingHours: true,
        ctaText: true,
        whatsappMessage: true,
        displayOrder: true,
      },
    });

    return reply.send({ data: services });
  });
}
