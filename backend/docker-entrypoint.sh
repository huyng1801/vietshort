#!/bin/sh
set -e

# Wait for database to be ready
echo "Waiting for database..."
while ! nc -z mysql 3306; do
  sleep 1
done
echo "Database is ready!"

# Run Prisma migrations
echo "Running database migrations..."
npx prisma migrate deploy || true

# Run seeds if needed
echo "Running database seeds..."
npx prisma db seed || true

# Execute the main command
exec "$@"
