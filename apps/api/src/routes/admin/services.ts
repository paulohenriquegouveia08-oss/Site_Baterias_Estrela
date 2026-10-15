import { FastifyInstance } from 'fastify';
import { prisma } from '../../prisma';
import { ServiceSchema, slugify } from '@baterias-estrela/shared';

export async function adminServicesRoutes(app: FastifyInstance) {
  app.get('/', { preHandler: [app.authenticate] }, async (request, reply) => {
    const services = await prisma.service.findMany({
      orderBy: { displayOrder: 'asc' },
    });
    return reply.send({ data: services });
  });

  app.post('/', { preHandler: [app.authenticate] }, async (request, reply) => {
    const parseResult = ServiceSchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.status(400).send({ error: 'Dados inválidos', details: parseResult.error.flatten() });
    }

    const data = parseResult.data;
    let slug = data.slug ? slugify(data.slug) : slugify(data.name);
    const existing = await prisma.service.findUnique({ where: { slug } });
    if (existing) {
      slug = `${slug}-${Math.floor(Math.random() * 1000)}`;
    }

    const service = await prisma.service.create({
      data: {
        ...data,
        slug,
      },
    });

    await app.logAudit('CREATE', 'Service', service.id, { name: service.name }, request);
    return reply.status(201).send({ service });
  });

  app.put('/:id', { preHandler: [app.authenticate] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const parseResult = ServiceSchema.partial().safeParse(request.body);
    if (!parseResult.success) {
      return reply.status(400).send({ error: 'Dados inválidos', details: parseResult.error.flatten() });
    }

    const data = parseResult.data;
    if (data.name && !data.slug) {
      data.slug = slugify(data.name);
    }

    const updated = await prisma.service.update({
      where: { id },
      data,
    });

    await app.logAudit('UPDATE', 'Service', id, { name: updated.name }, request);
    return reply.send({ service: updated });
  });

  app.delete('/:id', { preHandler: [app.authenticate] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    await prisma.service.delete({ where: { id } });
    await app.logAudit('DELETE', 'Service', id, {}, request);
    return reply.send({ message: 'Serviço removido com sucesso' });
  });
}
