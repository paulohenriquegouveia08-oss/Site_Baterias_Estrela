import { FastifyInstance, FastifyPluginAsync, FastifyReply, FastifyRequest } from 'fastify';
import fp from 'fastify-plugin';
import { prisma } from '../prisma';

export interface AdminUserPayload {
  id: string;
  email: string;
  name: string;
  role: string;
}

declare module 'fastify' {
  interface FastifyRequest {
    adminUser?: AdminUserPayload;
  }
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
    logAudit: (
      action: string,
      entityType: string,
      entityId?: string | null,
      details?: any,
      request?: FastifyRequest
    ) => Promise<void>;
  }
}

const authPluginAsync: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  fastify.decorate('authenticate', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      // 1. Tenta obter token do cookie seguro HttpOnly ou do Header Authorization
      let token = request.cookies.admin_token;
      if (!token && request.headers.authorization) {
        const parts = request.headers.authorization.split(' ');
        if (parts.length === 2 && parts[0] === 'Bearer') {
          token = parts[1];
        }
      }

      if (!token) {
        return reply.status(401).send({
          error: 'Não autorizado',
          message: 'Sessão inválida ou expirada. Faça login novamente.',
        });
      }

      const decoded = await fastify.jwt.verify<AdminUserPayload>(token);

      // Verifica se o usuário ainda existe e está ativo no banco
      const user = await prisma.adminUser.findUnique({
        where: { id: decoded.id },
        select: { id: true, email: true, name: true, role: true, isActive: true },
      });

      if (!user || !user.isActive) {
        return reply.status(401).send({
          error: 'Não autorizado',
          message: 'Conta administrativa inativa ou inexistente.',
        });
      }

      request.adminUser = {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      };
    } catch {
      return reply.status(401).send({
        error: 'Não autorizado',
        message: 'Token de autenticação inválido ou expirado.',
      });
    }
  });

  fastify.decorate(
    'logAudit',
    async (
      action: string,
      entityType: string,
      entityId?: string | null,
      details?: any,
      request?: FastifyRequest
    ) => {
      try {
        await prisma.adminAuditLog.create({
          data: {
            adminUserId: request?.adminUser?.id || null,
            action,
            entityType,
            entityId: entityId || null,
            details: details || null,
            ipAddress: request?.ip || null,
            userAgent: (request?.headers['user-agent'] as string) || null,
          },
        });
      } catch (err) {
        console.error('Falha ao registrar log de auditoria:', err);
      }
    }
  );
};

export const authPlugin = fp(authPluginAsync);
