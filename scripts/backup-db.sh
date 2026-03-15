#!/usr/bin/env bash
# Simple PostgreSQL backup script for personal use.
# Usage: ./scripts/backup-db.sh
# Backups are saved to ./backups/ with a timestamp. Keeps last 10 backups.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
BACKUP_DIR="$SCRIPT_DIR/../backups"
COMPOSE_DIR="$SCRIPT_DIR/../docker"
DB_NAME="ugc_creative_ops"
DB_USER="postgres"
KEEP=10

mkdir -p "$BACKUP_DIR"

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/${DB_NAME}_${TIMESTAMP}.sql.gz"

echo "Backing up $DB_NAME ..."
docker compose -f "$COMPOSE_DIR/docker-compose.yml" exec -T postgres pg_dump -U "$DB_USER" "$DB_NAME" | gzip > "$BACKUP_FILE"

echo "Backup saved: $BACKUP_FILE ($(du -h "$BACKUP_FILE" | cut -f1))"

# Rotate: keep only the last $KEEP backups
cd "$BACKUP_DIR"
ls -1t ${DB_NAME}_*.sql.gz 2>/dev/null | tail -n +$((KEEP + 1)) | xargs -r rm --
echo "Done. $(ls -1 ${DB_NAME}_*.sql.gz 2>/dev/null | wc -l) backup(s) on disk."
