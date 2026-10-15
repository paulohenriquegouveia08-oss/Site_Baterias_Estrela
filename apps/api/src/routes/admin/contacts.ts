import { FastifyInstance } from 'fastify';
import { prisma } from '../../prisma';
import { ContactChannelSchema } from '@baterias-estrela/shared';

export async function adminContactsRoutes(app: FastifyInstance) {
  app.get('/', { preHandler: [app.authenticate] }, async (request, reply) => {
    const contacts = await prisma.contactChannel.findMany({
      orderBy: { displayOrder: 'asc' },
    });
    return reply.send({ data: contacts });
  });

  app.post('/', { preHandler: [app.authenticate] }, async (request, reply) => {
    const parseResult = ContactChannelSchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.status(400).send({ error: 'Dados inválidos', details: parseResult.error.flatten() });
    }

    const data = parseResult.data;

    // Se marcado como padrão, desmarca outros do mesmo tipo
    if (data.isDefault) {
      await prisma.contactChannel.updateMany({
        where: { type: data.type },
        data: { isDefault: false },
      });
    }

    const contact = await prisma.contactChannel.create({
      data,
    });

    await app.logAudit('CREATE', 'ContactChannel', contact.id, { label: contact.label, number: contact.number }, request);
    return reply.status(201).send({ contact });
  });

  app.put('/:id', { preHandler: [app.authenticate] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const parseResult = ContactChannelSchema.partial().safeParse(request.body);
    if (!parseResult.success) {
      return reply.status(400).send({ error: 'Dados inválidos', details: parseResult.error.flatten() });
    }

    const data = parseResult.data;

    if (data.isDefault && data.type) {
      await prisma.contactChannel.updateMany({
        where: { type: data.type, id: { not: id } },
        data: { isDefault: false },
      });
    }

    const updated = await prisma.contactChannel.update({
      where: { id },
      data,
    });

    await app.logAudit('UPDATE', 'ContactChannel', id, { label: updated.label }, request);
    return reply.send({ contact: updated });
  });

  app.delete('/:id', { preHandler: [app.authenticate] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    await prisma.contactChannel.delete({ where: { id } });
    await app.logAudit('DELETE', 'ContactChannel', id, {}, request);
    return reply.send({ message: 'Canal de contato removido com sucesso' });
  });
}
