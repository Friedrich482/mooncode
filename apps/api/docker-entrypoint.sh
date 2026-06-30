#!/bin/sh
set -e

echo "Running postgres migrations..."
npm run migrate

printf "\nStarting api...\n"
exec "$@"
