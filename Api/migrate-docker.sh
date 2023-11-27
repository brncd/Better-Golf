#!/bin/bash

migration_name="InitialCreate"

# Comando para verificar si existen migraciones pendientes
migrations_list=$(docker exec api-dev dotnet ef migrations list)

if [[ $migrations_list == *$migration_name* ]]; then
  echo "A migration called $migration_name already exists."
  exit 0
else
  echo "Creating migration $migration_name..."
  docker exec api-dev dotnet ef migrations add $migration_name
  echo "Applying migrations..."
  docker exec api-dev dotnet ef database update
  echo "Done!"
fi
