#!/bin/sh
set -e

./scripts/validate-env.sh

POSTGRES_HOST="${POSTGRES_HOST:-postgres}"
POSTGRES_PORT="${POSTGRES_PORT:-5432}"
REDIS_HOST="${REDIS_HOST:-redis}"
REDIS_PORT="${REDIS_PORT:-6379}"

echo "Waiting for PostgreSQL at ${POSTGRES_HOST}:${POSTGRES_PORT}..."
until nc -z "${POSTGRES_HOST}" "${POSTGRES_PORT}" 2>/dev/null; do
  sleep 1
done
echo "PostgreSQL is up"

echo "Waiting for Redis at ${REDIS_HOST}:${REDIS_PORT}..."
until nc -z "${REDIS_HOST}" "${REDIS_PORT}" 2>/dev/null; do
  sleep 1
done
echo "Redis is up"

echo "Syncing database schema..."
npm run db:migrate

if [ "${RUN_SEED}" = "true" ] || [ "${RUN_SEED}" = "1" ]; then
  echo "Seeding database..."
  npm run db:seed || true
fi

exec "$@"
