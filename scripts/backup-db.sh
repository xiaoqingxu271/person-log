#!/usr/bin/env bash
# person-log MySQL 备份脚本
# 用法：
#   ./scripts/backup-db.sh
#   BACKUP_DIR=/data/backups KEEP_DAYS=7 ./scripts/backup-db.sh
# 定时任务示例（每天 03:00）：
#   0 3 * * * cd /srv/person-log && ./scripts/backup-db.sh >> /var/log/person-log-backup.log 2>&1
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

BACKUP_DIR="${BACKUP_DIR:-$ROOT_DIR/backups}"
KEEP_DAYS="${KEEP_DAYS:-14}"
STAMP="$(date +%Y%m%d-%H%M%S)"
FILE="$BACKUP_DIR/person-log-$STAMP.sql.gz"

mkdir -p "$BACKUP_DIR"

echo "[$(date '+%Y-%m-%d %H:%M:%S')] 开始备份到 $FILE"

if command -v docker >/dev/null 2>&1 && docker compose ps -q mysql 2>/dev/null | grep -q .; then
  echo "使用 Docker 容器 person-log-mysql"
  docker compose exec -T mysql sh -c \
    'exec mysqldump -uroot -p"$MYSQL_ROOT_PASSWORD" --single-transaction --routines --events --set-gtid-purged=OFF "$MYSQL_DATABASE"' \
    | gzip > "$FILE"
else
  if ! command -v mysqldump >/dev/null 2>&1; then
    echo "错误：未找到 Docker MySQL 容器，也没有本机 mysqldump。" >&2
    exit 1
  fi
  if [ -z "${DATABASE_URL:-}" ]; then
    echo "错误：本机备份需要 DATABASE_URL 环境变量（可先 source .env）。" >&2
    exit 1
  fi

  # 从 DATABASE_URL 解析连接信息（逐行读取，避免密码中的特殊字符被 shell 解释）
  mapfile -t DB_PARTS < <(node -e '
    const u = new URL(process.env.DATABASE_URL)
    console.log(u.hostname)
    console.log(u.port || "3306")
    console.log(decodeURIComponent(u.username))
    console.log(decodeURIComponent(u.password))
    console.log(decodeURIComponent(u.pathname.replace(/^\//, "")))
  ')
  DB_HOST="${DB_PARTS[0]}"
  DB_PORT="${DB_PARTS[1]}"
  DB_USER="${DB_PARTS[2]}"
  DB_PASSWORD="${DB_PARTS[3]}"
  DB_NAME="${DB_PARTS[4]}"

  echo "使用本机 mysqldump：$DB_USER@$DB_HOST:$DB_PORT/$DB_NAME"
  MYSQL_PWD="$DB_PASSWORD" mysqldump \
    --host="$DB_HOST" --port="$DB_PORT" --user="$DB_USER" \
    --single-transaction --routines --events --set-gtid-purged=OFF \
    "$DB_NAME" | gzip > "$FILE"
fi

if [ ! -s "$FILE" ] || ! gzip -t "$FILE"; then
  echo "错误：备份文件为空或损坏，已删除：$FILE" >&2
  rm -f "$FILE"
  exit 1
fi

# 清理过期备份
find "$BACKUP_DIR" -name 'person-log-*.sql.gz' -type f -mtime +"$KEEP_DAYS" -delete

echo "[$(date '+%Y-%m-%d %H:%M:%S')] 备份完成：$(du -h "$FILE" | cut -f1)"
