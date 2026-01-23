#!/bin/sh
set -e

# Create database url env var
export DATABASE_URL="postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}?schema=${DB_SCHEMA:-public}"
echo "DB connect target: host=${DB_HOST} port=${DB_PORT} db=${DB_NAME} schema=${DB_SCHEMA:-public} user=${DB_USER}"

# Run database migrations
echo "Running Prisma migrations..."
npx prisma migrate deploy

# Now start the main server process
echo "Starting the NestJS API..."
exec "$@"
