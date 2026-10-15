# ==============================================================================
# Baterias Estrela - Dockerfile para Produção (VPS)
# Backend Fastify + Prisma ORM + TypeScript
# ==============================================================================

# Estágio Base com Node 22 e utilitários de sistema necessários para Prisma
FROM node:22-bookworm-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@latest --activate
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates curl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# ==============================================================================
# Estágio de Dependências e Build
# ==============================================================================
FROM base AS builder

# Copia definições do monorepo pnpm
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY packages/shared/package.json ./packages/shared/
COPY apps/api/package.json ./apps/api/

# Instala todas as dependências do workspace
RUN pnpm install --frozen-lockfile

# Copia Prisma schema e gera o cliente
COPY apps/api/prisma ./apps/api/prisma
RUN pnpm --filter @baterias-estrela/api prisma:generate

# Copia código fonte
COPY packages/shared ./packages/shared
COPY apps/api ./apps/api

# Compila shared e api
RUN pnpm --filter @baterias-estrela/shared build
RUN pnpm --filter @baterias-estrela/api build

# ==============================================================================
# Estágio de Produção (Runner enxuto e seguro)
# ==============================================================================
FROM base AS runner

ENV NODE_ENV=production
ENV PORT=3333
ENV HOST=0.0.0.0

WORKDIR /app

# Cria usuário sem privilégios root para execução segura
RUN groupadd -g 1001 nodejs && useradd -u 1001 -g nodejs -s /bin/bash -m nodejs

# Copia arquivos necessários do estágio builder
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY --from=builder /app/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/shared ./packages/shared
COPY --from=builder /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/prisma ./apps/api/prisma
COPY --from=builder /app/apps/api/package.json ./apps/api/package.json

# Cria pasta persistente de uploads de imagens locais
RUN mkdir -p /app/uploads && chown -R nodejs:nodejs /app

USER nodejs

WORKDIR /app/apps/api

EXPOSE 3333

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://127.0.0.1:3333/health || exit 1

CMD ["node", "dist/server.js"]
