#!/bin/sh
set -e

echo "Running postgres migrations..."
npm run migrate

echo "Starting api..."
exec "$@"