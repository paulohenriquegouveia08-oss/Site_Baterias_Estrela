#!/usr/bin/env bash
# ==============================================================================
# Baterias Estrela - Script de Backup Automático do Banco PostgreSQL
# Recomenda-se agendar no Cron: 0 3 * * * /bin/bash /caminho/deploy/scripts/backup-vps.sh
# ==============================================================================
set -e

BACKUP_DIR="/var/backups/baterias-estrela"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
FILENAME="$BACKUP_DIR/baterias_estrela_db_$TIMESTAMP.sql.gz"
CONTAINER_NAME="baterias_estrela_db_prod"
DB_USER="estrela_admin"
DB_NAME="baterias_estrela"

# Cria pasta de backups se não existir
mkdir -p "$BACKUP_DIR"

echo "[$(date)] Iniciando backup do PostgreSQL no container $CONTAINER_NAME..."

# Executa pg_dump dentro do container e compacta com gzip
if docker exec "$CONTAINER_NAME" pg_dump -U "$DB_USER" "$DB_NAME" | gzip > "$FILENAME"; then
    FILESIZE=$(du -h "$FILENAME" | cut -f1)
    echo "[$(date)] Backup concluído com sucesso: $FILENAME ($FILESIZE)"
else
    echo "[$(date)] ERRO: Falha ao gerar backup!" >&2
    exit 1
fi

# Retenção: remove backups com mais de 7 dias
echo "[$(date)] Limpando backups com mais de 7 dias..."
find "$BACKUP_DIR" -type f -name "baterias_estrela_db_*.sql.gz" -mtime +7 -delete

echo "[$(date)] Rotina de backup finalizada."
