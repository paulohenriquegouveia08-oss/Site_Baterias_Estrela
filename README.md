# Baterias Estrela - Sistema Web Premium

Sistema web completo e vitrine técnica sem preços públicos para a loja **Baterias Estrela**, localizada em **Arapongas, Paraná, Brasil** (Rua Taperaçu 165, Vila Sampaio).

Projetado especificamente para gerar atendimento consultivo via WhatsApp e telefone, com busca técnica guiada por veículo, agendamento de socorro rápido e painel administrativo integrado.

---

## 1. Visão Geral da Arquitetura

O projeto é estruturado em um **monorepo enxuto** utilizando `pnpm`:

- `apps/web`: Frontend em React 18, Vite, TypeScript, Tailwind CSS, Lucide Icons e Framer Motion.
- `apps/api`: Backend Fastify, TypeScript, Prisma ORM, JWT, Cookies HttpOnly, Rate Limiter e REST API versionada em `/api/v1`.
- `packages/shared`: Tipos TypeScript, esquemas Zod de validação e construtor centralizado de mensagens e links de WhatsApp.
- `prisma`: Schema PostgreSQL, migrações versionadas e seed com dados realistas da região de Arapongas e marcas líderes (Moura, Heliar, Bralmax, Zetta, Cral).
- `docker-compose.yml`: Ambiente local com PostgreSQL 16 e MinIO (compatível com S3).

### Regras de Negócio Implementadas
* **Sem preços públicos:** Nenhum preço é retornado pela API pública nem exibido no frontend.
* **Consultas via WhatsApp:** Todos os produtos e chamados de socorro geram mensagens pré-formatadas contendo nome, SKU, especificações e dados do veículo selecionado.
* **Busca técnica por veículo:** Recomenda apenas baterias com compatibilidade cadastrada e validada em tabela técnica. Se não houver correspondência exata, instrui o cliente a consultar a loja pelo WhatsApp para confirmação física na bandeja do carro.
* **Canais de contato dinâmicos:** Telefones e números de WhatsApp são cadastráveis pelo painel administrativo, com escolha do local de exibição (cabeçalho, rodapé, página de contato ou serviços).
* **Métricas reais (sem dados falsos):** O painel administrativo agrega eventos reais de visualização de páginas, cliques de WhatsApp, chamadas telefônicas e buscas de veículos.
* **Segurança e LGPD:** Senhas com hash criptográfico (bcrypt/argon2), rate limiting, auditoria de ações administrativas e identificador de sessão pseudonimizado (sem armazenar IP bruto ou conteúdo de mensagens privadas).

---

## 2. Requisitos de Ambiente

- **Node.js**: v20+ ou v22+
- **pnpm**: v9+ ou v11+
- **PostgreSQL**: v14+ (local ou via Docker)
- **Docker e Docker Compose** (opcional para ambiente conteinerizado)

---

## 3. Passo a Passo para Execução Local

### 1. Clonar e Instalar Dependências
```bash
git clone <url-do-repositorio>
cd baterias-estrela
pnpm install
```

### 2. Configurar Variáveis de Ambiente
Copie o arquivo de exemplo e ajuste para o seu PostgreSQL:
```bash
cp .env.example apps/api/.env
```

Exemplo para banco de dados local:
```env
PORT=3333
HOST=0.0.0.0
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
DATABASE_URL="postgresql://adrianotavares@localhost:5432/baterias_estrela?schema=public"
JWT_SECRET="estrela_super_secret_jwt_key_local_dev_2026_arapongas"
COOKIE_SECRET="estrela_super_secret_cookie_key_local_dev_2026_arapongas"
STORAGE_DRIVER=local
STORAGE_LOCAL_DIR=./uploads
```

### 3. Criar Banco e Executar Migrações
```bash
# Gerar o cliente Prisma
pnpm db:generate

# Aplicar migrações
pnpm db:migrate

# Popular banco com dados reais de Arapongas (seed)
pnpm db:seed
```

### 4. Iniciar os Serviços de Desenvolvimento
```bash
# Inicia API (porta 3333) e Frontend (porta 5173) simultaneamente
pnpm dev
```

