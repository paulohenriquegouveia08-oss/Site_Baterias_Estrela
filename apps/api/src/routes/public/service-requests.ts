import { FastifyInstance } from 'fastify';
import { prisma } from '../../prisma';
import { ServiceRequestSchema } from '@baterias-estrela/shared';

export async function publicServiceRequestsRoutes(app: FastifyInstance) {
  app.post('/', async (request, reply) => {
    const parseResult = ServiceRequestSchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.status(400).send({
        error: 'Dados incompletos',
        details: parseResult.error.flatten(),
      });
    }

    const { name, phone, serviceId, vehicle, notes, addressReference } = parseResult.data;

    const req = await prisma.serviceRequest.create({
      data: {
        name,
        phone,
        serviceId: serviceId || null,
        vehicle: vehicle || null,
        notes: notes || null,
        addressReference: addressReference || null,
        status: 'new',
      },
    });

    return reply.status(201).send({
      message: 'Solicitação registrada com sucesso! Nossa equipe entrará em contato.',
      id: req.id,
    });
  });
}
