import { FastifyInstance } from 'fastify';
import { prisma } from '../../prisma';
import {
  VehicleMakeSchema,
  VehicleModelSchema,
  VehicleVariantSchema,
  slugify,
} from '@baterias-estrela/shared';
import { stringify } from 'csv-stringify/sync';
import { parse } from 'csv-parse/sync';

export async function adminVehiclesRoutes(app: FastifyInstance) {
  // --- FABRICANTES (MAKES) ---
  app.get('/makes', { preHandler: [app.authenticate] }, async (request, reply) => {
    const makes = await prisma.vehicleMake.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: { select: { models: true } },
      },
    });
    return reply.send({ data: makes });
  });

  app.post('/makes', { preHandler: [app.authenticate] }, async (request, reply) => {
    const parseResult = VehicleMakeSchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.status(400).send({ error: 'Dados inválidos', details: parseResult.error.flatten() });
    }

    const { name } = parseResult.data;
    const slug = parseResult.data.slug ? slugify(parseResult.data.slug) : slugify(name);

    const make = await prisma.vehicleMake.create({
      data: { name, slug },
    });

    await app.logAudit('CREATE', 'VehicleMake', make.id, { name }, request);
    return reply.status(201).send({ make });
  });

  app.delete('/makes/:id', { preHandler: [app.authenticate] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    await prisma.vehicleMake.delete({ where: { id } });
    await app.logAudit('DELETE', 'VehicleMake', id, {}, request);
    return reply.send({ message: 'Fabricante removido com sucesso' });
  });

  // --- MODELOS (MODELS) ---
  app.get('/models', { preHandler: [app.authenticate] }, async (request, reply) => {
    const { makeId } = request.query as { makeId?: string };
    const where = makeId ? { makeId } : {};

    const models = await prisma.vehicleModel.findMany({
      where,
      orderBy: [{ make: { name: 'asc' } }, { name: 'asc' }],
      include: {
        make: true,
        _count: { select: { variants: true } },
      },
    });
    return reply.send({ data: models });
  });

  app.post('/models', { preHandler: [app.authenticate] }, async (request, reply) => {
    const parseResult = VehicleModelSchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.status(400).send({ error: 'Dados inválidos', details: parseResult.error.flatten() });
    }

    const { makeId, name } = parseResult.data;
    const slug = parseResult.data.slug ? slugify(parseResult.data.slug) : slugify(name);

    const model = await prisma.vehicleModel.create({
      data: { makeId, name, slug },
      include: { make: true },
    });

    await app.logAudit('CREATE', 'VehicleModel', model.id, { name, makeId }, request);
    return reply.status(201).send({ model });
  });

  app.delete('/models/:id', { preHandler: [app.authenticate] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    await prisma.vehicleModel.delete({ where: { id } });
    await app.logAudit('DELETE', 'VehicleModel', id, {}, request);
    return reply.send({ message: 'Modelo removido com sucesso' });
  });

  // --- VARIANTES / VERSÕES ---
  app.get('/variants', { preHandler: [app.authenticate] }, async (request, reply) => {
    const { modelId, search } = request.query as { modelId?: string; search?: string };
    const where: any = {};
    if (modelId) where.modelId = modelId;
    if (search && search.trim()) {
      const term = search.trim();
      where.OR = [
        { name: { contains: term, mode: 'insensitive' } },
        { engine: { contains: term, mode: 'insensitive' } },
        { model: { name: { contains: term, mode: 'insensitive' } } },
      ];
    }

    const variants = await prisma.vehicleVariant.findMany({
      where,
      orderBy: [{ model: { name: 'asc' } }, { yearStart: 'desc' }],
      include: {
        model: {
          include: { make: true },
        },
        _count: {
          select: { compatibilities: true },
        },
      },
      take: 100,
    });

    return reply.send({
      data: variants.map((v) => ({
        ...v,
        makeName: v.model.make.name,
        modelName: v.model.name,
        compatibilitiesCount: v._count.compatibilities,
      })),
    });
  });

  app.post('/variants', { preHandler: [app.authenticate] }, async (request, reply) => {
    const parseResult = VehicleVariantSchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.status(400).send({ error: 'Dados inválidos', details: parseResult.error.flatten() });
    }

    const variant = await prisma.vehicleVariant.create({
      data: parseResult.data,
      include: {
        model: { include: { make: true } },
      },
    });

    await app.logAudit('CREATE', 'VehicleVariant', variant.id, { name: variant.name }, request);
    return reply.status(201).send({ variant });
  });

  app.put('/variants/:id', { preHandler: [app.authenticate] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const parseResult = VehicleVariantSchema.partial().safeParse(request.body);
    if (!parseResult.success) {
      return reply.status(400).send({ error: 'Dados inválidos', details: parseResult.error.flatten() });
    }

    const updated = await prisma.vehicleVariant.update({
      where: { id },
      data: parseResult.data,
      include: {
        model: { include: { make: true } },
      },
    });

    await app.logAudit('UPDATE', 'VehicleVariant', id, { name: updated.name }, request);
    return reply.send({ variant: updated });
  });

  app.delete('/variants/:id', { preHandler: [app.authenticate] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    await prisma.vehicleVariant.delete({ where: { id } });
    await app.logAudit('DELETE', 'VehicleVariant', id, {}, request);
    return reply.send({ message: 'Versão do veículo removida com sucesso' });
  });

  // --- IMPORTAÇÃO / EXPORTAÇÃO CSV DE VEÍCULOS ---
  app.get('/export-csv', { preHandler: [app.authenticate] }, async (request, reply) => {
    const variants = await prisma.vehicleVariant.findMany({
      orderBy: [
        { model: { make: { name: 'asc' } } },
        { model: { name: 'asc' } },
        { yearStart: 'desc' },
      ],
      include: {
        model: { include: { make: true } },
        compatibilities: {
          include: { product: true },
        },
      },
    });

    const records: any[] = [];
    for (const v of variants) {
      const compatsStr = v.compatibilities.map((c) => c.product.name).join(' | ');
      records.push({
        Fabricante: v.model.make.name,
        Modelo: v.model.name,
        Versao_Motor: v.name,
        Ano_Inicio: v.yearStart,
        Ano_Fim: v.yearEnd || '',
        Motorizacao: v.engine || '',
        Combustivel: v.fuel || '',
        Observacoes: v.technicalNotes || '',
        Baterias_Compativeis: compatsStr,
      });
    }

    const csvContent = stringify(records, { header: true, delimiter: ';' });
    reply.header('Content-Type', 'text/csv; charset=utf-8');
    reply.header('Content-Disposition', 'attachment; filename="veiculos-compatibilidades.csv"');
    return reply.send(csvContent);
  });

  app.post('/import-csv', { preHandler: [app.authenticate] }, async (request, reply) => {
    const data = await request.file();
    if (!data) {
      return reply.status(400).send({ error: 'Arquivo CSV obrigatório' });
    }

    const buffer = await data.toBuffer();
    let records: any[];
    try {
      records = parse(buffer, {
        columns: true,
        skip_empty_lines: true,
        delimiter: [',', ';'],
        trim: true,
      });
    } catch (err: any) {
      return reply.status(400).send({ error: `Erro no CSV: ${err.message}` });
    }

    const report = {
      totalRows: records.length,
      createdVariants: 0,
      existingSkipped: 0,
      errors: [] as Array<{ row: number; error: string; data: any }>,
    };

    let rowIndex = 1;
    for (const row of records) {
      rowIndex++;
      const makeName = (row.Fabricante || row.make || '').trim();
      const modelName = (row.Modelo || row.model || '').trim();
      const variantName = (row.Versao_Motor || row.versao || row.name || '').trim();
      const yearStart = parseInt(row.Ano_Inicio || row.yearStart, 10);

      if (!makeName || !modelName || !variantName || isNaN(yearStart)) {
        report.errors.push({
          row: rowIndex,
          error: 'Campos obrigatórios ausentes: Fabricante, Modelo, Versao_Motor ou Ano_Inicio',
          data: row,
        });
        continue;
      }

      try {
        // 1. Make
        const makeSlug = slugify(makeName);
        const make = await prisma.vehicleMake.upsert({
          where: { slug: makeSlug },
          update: {},
          create: { name: makeName, slug: makeSlug },
        });

        // 2. Model
        const modelSlug = slugify(modelName);
        const model = await prisma.vehicleModel.upsert({
          where: { makeId_slug: { makeId: make.id, slug: modelSlug } },
          update: {},
          create: { makeId: make.id, name: modelName, slug: modelSlug },
        });

        // 3. Variant (check if already exists)
        const yearEnd = row.Ano_Fim ? parseInt(row.Ano_Fim, 10) : null;
        const existingVariant = await prisma.vehicleVariant.findFirst({
          where: {
            modelId: model.id,
            name: variantName,
            yearStart,
          },
        });

        if (existingVariant) {
          report.existingSkipped++;
        } else {
          await prisma.vehicleVariant.create({
            data: {
              modelId: model.id,
              name: variantName,
              yearStart,
              yearEnd: isNaN(yearEnd as number) ? null : yearEnd,
              engine: row.Motorizacao || null,
              fuel: row.Combustivel || null,
              technicalNotes: row.Observacoes || null,
            },
          });
          report.createdVariants++;
        }
      } catch (err: any) {
        report.errors.push({
          row: rowIndex,
          error: err.message,
          data: row,
        });
      }
    }

    await app.logAudit('IMPORT_VEHICLES_CSV', 'VehicleVariant', null, { report }, request);

    return reply.send({
      message: `Processado: ${report.createdVariants} versões criadas, ${report.existingSkipped} já existiam, ${report.errors.length} erros`,
      report,
    });
  });
}