Acesse:
- **Site Público**: [http://localhost:5173](http://localhost:5173)
- **Painel Administrativo**: [http://localhost:5173/admin](http://localhost:5173/admin)
- **Documentação / Healthcheck da API**: [http://localhost:3333/health](http://localhost:3333/health)

---

## 4. Credenciais Iniciais do Administrador

Ao executar o seed, a primeira conta administrativa é provisionada:
- **E-mail:** `admin@bateriasestrela.com.br`
- **Senha:** `Estrela@Admin2026`

### Provisionar Novo Administrador via Linha de Comando (CLI)
Para provisionar um novo administrador sem expor cadastro público:
```bash
pnpm admin:create novo-admin@bateriasestrela.com.br SenhaForte123 "Gerente Estrela"
```

---

## 5. Testes Automatizados

O projeto conta com testes automatizados cobrindo sanitização de telefones, formatação de mensagens de WhatsApp, ausência de preços na API pública, validação de veículos e proteção de rotas administrativas.

Para executar os testes:
```bash
pnpm test
```

### Resultados dos Testes Executados:
- `packages/shared`:
  - ✅ Sanitização de números brasileiros com e sem DDD/DDI
  - ✅ Formatação humana de telefones
  - ✅ Construção de mensagem de produto sem menção a preços
  - ✅ Mensagem de socorro emergencial com coordenadas GPS
  - ✅ Geração de link oficial wa.me com codificação de caracteres
- `apps/api`:
  - ✅ `GET /health` responde status ok
  - ✅ `GET /api/v1/products` estritamente omite campos internos de custo e preços
  - ✅ `GET /api/v1/vehicles/variants/:id/products` retorna somente compatibilidades validadas
  - ✅ Bloqueio 401 em todas as rotas administrativas sem autenticação
  - ✅ Emissão de cookie seguro HttpOnly e token JWT no login
  - ✅ Mensagens genéricas para falhas de autenticação
  - ✅ Endpoint de telemetria e analytics resiliente a falhas

---

## 6. Implantação em Produção na VPS (Backend Fastify + PostgreSQL)

O backend foi preparado para execução conteinerizada em VPS própria (Ubuntu/Debian), isolando o banco PostgreSQL e a API Fastify atrás de um proxy reverso seguro (Nginx ou Caddy) com HTTPS.

### Arquivos de Deploy na VPS:
* `apps/api/Dockerfile`: Imagem multi-stage de produção (Node 22 Bookworm Slim + Prisma + não-root).
* `docker-compose.prod.yml`: Orquestração da API e PostgreSQL com volumes persistentes.
* `deploy/nginx/baterias-estrela-api.conf`: Configuração Nginx com SSL e proxy reverso para `127.0.0.1:3333`.
* `deploy/caddy/Caddyfile`: Configuração Caddy com emissão e renovação automática de SSL.
* `deploy/scripts/deploy-vps.sh`: Script de automação para git pull, build, migrações e validação de saúde.
* `deploy/scripts/backup-vps.sh`: Script para agendamento de backups diários do PostgreSQL via cron.
* `.env.production.example`: Modelo completo de variáveis para produção.
* [GUIA_DEPLOY_VPS.md](file:///Users/adrianotavares/.gemini/antigravity/scratch/baterias-estrela/GUIA_DEPLOY_VPS.md): Manual passo a passo detalhado para configuração da VPS, UFW, Certbot e deploy.

### Comando Rápido de Deploy na VPS:
```bash
# Na raiz da VPS com o arquivo .env.production configurado:
bash deploy/scripts/deploy-vps.sh
```

---

## 7. Procedimento de Backup e Restauração do Banco de Dados

### Backup do PostgreSQL
```bash
pg_dump -U <usuario> -h localhost -d baterias_estrela -F c -b -v -f backup_baterias_estrela_$(date +%Y%m%d_%H%M%S).dump
```

Ou usando o script de VPS:
```bash
bash deploy/scripts/backup-vps.sh
```

### Restauração
```bash
pg_restore -U <usuario> -h localhost -d baterias_estrela -v -c backup_baterias_estrela_YYYYMMDD_HHMMSS.dump
```

---

## 8. Dados Necessários Antes da Publicação Oficial

Antes de colocar o site em produção com o domínio final da loja, a equipe da **Baterias Estrela** deve fornecer:

1. **Domínio Registrado:** (ex: `bateriasestrela.com.br`).
2. **Fotos Próprias de Alta Resolução:** Fotos da fachada da loja na Rua Taperaçu 165 e do veículo de entrega/socorro.
3. **Chaves S3 de Produção (Opcional):** Se optar por hospedar fotos em bucket S3/Cloudflare R2 ao invés de disco local.
4. **Alinhamento dos Telefones:** Confirmação se os números `43996110253` e `43991184520` estão com o WhatsApp Business configurado para receber as mensagens pré-formatadas.
