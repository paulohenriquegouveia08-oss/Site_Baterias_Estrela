import { FastifyInstance } from 'fastify';
import { prisma } from '../../prisma';
import { SiteSettingsSchema } from '@baterias-estrela/shared';

export async function adminSettingsRoutes(app: FastifyInstance) {
  app.get('/', { preHandler: [app.authenticate] }, async (request, reply) => {
    let settings = await prisma.siteSettings.findFirst();
    if (!settings) {
      settings = await prisma.siteSettings.create({
        data: {},
      });
    }
    return reply.send({ settings });
  });

  app.put('/', { preHandler: [app.authenticate] }, async (request, reply) => {
    const parseResult = SiteSettingsSchema.partial().safeParse(request.body);
    if (!parseResult.success) {
      return reply.status(400).send({ error: 'Dados inválidos', details: parseResult.error.flatten() });
    }

    let settings = await prisma.siteSettings.findFirst();
    if (!settings) {
      settings = await prisma.siteSettings.create({
        data: parseResult.data,
      });
    } else {
      settings = await prisma.siteSettings.update({
        where: { id: settings.id },
        data: parseResult.data,
      });
    }

    await app.logAudit('UPDATE_SETTINGS', 'SiteSettings', settings.id, parseResult.data, request);

    return reply.send({ settings });
  });
}
