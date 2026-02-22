#!/bin/sh
set -e

DB_HOST=${DB_HOST:-mysql}
DB_PORT=${DB_PORT:-3306}
MAX_RETRIES=${MAX_RETRIES:-30}
RETRY_INTERVAL=${RETRY_INTERVAL:-2}

# ─── Wait for database ──────────────────────
echo "[entrypoint] Waiting for database at $DB_HOST:$DB_PORT..."
retries=0
while ! nc -z "$DB_HOST" "$DB_PORT" 2>/dev/null; do
  retries=$((retries + 1))
  if [ $retries -ge $MAX_RETRIES ]; then
    echo "[entrypoint] ERROR: Database not available after $MAX_RETRIES attempts. Exiting."
    exit 1
  fi
  echo "[entrypoint] Attempt $retries/$MAX_RETRIES - waiting ${RETRY_INTERVAL}s..."
  sleep $RETRY_INTERVAL
done
echo "[entrypoint] Database is ready!"

# ─── Wait for Redis (optional) ──────────────
REDIS_HOST=${REDIS_HOST:-redis}
REDIS_PORT=${REDIS_PORT:-6379}
if nc -z "$REDIS_HOST" "$REDIS_PORT" 2>/dev/null; then
  echo "[entrypoint] Redis is ready!"
else
  echo "[entrypoint] WARNING: Redis not available at $REDIS_HOST:$REDIS_PORT"
fi

# ─── Run Prisma migrations ──────────────────
echo "[entrypoint] Syncing database schema..."
# Check if there are actual migration SQL files; if not, use db push
MIGRATION_COUNT=$(find prisma/migrations -name "*.sql" 2>/dev/null | wc -l)
if [ "$MIGRATION_COUNT" -gt 0 ]; then
  echo "[entrypoint] Found $MIGRATION_COUNT migration file(s) - running migrate deploy..."
  npx prisma migrate deploy 2>&1 || {
    echo "[entrypoint] WARNING: Migration failed, falling back to db push..."
    npx prisma db push --accept-data-loss 2>&1 || true
  }
else
  echo "[entrypoint] No migration files found - using db push..."
  npx prisma db push --accept-data-loss 2>&1 || {
    echo "[entrypoint] WARNING: db push failed (schema may already be in sync)"
  }
fi

# ─── Run seeds (only in development) ────────
if [ "$NODE_ENV" != "production" ]; then
  echo "[entrypoint] Running database seeds..."
  npx prisma db seed 2>&1 || {
    echo "[entrypoint] WARNING: Seeding failed (may already be seeded)"
  }
else
  echo "[entrypoint] Skipping seeds in production mode."
fi

# ─── Execute main command ───────────────────
echo "[entrypoint] Starting application..."
exec "$@"
