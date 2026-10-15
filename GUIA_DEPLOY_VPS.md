# 🚀 Guia de Implantação do Backend na VPS - Baterias Estrela

Este guia documenta o passo a passo completo para hospedar o backend (**API Fastify, Prisma ORM e PostgreSQL**) em uma VPS própria (Ubuntu 22.04 / 24.04 LTS ou Debian 12).

---

## 🏗️ 1. Arquitetura da Solução

```
[ Usuário / Navegador ]
         │
         ▼
[ HTTPS 443 / 80 ]
         │
    ┌────┴────────────────────────────────┐
    │  VPS (Nginx / Caddy Reverse Proxy) │
    └────┬────────────────────────────────┘
         │ Proxy interno (127.0.0.1:3333)
         ▼
┌───────────────────────────────────────────────┐
│ Docker Compose (Produção)                    │
│                                               │
│  ┌─────────────────────────┐                  │
│  │  API Fastify Node.js 22 │                  │
│  │  (/api/v1, /health)     │                  │
│  └───────────┬─────────────┘                  │
│              │ Rede interna isolada           │
│              ▼                                │
│  ┌─────────────────────────┐  ┌─────────────┐ │
│  │ PostgreSQL 16 (Dados)   │  │ Volume      │ │
│  │ baterias_estrela_db     │  │ /app/uploads│ │
│  └─────────────────────────┘  └─────────────┘ │
└───────────────────────────────────────────────┘
```

* **Frontend**: Pode ser hospedado na mesma VPS ou em provedores edge (Vercel, Cloudflare Pages, Netlify) apontando para `https://api.bateriasestrela.com.br/api/v1`.
* **Backend na VPS**: O container Fastify escuta apenas internamente em `127.0.0.1:3333`, blindado contra acessos externos diretos. Apenas o Nginx/Caddy expõe as portas 80/443 com certificado SSL válido.

---

## 📋 2. Requisitos da VPS

* **Sistema Operacional**: Ubuntu 22.04 LTS ou 24.04 LTS (recomendado) ou Debian 12.
* **Configuração recomendada**: 1 vCPU, 2GB de RAM (ou 1GB com 2GB de SWAP) e 25GB de SSD.
* **Apontamento de DNS**:
  * Tipo A: `api.bateriasestrela.com.br` -> `IP_DA_SUA_VPS`
  * (Opcional se hospedar o frontend também na VPS):
    * Tipo A: `bateriasestrela.com.br` -> `IP_DA_SUA_VPS`
    * Tipo CNAME: `www` -> `bateriasestrela.com.br`

---

## 🛠️ 3. Preparando a VPS (Primeiro Acesso)

Conecte via SSH:
```bash
ssh root@IP_DA_SUA_VPS
```

### 3.1 Atualizar o Sistema e Pacotes
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl wget git ufw htop ca-certificates gnupg lsb-release
```

### 3.2 Configurar Firewall (UFW)
```bash
# Permitir SSH (se sua porta SSH for personalizada, substitua 22)
sudo ufw allow 22/tcp

# Permitir tráfego Web HTTP e HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Ativar firewall
sudo ufw enable
sudo ufw status
```

### 3.3 Instalar Docker e Docker Compose Plugin
```bash
# Instalação oficial do Docker
curl -fsSL https://get.docker.com | sh

# Adicionar usuário ao grupo docker (se não estiver como root)
sudo usermod -aG docker $USER

# Testar instalação
docker --version
docker compose version
```

---

## 📦 4. Clonando e Configurando o Projeto

### 4.1 Clonar o Repositório
```bash
mkdir -p /var/www
cd /var/www
git clone https://github.com/SEU_USUARIO/baterias-estrela.git
cd baterias-estrela
```

### 4.2 Criar o Arquivo `.env.production`
Copie o modelo de produção:
```bash
cp .env.production.example .env.production
```

Edite o arquivo:
```bash
nano .env.production
```

> [!IMPORTANT]
> Gere credenciais seguras para produção:
> * **POSTGRES_PASSWORD**: Gere com `openssl rand -base64 24`
> * **JWT_SECRET**: Gere com `openssl rand -hex 32`
> * **COOKIE_SECRET**: Gere com `openssl rand -hex 32`
> * **CORS_ORIGIN**: Insira a URL do frontend (ex: `https://bateriasestrela.com.br`).

Exemplo do `.env.production` preenchido:
```env
NODE_ENV=production
PORT=3333
HOST=0.0.0.0

POSTGRES_DB=baterias_estrela
POSTGRES_USER=estrela_admin
POSTGRES_PASSWORD=SUA_SENHA_MUITO_SEGURA_AQUI

DATABASE_URL=postgresql://estrela_admin:SUA_SENHA_MUITO_SEGURA_AQUI@postgres:5432/baterias_estrela?schema=public

JWT_SECRET=8f4a21b3c9e6...chave_gerada_com_openssl...
COOKIE_SECRET=9a1b2c3d4e5f...chave_gerada_com_openssl...

CORS_ORIGIN=https://bateriasestrela.com.br
STORAGE_DRIVER=local
STORAGE_LOCAL_DIR=/app/uploads

ADMIN_EMAIL=admin@bateriasestrela.com.br
ADMIN_PASSWORD=SenhaAdminForte2026!
ADMIN_NAME=Diretoria Estrela
```

