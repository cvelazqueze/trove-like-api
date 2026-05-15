#!/bin/sh
# Fails fast when required env vars are missing or still use CHANGE_ME_* placeholders.
set -e

is_placeholder() {
  case "$1" in
    CHANGE_ME_*|'') return 0 ;;
    *) return 1 ;;
  esac
}

require_set() {
  name="$1"
  value=$(eval "printf '%s' \"\${$name}\"")
  if is_placeholder "$value"; then
    echo "ERROR: $name is missing or still set to a CHANGE_ME_* placeholder."
    echo "       Copy .env.example to .env and replace every CHANGE_ME_* value before starting."
    exit 1
  fi
}

require_min_length() {
  name="$1"
  min="$2"
  value=$(eval "printf '%s' \"\${$name}\"")
  if [ "${#value}" -lt "$min" ]; then
    echo "ERROR: $name must be at least $min characters."
    exit 1
  fi
}

echo "Validating environment variables..."

require_set JWT_SECRET
require_min_length JWT_SECRET 16

require_set POSTGRES_USER
require_set POSTGRES_PASSWORD
require_set POSTGRES_DB
require_set POSTGRES_HOST
require_set POSTGRES_PORT

require_set REDIS_HOST

if [ "${RUN_SEED}" = "true" ] || [ "${RUN_SEED}" = "1" ]; then
  require_set SEED_USER_EMAIL
  require_set SEED_USER_PASSWORD
  require_set SEED_USER_NAME
  require_set SEED_COLLECTION_NAME
  require_set SEED_PRODUCTS_JSON
  require_min_length SEED_USER_PASSWORD 8
fi

echo "Environment validation passed."
