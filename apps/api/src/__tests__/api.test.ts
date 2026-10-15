import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { FastifyInstance } from 'fastify';
import { buildApp } from '../app';
import { prisma } from '../prisma';

let app: FastifyInstance;

beforeAll(async () => {
  app = await buildApp();
  await app.ready();
});

afterAll(async () => {
  await app.close();
  await prisma.$disconnect();
});

describe('API Regras de Negócio e Segurança', () => {
  it('GET /health responde status ok', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/health',
    });
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.status).toBe('ok');
    expect(body.store).toBe('Baterias Estrela');
  });

  it('GET /api/v1/products NUNCA retorna notas de custo internas ou preços públicos', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/products',
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.data).toBeDefined();
    expect(Array.isArray(body.data)).toBe(true);
    expect(body.data.length).toBeGreaterThan(0);

    for (const prod of body.data) {
      expect(prod.internalCostNotes).toBeUndefined();
      expect(prod.cost).toBeUndefined();
      expect(prod.price).toBeUndefined();
      expect(prod.valor).toBeUndefined();
      expect(prod.preco).toBeUndefined();
      // Deve ter especificações técnicas essenciais
      expect(prod.name).toBeDefined();
      expect(prod.brand).toBeDefined();
      expect(prod.amperageAh).toBeGreaterThan(0);
    }
  });

  it('GET /api/v1/vehicles/variants/:id/products retorna baterias validadas', async () => {
    // Busca uma variante existente com compatibilidades cadastradas
    const variant = await prisma.vehicleVariant.findFirst({
      where: {
        compatibilities: {
          some: { validationStatus: 'verified' },
        },
      },
    });

    expect(variant).not.toBeNull();

    const res = await app.inject({
      method: 'GET',
      url: `/api/v1/vehicles/variants/${variant!.id}/products`,
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.matched).toBe(true);
    expect(body.products.length).toBeGreaterThan(0);

    for (const prod of body.products) {
      expect(prod.internalCostNotes).toBeUndefined();
      expect(prod.price).toBeUndefined();
      expect(prod.validationSource).toBeDefined();
    }
  });

  it('Rotas administrativas são estritamente bloqueadas sem autenticação (401)', async () => {
    const endpoints = [
      { method: 'GET' as const, url: '/api/v1/admin/analytics/summary' },
      { method: 'GET' as const, url: '/api/v1/admin/products' },
      { method: 'POST' as const, url: '/api/v1/admin/products' },
      { method: 'GET' as const, url: '/api/v1/admin/settings' },
      { method: 'GET' as const, url: '/api/v1/admin/audit-logs' },
    ];

    for (const ep of endpoints) {
      const res = await app.inject({
        method: ep.method,
        url: ep.url,
      });
      expect(res.statusCode).toBe(401);
      const body = JSON.parse(res.body);
      expect(body.error).toBe('Não autorizado');
    }
  });

  it('POST /api/v1/auth/login valida credenciais e gera cookie e token', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/login',
      payload: {
        email: 'admin@bateriasestrela.com.br',
        password: 'Estrela@Admin2026',
      },
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.token).toBeDefined();
    expect(body.user.email).toBe('admin@bateriasestrela.com.br');

    // Confere se o cookie admin_token foi emitido
    const cookies = res.headers['set-cookie'];
    expect(cookies).toBeDefined();
    expect(String(cookies)).toContain('admin_token=');

    // Acessa rota administrativa autenticada com o token
    const summaryRes = await app.inject({
      method: 'GET',
      url: '/api/v1/admin/analytics/summary?period=7d',
      headers: {
        authorization: `Bearer ${body.token}`,
      },
    });

    expect(summaryRes.statusCode).toBe(200);
    const summary = JSON.parse(summaryRes.body);
    expect(summary.totalPageViews).toBeGreaterThanOrEqual(0);
    expect(summary.estimatedUniqueVisitors).toBeGreaterThanOrEqual(0);
    expect(summary.whatsappClicks).toBeGreaterThanOrEqual(0);
  });

  it('POST /api/v1/auth/login rejeita credenciais incorretas com mensagem genérica', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/login',
      payload: {
        email: 'admin@bateriasestrela.com.br',
        password: 'SenhaCompletamenteErrada!',
      },
    });

    expect(res.statusCode).toBe(401);
    const body = JSON.parse(res.body);
    expect(body.error).toBe('Credenciais inválidas');
  });

  it('POST /api/v1/analytics/events aceita eventos sem falhar o cliente', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/analytics/events',
      payload: {
        eventType: 'page_view',
        path: '/baterias',
        sessionId: 'test_session_xyz_123',
        deviceCategory: 'desktop',
      },
    });

    expect(res.statusCode).toBe(202);
  });
});