---

## 🚀 5. Iniciando o Backend com Docker Compose

Você pode rodar diretamente o script de deploy automatizado:
```bash
chmod +x deploy/scripts/deploy-vps.sh deploy/scripts/backup-vps.sh
bash deploy/scripts/deploy-vps.sh
```

Ou executar os comandos manualmente passo a passo:

```bash
# 1. Construir imagem do backend
docker compose -f docker-compose.prod.yml --env-file .env.production build api

# 2. Subir banco de dados e API
docker compose -f docker-compose.prod.yml --env-file .env.production up -d

# 3. Aplicar as migrações do banco de dados (Prisma)
docker compose -f docker-compose.prod.yml --env-file .env.production exec -T api npx prisma migrate deploy

# 4. Provisionar dados iniciais da loja (Marcas, Veículos e Baterias)
docker compose -f docker-compose.prod.yml --env-file .env.production exec -T api pnpm prisma:seed

# 5. Criar o Administrador Master
docker compose -f docker-compose.prod.yml --env-file .env.production exec -T api node dist/scripts/create-admin.js admin@bateriasestrela.com.br SenhaAdminForte2026! "Gerente Estrela"

# 6. Testar saúde da API
curl http://127.0.0.1:3333/health
# Deve responder: {"status":"ok","timestamp":"..."}
```

---

## 🔒 6. Configurando o Proxy Reverso e HTTPS (SSL)

### Opção 1: Nginx + Certbot (Mais Tradicional e Confiável)

1. Instalar Nginx e Certbot:
```bash
sudo apt install -y nginx certbot python3-certbot-nginx
```

2. Copiar a configuração do Nginx:
```bash
sudo cp deploy/nginx/baterias-estrela-api.conf /etc/nginx/sites-available/baterias-estrela
```

3. Editar o domínio no arquivo caso diferente de `api.bateriasestrela.com.br`:
```bash
sudo nano /etc/nginx/sites-available/baterias-estrela
```

4. Ativar o site e testar:
```bash
sudo ln -sf /etc/nginx/sites-available/baterias-estrela /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

5. Emitir Certificado SSL gratuito com Let's Encrypt:
```bash
sudo certbot --nginx -d api.bateriasestrela.com.br
```
O Certbot configurará a renovação automática dos certificados.

---

### Opção 2: Caddy (Alternativa com SSL Automático em 1 Comando)

Se preferir não gerenciar Nginx e Certbot:
```bash
# Instalar Caddy
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https curl
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt update
sudo apt install caddy

# Copiar Caddyfile
sudo cp deploy/caddy/Caddyfile /etc/caddy/Caddyfile

# Recarregar
sudo systemctl restart caddy
```
O Caddy gerará e renovará o certificado SSL automaticamente.

---

## 💾 7. Rotina Automática de Backups Diários

O script `deploy/scripts/backup-vps.sh` realiza o dump comprimido do PostgreSQL e mantém histórico dos últimos 7 dias.

Configure no Crontab para rodar toda madrugada às 03:00:
```bash
sudo crontab -e
```

Adicione a linha:
```cron
0 3 * * * /bin/bash /var/www/baterias-estrela/deploy/scripts/backup-vps.sh >> /var/log/baterias_estrela_backup.log 2>&1
```

---

## 💻 8. Conectando o Frontend ao Backend na VPS

No projeto Frontend (em desenvolvimento local ou nas configurações da Vercel/Netlify):

Defina a variável de ambiente:
```env
VITE_API_URL=https://api.bateriasestrela.com.br/api/v1
```

O frontend passará a consumir todas as rotas diretamente da sua VPS via HTTPS com suporte a credenciais e cookies HttpOnly seguros.

---

## 📊 9. Comandos Úteis do Dia a Dia

| Ação | Comando |
| :--- | :--- |
| **Atualizar a API (Novo código)** | `bash deploy/scripts/deploy-vps.sh` |
| **Ver logs da API em tempo real** | `docker compose -f docker-compose.prod.yml logs -f api` |
| **Ver logs do Banco de Dados** | `docker compose -f docker-compose.prod.yml logs -f postgres` |
| **Reiniciar containers** | `docker compose -f docker-compose.prod.yml restart` |
| **Criar novo usuário Admin** | `docker compose -f docker-compose.prod.yml exec -T api node dist/scripts/create-admin.js <email> <senha> <nome>` |
| **Fazer backup manual agora** | `bash deploy/scripts/backup-vps.sh` |
| **Status dos containers** | `docker compose -f docker-compose.prod.yml ps` |

---

## 🛡️ 10. Checklist de Segurança para Produção

- [x] Senhas fortes e únicas geradas com `openssl`.
- [x] Portas internas (5432 do PostgreSQL e 3333 do Fastify) NÃO expostas para a internet externa.
- [x] UFW ativo com apenas portas 22, 80 e 443 liberadas.
- [x] HTTPS com TLS 1.2 / 1.3 ativo via Nginx ou Caddy.
- [x] Cookie `admin_token` configurado com `HttpOnly: true` e `Secure: true`.
- [x] Rate Limiting ativo para proteção contra abusos e brute-force.
- [x] Backups automáticos diários com retenção configurada.
- [x] Preços públicos estritamente ausentes de todas as respostas da API pública.
