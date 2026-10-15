import { FastifyInstance } from 'fastify';
import { prisma } from '../../prisma';
import { ProductCreateSchema, ProductUpdateSchema, slugify } from '@baterias-estrela/shared';
import { saveFile, deleteFile } from '../../storage';
import { stringify } from 'csv-stringify/sync';
import { parse } from 'csv-parse/sync';

export async function adminProductsRoutes(app: FastifyInstance) {
  // Listar produtos (painel admin)
  app.get('/', { preHandler: [app.authenticate] }, async (request, reply) => {
    const query = request.query as {
      search?: string;
      status?: string;
      brand?: string;
      page?: string;
      limit?: string;
    };

    const page = Math.max(1, parseInt(query.page || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(query.limit || '20', 10)));
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query.status) {
      where.status = query.status;
    } else {
      where.status = { not: 'archived' };
    }

    if (query.brand) {
      where.brand = { equals: query.brand, mode: 'insensitive' };
    }

    if (query.search && query.search.trim()) {
      const term = query.search.trim();
      where.OR = [
        { name: { contains: term, mode: 'insensitive' } },
        { brand: { contains: term, mode: 'insensitive' } },
        { sku: { contains: term, mode: 'insensitive' } },
      ];
    }

    const [total, products] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ isFeatured: 'desc' }, { updatedAt: 'desc' }],
        include: {
          images: {
            orderBy: [{ isCover: 'desc' }, { displayOrder: 'asc' }],
          },
          categories: {
            include: { category: true },
          },
          _count: {
            select: { compatibilities: true },
          },
        },
      }),
    ]);

    const formatted = products.map((p) => ({
      ...p,
      categories: p.categories.map((c) => c.category),
      compatibilitiesCount: p._count.compatibilities,
    }));

    return reply.send({
      data: formatted,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  });

  // Obter produto por ID
  app.get('/:id', { preHandler: [app.authenticate] }, async (request, reply) => {
    const { id } = request.params as { id: string };

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        images: {
          orderBy: [{ isCover: 'desc' }, { displayOrder: 'asc' }],
        },
        categories: {
          include: { category: true },
        },
        compatibilities: {
          include: {
            vehicleVariant: {
              include: {
                model: {
                  include: { make: true },
                },
              },
            },
          },
        },
      },
    });

    if (!product) {
      return reply.status(404).send({ error: 'Produto não encontrado' });
    }

    return reply.send({
      product: {
        ...product,
        categories: product.categories.map((c) => c.category),
      },
    });
  });

  // Criar produto
  app.post('/', { preHandler: [app.authenticate] }, async (request, reply) => {
    const parseResult = ProductCreateSchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.status(400).send({
        error: 'Dados inválidos',
        details: parseResult.error.flatten(),
      });
    }

    const data = parseResult.data;
    let slug = data.slug ? slugify(data.slug) : slugify(`${data.brand}-${data.name}`);

    // Verifica se slug já existe
    const existing = await prisma.product.findUnique({ where: { slug } });
    if (existing) {
      slug = `${slug}-${Math.floor(Math.random() * 1000)}`;
    }

    const product = await prisma.product.create({
      data: {
        name: data.name,
        slug,
        sku: data.sku || null,
        brand: data.brand,
        description: data.description,
        amperageAh: data.amperageAh,
        voltageV: data.voltageV,
        ccaA: data.ccaA || null,
        dimensionsMm: data.dimensionsMm || null,
        warrantyMonths: data.warrantyMonths || null,
        polarity: data.polarity,
        technology: data.technology,
        isFeatured: data.isFeatured,
        stockStatus: data.stockStatus,
        status: data.status,
        internalCostNotes: data.internalCostNotes || null,
        categories: {
          create: data.categoryIds.map((categoryId) => ({ categoryId })),
        },
      },
    });

    await app.logAudit('CREATE', 'Product', product.id, { name: product.name, sku: product.sku }, request);

    return reply.status(201).send({ product });
  });

  // Atualizar produto
  app.put('/:id', { preHandler: [app.authenticate] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const parseResult = ProductUpdateSchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.status(400).send({
        error: 'Dados inválidos',
        details: parseResult.error.flatten(),
      });
    }

    const data = parseResult.data;

    // Atualiza relações de categoria se informadas
    if (data.categoryIds) {
      await prisma.productCategory.deleteMany({ where: { productId: id } });
      if (data.categoryIds.length > 0) {
        await prisma.productCategory.createMany({
          data: data.categoryIds.map((categoryId) => ({ productId: id, categoryId })),
        });
      }
    }

    const updateData: any = { ...data };
    delete updateData.categoryIds;

    if (data.slug) {
      updateData.slug = slugify(data.slug);
    }

    const updated = await prisma.product.update({
      where: { id },
      data: updateData,
    });

    await app.logAudit('UPDATE', 'Product', id, { name: updated.name }, request);

    return reply.send({ product: updated });
  });

  // Arquivar / Soft delete produto
  app.delete('/:id', { preHandler: [app.authenticate] }, async (request, reply) => {
    const { id } = request.params as { id: string };

    const archived = await prisma.product.update({
      where: { id },
      data: {
        status: 'archived',
        deletedAt: new Date(),
      },
    });

    await app.logAudit('ARCHIVE', 'Product', id, { name: archived.name }, request);

    return reply.send({ message: 'Produto arquivado com sucesso' });
  });

  // Upload de Imagem de Produto
  app.post('/:id/images', { preHandler: [app.authenticate] }, async (request, reply) => {
    const { id } = request.params as { id: string };

    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) {
      return reply.status(404).send({ error: 'Produto não encontrado' });
    }

    const data = await request.file();
    if (!data) {
      return reply.status(400).send({ error: 'Nenhum arquivo enviado' });
    }

    try {
      const buffer = await data.toBuffer();
      const uploadResult = await saveFile(buffer, data.filename, data.mimetype, `products/${id}`);

      // Verifica se já tem alguma imagem capa
      const hasCover = await prisma.productImage.findFirst({
        where: { productId: id, isCover: true },
      });

      // Conta imagens atuais para definir displayOrder
      const currentImagesCount = await prisma.productImage.count({ where: { productId: id } });

      const image = await prisma.productImage.create({
        data: {
          productId: id,
          url: uploadResult.url,
          fileKey: uploadResult.fileKey,
          displayOrder: currentImagesCount + 1,
          isCover: !hasCover, // primeira imagem é capa automaticamente
        },
      });

      await app.logAudit('UPLOAD_IMAGE', 'ProductImage', image.id, { productId: id }, request);

      return reply.status(201).send({ image });
    } catch (err: any) {
      return reply.status(400).send({ error: err.message || 'Falha ao processar imagem' });
    }
  });

  // Definir capa ou reordenar imagem
  app.put('/:id/images/:imageId', { preHandler: [app.authenticate] }, async (request, reply) => {
    const { id, imageId } = request.params as { id: string; imageId: string };
    const body = request.body as { isCover?: boolean; displayOrder?: number; altText?: string };

    if (body.isCover) {
      // Remove capa das outras imagens deste produto
      await prisma.productImage.updateMany({
        where: { productId: id },
        data: { isCover: false },
      });
    }

    const updated = await prisma.productImage.update({
      where: { id: imageId },
      data: {
        isCover: body.isCover !== undefined ? body.isCover : undefined,
        displayOrder: body.displayOrder !== undefined ? body.displayOrder : undefined,
        altText: body.altText !== undefined ? body.altText : undefined,
      },
    });

    return reply.send({ image: updated });
  });

  // Remover imagem de produto
  app.delete('/:id/images/:imageId', { preHandler: [app.authenticate] }, async (request, reply) => {
    const { id, imageId } = request.params as { id: string; imageId: string };

    const image = await prisma.productImage.findUnique({
      where: { id: imageId },
    });

    if (!image || image.productId !== id) {
      return reply.status(404).send({ error: 'Imagem não encontrada' });
    }

    if (image.fileKey) {
      await deleteFile(image.fileKey);
    }

    await prisma.productImage.delete({ where: { id: imageId } });

    // Se a imagem deletada era capa, define a primeira restante como capa
    if (image.isCover) {
      const nextCover = await prisma.productImage.findFirst({
        where: { productId: id },
        orderBy: { displayOrder: 'asc' },
      });
      if (nextCover) {
        await prisma.productImage.update({
          where: { id: nextCover.id },
          data: { isCover: true },
        });
      }
    }

    await app.logAudit('DELETE_IMAGE', 'ProductImage', imageId, { productId: id }, request);

    return reply.send({ message: 'Imagem removida com sucesso' });
  });

  // Associar compatibilidade de veículo ao produto
  app.post('/:id/compatibilities', { preHandler: [app.authenticate] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = request.body as {
      vehicleVariantId: string;
      technicalNotes?: string;
      validationStatus?: string;
      validationSource?: string;
    };

    if (!body.vehicleVariantId) {
      return reply.status(400).send({ error: 'vehicleVariantId é obrigatório' });
    }

    const compat = await prisma.productCompatibility.upsert({
      where: {
        productId_vehicleVariantId: {
          productId: id,
          vehicleVariantId: body.vehicleVariantId,
        },
      },
      update: {
        technicalNotes: body.technicalNotes || null,
        validationStatus: body.validationStatus || 'verified',
        validationSource: body.validationSource || null,
      },
      create: {
        productId: id,
        vehicleVariantId: body.vehicleVariantId,
        technicalNotes: body.technicalNotes || null,
        validationStatus: body.validationStatus || 'verified',
        validationSource: body.validationSource || null,
      },
      include: {
        vehicleVariant: {
          include: {
            model: {
              include: { make: true },
            },
          },
        },
      },
    });

    await app.logAudit('ADD_COMPATIBILITY', 'ProductCompatibility', compat.id, { productId: id }, request);

    return reply.status(201).send({ compatibility: compat });
  });

  // Remover compatibilidade de veículo do produto
  app.delete('/:id/compatibilities/:variantId', { preHandler: [app.authenticate] }, async (request, reply) => {
    const { id, variantId } = request.params as { id: string; variantId: string };

    await prisma.productCompatibility.deleteMany({
      where: {
        productId: id,
        vehicleVariantId: variantId,
      },
    });

    await app.logAudit('REMOVE_COMPATIBILITY', 'ProductCompatibility', null, { productId: id, variantId }, request);

    return reply.send({ message: 'Compatibilidade removida com sucesso' });
  });

  // Exportar produtos em CSV
  app.get('/export-csv', { preHandler: [app.authenticate] }, async (request, reply) => {
    const products = await prisma.product.findMany({
      where: { status: { not: 'archived' } },
      orderBy: { name: 'asc' },
    });

    const records = products.map((p) => ({
      ID: p.id,
      Nome: p.name,
      SKU: p.sku || '',
      Marca: p.brand,
      Amperagem_Ah: p.amperageAh,
      Voltagem_V: p.voltageV,
      CCA_A: p.ccaA || '',
      Dimensoes: p.dimensionsMm || '',
      Garantia_Meses: p.warrantyMonths || '',
      Polo: p.polarity,
      Tecnologia: p.technology,
      Destaque: p.isFeatured ? 'SIM' : 'NAO',
      Estoque: p.stockStatus,
      Status: p.status,
      Descricao: p.description,
    }));

    const csvContent = stringify(records, { header: true, delimiter: ';' });

    reply.header('Content-Type', 'text/csv; charset=utf-8');
    reply.header('Content-Disposition', 'attachment; filename="produtos-baterias-estrela.csv"');
    return reply.send(csvContent);
  });

  // Importar produtos via CSV com validação
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
      return reply.status(400).send({ error: `Erro de sintaxe no arquivo CSV: ${err.message}` });
    }

    const report = {
      totalRows: records.length,
      created: 0,
      updated: 0,
      errors: [] as Array<{ row: number; error: string; data: any }>,
    };

    let rowIndex = 1;
    for (const row of records) {
      rowIndex++;
      const name = row.Nome || row.name || row.nome;
      const brand = row.Marca || row.brand || row.marca;
      const amperage = parseFloat(row.Amperagem_Ah || row.amperageAh || row.amperagem);

      if (!name || !brand || isNaN(amperage)) {
        report.errors.push({
          row: rowIndex,
          error: 'Campos obrigatórios ausentes: Nome, Marca ou Amperagem inválida',
          data: row,
        });
        continue;
      }

      const sku = row.SKU || row.sku || null;
      const slug = slugify(`${brand}-${name}`);

      try {
        const existing = sku
          ? await prisma.product.findFirst({ where: { sku } })
          : await prisma.product.findUnique({ where: { slug } });

        if (existing) {
          await prisma.product.update({
            where: { id: existing.id },
            data: {
              name,
              brand,
              amperageAh: amperage,
              description: row.Descricao || row.description || existing.description,
            },
          });
          report.updated++;
        } else {
          await prisma.product.create({
            data: {
              name,
              slug: `${slug}-${Math.floor(Math.random() * 1000)}`,
              sku,
              brand,
              description: row.Descricao || row.description || `Bateria ${brand} ${amperage}Ah`,
              amperageAh: amperage,
              voltageV: 12,
              polarity: row.Polo || 'POSITIVE_RIGHT',
              technology: row.Tecnologia || 'SLI',
              stockStatus: 'in_stock',
              status: 'active',
            },
          });
          report.created++;
        }
      } catch (err: any) {
        report.errors.push({
          row: rowIndex,
          error: err.message,
          data: row,
        });
      }
    }

    await app.logAudit('IMPORT_CSV', 'Product', null, { report }, request);

    return reply.send({
      message: `Importação processada: ${report.created} criados, ${report.updated} atualizados, ${report.errors.length} erros`,
      report,
    });
  });
}
