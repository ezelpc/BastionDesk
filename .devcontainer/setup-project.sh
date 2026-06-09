#!/bin/bash

set -e

echo "[+] Setting up Appointly project structure"

# ── Carpetas del monorepo ─────────────────────────────────
mkdir -p client/src
mkdir -p server/src/{models,controllers,routes,middleware,services,utils,config,types}
mkdir -p shared/types
mkdir -p docs

# ── .env.example del servidor ─────────────────────────────
if [ ! -f server/.env.example ]; then
cat > server/.env.example << 'EOF'
# Server
PORT=5000
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb://localhost:27017/appointly
MONGODB_URI_TEST=mongodb://localhost:27017/appointly_test

# JWT
JWT_SECRET=your_super_secret_key_here
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your_refresh_secret_here
JWT_REFRESH_EXPIRES_IN=30d

# Email (Resend)
RESEND_API_KEY=

# SMS (Twilio)
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=

# Google Maps
GOOGLE_MAPS_API_KEY=

# Storage (Cloudinary)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Client URL (para CORS)
CLIENT_URL=http://localhost:3000
EOF
fi

# ── .env.example del cliente ──────────────────────────────
if [ ! -f client/.env.example ]; then
cat > client/.env.example << 'EOF'
VITE_API_URL=http://localhost:5000/api
VITE_GOOGLE_MAPS_KEY=
EOF
fi

# ── .gitignore global ─────────────────────────────────────
if [ ! -f .gitignore ]; then
cat > .gitignore << 'EOF'
# Dependencies
node_modules/
.pnp
.pnp.js

# Environment
.env
.env.local
.env.*.local

# Build
dist/
build/

# Logs
logs/
*.log
npm-debug.log*

# Editor
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# TypeScript
*.tsbuildinfo

# Cache
.eslintcache
.parcel-cache
EOF
fi

# ── README ────────────────────────────────────────────────
if [ ! -f README.md ]; then
cat > README.md << 'EOF'
# Appointly

Plataforma de agendamiento de citas para profesionales y negocios.

## Stack

- **Frontend:** React + Vite + TypeScript
- **Backend:** Node.js + Express + TypeScript
- **Database:** MongoDB + Mongoose
- **Auth:** JWT

## Desarrollo

```bash
# Instalar dependencias
cd server && npm install
cd ../client && npm install

# Correr en paralelo
npm run dev
```

## Puertos

| Servicio | Puerto |
|---|---|
| React (Vite) | 3000 |
| Express API | 5000 |
| MongoDB | 27017 |
EOF
fi

# ── npm install si ya existen package.json ────────────────
if [ -f server/package.json ]; then
    echo "    Installing server dependencies..."
    cd server && npm install && cd ..
fi

if [ -f client/package.json ]; then
    echo "    Installing client dependencies..."
    cd client && npm install && cd ..
fi

echo "[✓] Project Ready"
