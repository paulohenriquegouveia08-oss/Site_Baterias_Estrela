import { FastifyInstance } from 'fastify';
import { prisma } from '../../prisma';
import { CategorySchema, slugify } from '@baterias-estrela/shared';

export async function adminCategoriesRoutes(app: FastifyInstance) {
  // Listar categorias
  app.get('/', { preHandler: [app.authenticate] }, async (request, reply) => {
    const categories = await prisma.category.findMany({
      orderBy: { displayOrder: 'asc' },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    return reply.send({
      data: categories.map((c) => ({
        ...c,
        productsCount: c._count.products,
      })),
    });
  });

  // Criar categoria
  app.post('/', { preHandler: [app.authenticate] }, async (request, reply) => {
    const parseResult = CategorySchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.status(400).send({
        error: 'Dados inválidos',
        details: parseResult.error.flatten(),
      });
    }

    const { name, description, displayOrder, status } = parseResult.data;
    let slug = parseResult.data.slug ? slugify(parseResult.data.slug) : slugify(name);

    const existing = await prisma.category.findUnique({ where: { slug } });
    if (existing) {
      slug = `${slug}-${Math.floor(Math.random() * 1000)}`;
    }

    const category = await prisma.category.create({
      data: {
        name,
        slug,
        description: description || null,
        displayOrder,
        status,
      },
    });

    await app.logAudit('CREATE', 'Category', category.id, { name: category.name }, request);

    return reply.status(201).send({ category });
  });

  // Atualizar categoria
  app.put('/:id', { preHandler: [app.authenticate] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const parseResult = CategorySchema.partial().safeParse(request.body);
    if (!parseResult.success) {
      return reply.status(400).send({
        error: 'Dados inválidos',
        details: parseResult.error.flatten(),
      });
    }

    const data = parseResult.data;
    if (data.name && !data.slug) {
      data.slug = slugify(data.name);
    }

    const updated = await prisma.category.update({
      where: { id },
      data,
    });

    await app.logAudit('UPDATE', 'Category', id, { name: updated.name }, request);

    return reply.send({ category: updated });
  });

  // Excluir categoria
  app.delete('/:id', { preHandler: [app.authenticate] }, async (request, reply) => {
    const { id } = request.params as { id: string };

    await prisma.category.delete({ where: { id } });

    await app.logAudit('DELETE', 'Category', id, {}, request);

    return reply.send({ message: 'Categoria excluída com sucesso' });
  });
}
