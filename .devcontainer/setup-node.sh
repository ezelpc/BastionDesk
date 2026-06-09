#!/bin/bash

set -e

echo "[+] Configuring Node.js ecosystem"

# Verificar versión de Node
node_version=$(node --version)
echo "    Node.js: $node_version"

# Actualizar npm a la última versión estable
npm install -g npm@latest

# Herramientas globales del stack
npm install -g \
    typescript \
    ts-node \
    nodemon \
    concurrently \
    dotenv-cli

echo "[✓] Node.js Ready"
