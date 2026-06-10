#!/bin/bash

set -e

echo "[+] Configuring MongoDB"

# Verificar que mongosh esté disponible (instalado en el Dockerfile)
if command -v mongosh &> /dev/null; then
    echo "    mongosh: $(mongosh --version)"
else
    echo "    [!] mongosh not found — check Dockerfile"
    exit 1
fi

# Crear directorio de datos local si se usa MongoDB local
mkdir -p /home/node/.mongo/data
mkdir -p /home/node/.mongo/logs

echo "[✓] MongoDB Ready"
