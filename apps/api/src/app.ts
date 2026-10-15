import fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import cookie from '@fastify/cookie';
import jwt from '@fastify/jwt';
import rateLimit from '@fastify/rate-limit';
import multipart from '@fastify/multipart';
import fastifyStatic from '@fastify/static';
import { env, resolvedUploadDir } from './config';
import { initStorage } from './storage';
import { authPlugin } from './plugins/auth';

// Rotas públicas
import { authRoutes } from './routes/auth';
import { publicProductsRoutes } from './routes/public/products';
import { publicCategoriesRoutes } from './routes/public/categories';
import { publicVehiclesRoutes } from './routes/public/vehicles';
import { publicServicesRoutes } from './routes/public/services';
import { publicSettingsRoutes } from './routes/public/settings';
import { publicServiceRequestsRoutes } from './routes/public/service-requests';
import { publicAnalyticsRoutes } from './routes/public/analytics';

// Rotas administrativas
import { adminDashboardRoutes } from './routes/admin/dashboard';
import { adminProductsRoutes } from './routes/admin/products';
import { adminCategoriesRoutes } from './routes/admin/categories';
import { adminVehiclesRoutes } from './routes/admin/vehicles';
import { adminServicesRoutes } from './routes/admin/services';
import { adminContactsRoutes } from './routes/admin/contacts';
import { adminSettingsRoutes } from './routes/admin/settings';
import { adminAuditRoutes } from './routes/admin/audit';
import { adminServiceRequestsRoutes } from './routes/admin/service-requests';

export async function buildApp(): Promise<FastifyInstance> {
  await initStorage();

  const app = fastify({
    logger: false,
    trustProxy: true,
  });

  // CORS
  await app.register(cors, {
    origin: (origin, cb) => {
      // Permite mesma origem, localhost em dev, ou frontend
      if (!origin || origin.includes('localhost') || origin.includes('127.0.0.1')) {
        cb(null, true);
        return;
      }
      cb(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  });

  // Cookies & JWT
  await app.register(cookie, {
    secret: env.COOKIE_SECRET,
    hook: 'onRequest',
  });

  await app.register(jwt, {
    secret: env.JWT_SECRET,
  });

  // Rate Limiting padrão
  await app.register(rateLimit, {
    max: 200,
    timeWindow: '1 minute',
  });

  // Multipart uploads (limite de 10MB)
  await app.register(multipart, {
    limits: {
      fileSize: 10 * 1024 * 1024,
    },
  });

  // Servir uploads locais quando STORAGE_DRIVER for 'local'
  if (env.STORAGE_DRIVER === 'local') {
    await app.register(fastifyStatic, {
      root: resolvedUploadDir,
      prefix: '/uploads/',
      decorateReply: false,
    });
  }

  // Plugin de autenticação customizado
  await app.register(authPlugin);

  // Health check
  app.get('/health', async () => ({ status: 'ok', store: 'Baterias Estrela', time: new Date().toISOString() }));

  // Agrupamento de rotas versionadas /api/v1
  await app.register(
    async (v1) => {
      // Autenticação
      await v1.register(authRoutes, { prefix: '/auth' });

      // Públicas
      await v1.register(publicProductsRoutes, { prefix: '/products' });
      await v1.register(publicCategoriesRoutes, { prefix: '/categories' });
      await v1.register(publicVehiclesRoutes, { prefix: '/vehicles' });
      await v1.register(publicServicesRoutes, { prefix: '/services' });
      await v1.register(publicSettingsRoutes, { prefix: '/settings' });
      await v1.register(publicServiceRequestsRoutes, { prefix: '/service-requests' });
      await v1.register(publicAnalyticsRoutes, { prefix: '/analytics' });

      // Administrativas (/api/v1/admin/*)
      await v1.register(adminDashboardRoutes, { prefix: '/admin' });
      await v1.register(adminProductsRoutes, { prefix: '/admin/products' });
      await v1.register(adminCategoriesRoutes, { prefix: '/admin/categories' });
      await v1.register(adminVehiclesRoutes, { prefix: '/admin/vehicles' });
      await v1.register(adminServicesRoutes, { prefix: '/admin/services' });
      await v1.register(adminContactsRoutes, { prefix: '/admin/contacts' });
      await v1.register(adminSettingsRoutes, { prefix: '/admin/settings' });
      await v1.register(adminAuditRoutes, { prefix: '/admin/audit-logs' });
      await v1.register(adminServiceRequestsRoutes, { prefix: '/admin/service-requests' });
    },
    { prefix: '/api/v1' }
  );

  // Tratamento global de erros
  app.setErrorHandler((error, request, reply) => {
    if (error.statusCode === 429) {
      return reply.status(429).send({
        error: 'Muitas requisições',
        message: 'Limite de taxa excedido. Tente novamente em alguns instantes.',
      });
    }

    if (error.validation) {
      return reply.status(400).send({
        error: 'Erro de validação',
        message: error.message,
      });
    }

    console.error(`[SERVER ERROR] ${request.method} ${request.url}:`, error);

    return reply.status(error.statusCode || 500).send({
      error: 'Erro interno do servidor',
      message: process.env.NODE_ENV === 'production' ? 'Ocorreu um erro inesperado.' : error.message,
    });
  });

  return app;
}
