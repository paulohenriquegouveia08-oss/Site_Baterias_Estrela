#!/usr/bin/env bash
# ==============================================================================
# Baterias Estrela - Script de Deploy Automatizado na VPS
# Execução: bash deploy/scripts/deploy-vps.sh
# ==============================================================================
set -e

# Cores para saída no terminal
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=====================================================${NC}"
echo -e "${BLUE}   BATERIAS ESTRELA - DEPLOY DE PRODUÇÃO NA VPS     ${NC}"
echo -e "${BLUE}=====================================================${NC}"

# Diretório raiz do projeto
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$PROJECT_DIR"

# 1. Verifica arquivo de variáveis de ambiente
if [ ! -f "$PROJECT_DIR/.env.production" ]; then
    echo -e "${RED}[ERRO] Arquivo .env.production não encontrado em $PROJECT_DIR!${NC}"
    echo -e "${YELLOW}Crie o arquivo com base em .env.production.example antes de continuar.${NC}"
    exit 1
fi

echo -e "${GREEN}[1/5] Verificando dependências de infraestrutura...${NC}"
if ! command -v docker &> /dev/null; then
    echo -e "${RED}[ERRO] Docker não está instalado nesta VPS.${NC}"
    exit 1
fi

if ! docker compose version &> /dev/null; then
    echo -e "${RED}[ERRO] Plugin 'docker compose' não encontrado.${NC}"
    exit 1
fi

# 2. Atualização de código (caso esteja em um repositório git)
if [ -d "$PROJECT_DIR/.git" ]; then
    echo -e "${GREEN}[2/5] Atualizando código com git pull...${NC}"
    git pull origin main || git pull origin master || echo -e "${YELLOW}[AVISO] Git pull ignorado ou sem branch remota configurada.${NC}"
else
    echo -e "${YELLOW}[2/5] Repositório Git não detectado. Pulando git pull...${NC}"
fi

# 3. Build das imagens Docker
echo -e "${GREEN}[3/5] Construindo imagens Docker de produção...${NC}"
docker compose -f docker-compose.prod.yml --env-file .env.production build --pull api

# 4. Inicialização dos containers
echo -e "${GREEN}[4/5] Subindo containers (PostgreSQL + API Fastify)...${NC}"
docker compose -f docker-compose.prod.yml --env-file .env.production up -d

# Aguarda inicialização do banco e da API
echo -e "${YELLOW}Aguardando serviços ficarem operacionais (10 segundos)...${NC}"
sleep 10

# 5. Execução de migrações do Prisma no banco de produção
echo -e "${GREEN}[5/5] Aplicando migrações do banco com Prisma...${NC}"
docker compose -f docker-compose.prod.yml --env-file .env.production exec -T api npx prisma migrate deploy

# Validação do Healthcheck
echo -e "${YELLOW}Validando status da API...${NC}"
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3333/health || echo "000")

if [ "$HTTP_STATUS" -eq 200 ]; then
    echo -e "${GREEN}=====================================================${NC}"
    echo -e "${GREEN} ✅ DEPLOY CONCLUÍDO COM SUCESSO!                     ${NC}"
    echo -e "${GREEN} 🚀 API respondendo em http://127.0.0.1:3333/health   ${NC}"
    echo -e "${GREEN}=====================================================${NC}"
else
    echo -e "${RED}[ALERTA] API respondeu com código $HTTP_STATUS ou conexão recusada.${NC}"
    echo -e "${YELLOW}Verifique os logs com: docker compose -f docker-compose.prod.yml --env-file .env.production logs api${NC}"
    exit 1
fi
