import { FastifyInstance } from 'fastify';
import { prisma } from '../../prisma';

export async function publicSettingsRoutes(app: FastifyInstance) {
  app.get('/public', async (request, reply) => {
    let settings = await prisma.siteSettings.findFirst();

    if (!settings) {
      settings = await prisma.siteSettings.create({
        data: {
          storeName: 'Baterias Estrela',
          tagline: 'Sua loja de baterias automotivas em Arapongas - PR',
          address: 'Rua Taperaçu 165, Vila Sampaio',
          city: 'Arapongas',
          state: 'PR',
          postalCode: '86700-000',
          workingHours: 'Segunda a Sexta: 08h às 18h | Sábado: 08h às 12h30',
        },
      });
    }

    const contacts = await prisma.contactChannel.findMany({
      where: { status: 'active' },
      orderBy: { displayOrder: 'asc' },
      select: {
        id: true,
        label: true,
        number: true,
        type: true,
        placement: true,
        isDefault: true,
        displayOrder: true,
      },
    });

    const defaultWhatsApp = contacts.find((c) => c.type === 'whatsapp' && c.isDefault) ||
      contacts.find((c) => c.type === 'whatsapp') || {
        number: '43996110253',
        label: 'WhatsApp Baterias Estrela',
      };

    const defaultPhone = contacts.find((c) => c.type === 'phone' && c.isDefault) ||
      contacts.find((c) => c.type === 'phone') || {
        number: '43996110253',
        label: 'Telefone Baterias Estrela',
      };

    return reply.send({
      settings: {
        storeName: settings.storeName,
        tagline: settings.tagline,
        address: settings.address,
        city: settings.city,
        state: settings.state,
        postalCode: settings.postalCode,
        workingHours: settings.workingHours,
        email: settings.email,
        facebookUrl: settings.facebookUrl,
        instagramUrl: settings.instagramUrl,
        googleMapsUrl: settings.googleMapsUrl,
        homeHeroTitle: settings.homeHeroTitle,
        homeHeroSubtitle: settings.homeHeroSubtitle,
        seoTitle: settings.seoTitle,
        seoDescription: settings.seoDescription,
      },
      contacts,
      defaultWhatsApp,
      defaultPhone,
    });
  });
}
