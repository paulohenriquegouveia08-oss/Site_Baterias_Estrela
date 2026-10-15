import { FastifyInstance } from 'fastify';
import { prisma } from '../../prisma';

export async function publicCategoriesRoutes(app: FastifyInstance) {
  app.get('/', async (request, reply) => {
    const categories = await prisma.category.findMany({
      where: { status: 'active' },
      orderBy: { displayOrder: 'asc' },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        displayOrder: true,
        _count: {
          select: {
            products: {
              where: {
                product: {
                  status: 'active',
                  deletedAt: null,
                },
              },
            },
          },
        },
      },
    });

    const formatted = categories.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      description: c.description,
      displayOrder: c.displayOrder,
      productsCount: c._count.products,
    }));

    return reply.send({ data: formatted });
  });
}
