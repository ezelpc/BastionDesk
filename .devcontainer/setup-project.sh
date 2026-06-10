#!/bin/bash

set -e

echo "[+] Setting up BastionBook project structure"

# ── Carpetas del monorepo ─────────────────────────────────
mkdir -p client/src
mkdir -p server/src/{models,controllers,routes,middleware,services,utils,config,types,scripts}
mkdir -p shared/types
mkdir -p docs

# ══════════════════════════════════════════════════════════
# RAÍZ
# ══════════════════════════════════════════════════════════

if [ ! -f package.json ]; then
cat > package.json << 'EOF'
{
  "name": "bastionbook",
  "version": "0.1.0",
  "description": "Plataforma de agendamiento para profesionales y oficios",
  "private": true,
  "scripts": {
    "dev": "concurrently --names \"API,CLIENT\" --prefix-colors \"cyan,magenta\" \"npm run dev --prefix server\" \"npm run dev --prefix client\"",
    "build": "npm run build --prefix server && npm run build --prefix client",
    "install:all": "npm install && npm install --prefix server && npm install --prefix client",
    "server": "npm run dev --prefix server",
    "client": "npm run dev --prefix client"
  },
  "devDependencies": {
    "concurrently": "^8.2.2"
  }
}
EOF
fi

# ══════════════════════════════════════════════════════════
# SERVER
# ══════════════════════════════════════════════════════════

if [ ! -f server/package.json ]; then
cat > server/package.json << 'EOF'
{
  "name": "bastionbook-server",
  "version": "0.1.0",
  "private": true,
  "main": "dist/index.js",
  "scripts": {
    "dev": "nodemon",
    "build": "tsc",
    "start": "node dist/index.js",
    "seed": "ts-node src/scripts/seed.ts",
    "migrate": "ts-node src/scripts/migrate.ts",
    "reset": "ts-node src/scripts/reset.ts"
  },
  "dependencies": {
    "bcryptjs": "^2.4.3",
    "cors": "^2.8.5",
    "dotenv": "^16.4.5",
    "express": "^4.19.2",
    "express-rate-limit": "^7.3.1",
    "express-validator": "^7.1.0",
    "helmet": "^7.1.0",
    "jsonwebtoken": "^9.0.2",
    "mongoose": "^8.4.1",
    "morgan": "^1.10.0"
  },
  "devDependencies": {
    "@types/bcryptjs": "^2.4.6",
    "@types/cors": "^2.8.17",
    "@types/express": "^4.17.21",
    "@types/jsonwebtoken": "^9.0.6",
    "@types/morgan": "^1.9.9",
    "@types/node": "^20.14.2",
    "nodemon": "^3.1.3",
    "ts-node": "^10.9.2",
    "typescript": "^5.4.5"
  }
}
EOF
fi

if [ ! -f server/tsconfig.json ]; then
cat > server/tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "sourceMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
EOF
fi

if [ ! -f server/nodemon.json ]; then
cat > server/nodemon.json << 'EOF'
{
  "watch": ["src"],
  "ext": "ts,json",
  "ignore": ["src/**/*.spec.ts", "dist"],
  "exec": "ts-node src/index.ts",
  "env": {
    "NODE_ENV": "development"
  }
}
EOF
fi

if [ ! -f server/.env.example ]; then
cat > server/.env.example << 'EOF'
# Server
PORT=5000
NODE_ENV=development

# MongoDB Atlas
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/bastionbook
MONGODB_URI_TEST=mongodb+srv://<user>:<password>@cluster.mongodb.net/bastionbook_test

# JWT
JWT_SECRET=
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=
JWT_REFRESH_EXPIRES_IN=30d

# Email (Resend)
RESEND_API_KEY=

# SMS (Twilio)
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=

# Google Maps
GOOGLE_MAPS_API_KEY=

# Cloudinary
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# CORS
CLIENT_URL=http://localhost:3000
EOF
fi

# ══════════════════════════════════════════════════════════
# CLIENT
# ══════════════════════════════════════════════════════════

if [ ! -f client/package.json ]; then
cat > client/package.json << 'EOF'
{
  "name": "bastionbook-client",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite --host --port 3000",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint src --ext .ts,.tsx"
  },
  "dependencies": {
    "axios": "^1.7.2",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.23.1"
  },
  "devDependencies": {
    "@types/react": "^18.3.3",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react": "^4.3.1",
    "autoprefixer": "^10.4.19",
    "postcss": "^8.4.38",
    "tailwindcss": "^3.4.4",
    "typescript": "^5.4.5",
    "vite": "^5.3.1"
  }
}
EOF
fi

if [ ! -f client/tsconfig.json ]; then
cat > client/tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
EOF
fi

if [ ! -f client/tsconfig.node.json ]; then
cat > client/tsconfig.node.json << 'EOF'
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true
  },
  "include": ["vite.config.ts"]
}
EOF
fi

if [ ! -f client/vite.config.ts ]; then
cat > client/vite.config.ts << 'EOF'
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: true,
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
    },
  },
});
EOF
fi

if [ ! -f client/.env.example ]; then
cat > client/.env.example << 'EOF'
VITE_API_URL=http://localhost:5000/api
VITE_GOOGLE_MAPS_KEY=
EOF
fi

# ══════════════════════════════════════════════════════════
# .gitignore global
# ══════════════════════════════════════════════════════════

if [ ! -f .gitignore ]; then
cat > .gitignore << 'EOF'
# Dependencies
node_modules/

# Environment
.env
.env.local
.env.*.local

# Build
dist/
build/

# Logs
*.log

# Editor
.vscode/
.DS_Store

# TypeScript
*.tsbuildinfo
EOF
fi

# ══════════════════════════════════════════════════════════
# npm install
# ══════════════════════════════════════════════════════════

echo "    Installing root dependencies..."
npm install

echo "    Installing server dependencies..."
cd server && npm install && cd ..

echo "    Installing client dependencies..."
cd client && npm install && cd ..

echo "[✓] Project Ready"