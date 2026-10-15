import { FastifyInstance } from 'fastify';
import { prisma } from '../../prisma';

export async function publicVehiclesRoutes(app: FastifyInstance) {
  // Fabricantes
  app.get('/makes', async (request, reply) => {
    const makes = await prisma.vehicleMake.findMany({
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        slug: true,
        _count: {
          select: { models: true },
        },
      },
    });

    return reply.send({ data: makes });
  });

  // Modelos por fabricante
  app.get('/models', async (request, reply) => {
    const { makeId, makeSlug } = request.query as { makeId?: string; makeSlug?: string };

    const where: any = {};
    if (makeId) {
      where.makeId = makeId;
    } else if (makeSlug) {
      where.make = { slug: makeSlug };
    }

    const models = await prisma.vehicleModel.findMany({
      where,
      orderBy: { name: 'asc' },
      select: {
        id: true,
        makeId: true,
        name: true,
        slug: true,
        make: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    return reply.send({ data: models });
  });

  // Variantes/versões por modelo e ano
  app.get('/variants', async (request, reply) => {
    const { modelId, year } = request.query as { modelId?: string; year?: string };

    if (!modelId) {
      return reply.status(400).send({ error: 'Parâmetro modelId é obrigatório' });
    }

    const where: any = { modelId };

    if (year) {
      const yearNum = parseInt(year, 10);
      if (!isNaN(yearNum)) {
        where.yearStart = { lte: yearNum };
        where.OR = [
          { yearEnd: null },
          { yearEnd: { gte: yearNum } },
        ];
      }
    }

    const variants = await prisma.vehicleVariant.findMany({
      where,
      orderBy: [{ yearStart: 'desc' }, { name: 'asc' }],
      select: {
        id: true,
        modelId: true,
        name: true,
        yearStart: true,
        yearEnd: true,
        engine: true,
        fuel: true,
        version: true,
        technicalNotes: true,
        model: {
          select: {
            id: true,
            name: true,
            make: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    const formatted = variants.map((v) => ({
      id: v.id,
      modelId: v.modelId,
      name: v.name,
      yearStart: v.yearStart,
      yearEnd: v.yearEnd,
      engine: v.engine,
      fuel: v.fuel,
      version: v.version,
      technicalNotes: v.technicalNotes,
      makeName: v.model.make.name,
      modelName: v.model.name,
    }));

    return reply.send({ data: formatted });
  });

  // Buscar produtos compatíveis com uma variante específica
  app.get('/variants/:id/products', async (request, reply) => {
    const { id } = request.params as { id: string };

    const variant = await prisma.vehicleVariant.findUnique({
      where: { id },
      include: {
        model: {
          include: {
            make: true,
          },
        },
      },
    });

    if (!variant) {
      return reply.status(404).send({
        error: 'Veículo não encontrado',
        message: 'A versão do veículo informada não consta no banco de dados.',
      });
    }

    // Busca apenas compatibilidades COM STATUS 'verified'
    const compatibilities = await prisma.productCompatibility.findMany({
      where: {
        vehicleVariantId: id,
        validationStatus: 'verified',
        product: {
          status: 'active',
          deletedAt: null,
        },
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            sku: true,
            brand: true,
            description: true,
            amperageAh: true,
            voltageV: true,
            ccaA: true,
            dimensionsMm: true,
            warrantyMonths: true,
            polarity: true,
            technology: true,
            isFeatured: true,
            stockStatus: true,
            createdAt: true,
            images: {
              orderBy: [{ isCover: 'desc' }, { displayOrder: 'asc' }],
              select: {
                id: true,
                url: true,
                altText: true,
                displayOrder: true,
                isCover: true,
              },
            },
          },
        },
      },
    });

    const products = compatibilities.map((c) => ({
      ...c.product,
      compatibilityNotes: c.technicalNotes,
      validationSource: c.validationSource,
    }));

    const vehicleFullName = `${variant.model.make.name} ${variant.model.name} ${variant.name} (${variant.yearStart}${variant.yearEnd ? `-${variant.yearEnd}` : '+'})`;

    return reply.send({
      matched: products.length > 0,
      count: products.length,
      vehicle: {
        id: variant.id,
        makeName: variant.model.make.name,
        modelName: variant.model.name,
        variantName: variant.name,
        fullName: vehicleFullName,
        years: variant.yearEnd ? `${variant.yearStart} a ${variant.yearEnd}` : `${variant.yearStart} em diante`,
        technicalNotes: variant.technicalNotes,
      },
      products,
      message: products.length > 0
        ? `Encontramos ${products.length} bateria(s) com compatibilidade técnica validada para o seu veículo.`
        : 'Não foi possível confirmar automaticamente a compatibilidade para esta versão. Nossos especialistas na loja física em Arapongas podem verificar a amperagem exata da sua bateria original pelo WhatsApp.',
    });
  });
}
