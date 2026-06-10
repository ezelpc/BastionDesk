#!/usr/bin/env node
/**
 * BastionDesk — Environment Variables Validator
 *
 * Modos de operación:
 *
 *   NORMAL (default)
 *     Variables críticas faltantes → ERROR (bloquea pipeline)
 *     Variables requeridas faltantes → WARNING (no bloquea)
 *
 *   STRICT  (STRICT_MODE=true)
 *     Cualquier variable faltante → ERROR
 *
 *   BOOTSTRAP (auto-detectado)
 *     Se activa cuando corre en GitHub Actions y NINGÚN secret
 *     crítico está configurado aún. Reporta todo como WARNING
 *     y sugiere el siguiente paso de configuración.
 *     También activable con BOOTSTRAP_MODE=true.
 *
 * Uso:
 *   node scripts/validate-env.js
 *   STRICT_MODE=true node scripts/validate-env.js
 *   BOOTSTRAP_MODE=true node scripts/validate-env.js
 *
 * Usado por:
 *   - GitHub Actions (ci-devsecops.yml, env-validation.yml)
 *   - Jenkinsfile
 *   - Desarrollo local: npm run env:validate
 */

'use strict';

// ──────────────────────────────────────────────────────────────
// Modo de operación
// ──────────────────────────────────────────────────────────────

const IS_GITHUB_ACTIONS = process.env.GITHUB_ACTIONS === 'true';
const STRICT_MODE       = process.env.STRICT_MODE    === 'true';
const FORCE_BOOTSTRAP   = process.env.BOOTSTRAP_MODE === 'true';

const fs   = require('fs');
const path = require('path');

// ──────────────────────────────────────────────────────────────
// Carga dinámica desde .env.example
// ──────────────────────────────────────────────────────────────

const SERVER_ENV_EX = path.join(__dirname, '../server/.env.example');
const CLIENT_ENV_EX = path.join(__dirname, '../client/.env.example');

const CRITICAL_KEYS = new Set(['JWT_SECRET', 'JWT_REFRESH_SECRET', 'MONGODB_URI']);

const KEY_DESCRIPTIONS = {
  JWT_SECRET: 'Clave secreta JWT (mín. 32 chars)',
  JWT_REFRESH_SECRET: 'Clave secreta JWT Refresh (mín. 32 chars)',
  MONGODB_URI: 'URI de conexión a MongoDB',
  PORT: 'Puerto del servidor Express',
  NODE_ENV: 'Entorno de Node.js',
  CLIENT_URL: 'URL del cliente para CORS',
  MONGODB_URI_TEST: 'URI de MongoDB para tests',
  JWT_EXPIRES_IN: 'Tiempo de expiración del JWT',
  JWT_REFRESH_EXPIRES_IN: 'Tiempo de expiración del Refresh',
  RESEND_API_KEY: 'API Key de Resend (email)',
  TWILIO_ACCOUNT_SID: 'Twilio Account SID',
  TWILIO_AUTH_TOKEN: 'Twilio Auth Token',
  TWILIO_PHONE_NUMBER: 'Número de teléfono Twilio',
  GOOGLE_MAPS_API_KEY: 'Google Maps API Key',
  CLOUDINARY_CLOUD_NAME: 'Cloudinary Cloud Name',
  CLOUDINARY_API_KEY: 'Cloudinary API Key',
  CLOUDINARY_API_SECRET: 'Cloudinary API Secret',
  VITE_API_URL: 'URL de la API para el cliente Vite',
  VITE_GOOGLE_MAPS_KEY: 'Google Maps Key para el frontend'
};

const CRITICAL = [];
const REQUIRED = [];

function loadFromEnvExample(filePath) {
  if (!fs.existsSync(filePath)) return;
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split(/\r?\n/);
  
  let currentSection = '';
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    if (line.startsWith('#')) {
      currentSection = line.replace(/^#\s*/, '').trim();
      continue;
    }
    
    const parts = line.split('=');
    if (parts.length >= 1) {
      const key = parts[0].trim();
      if (!key || key.startsWith('#')) continue;
      
      const defaultValue = parts.slice(1).join('=').trim();
      const cleanDefault = defaultValue === '' ? undefined : defaultValue;
      
      // Intentar obtener descripción de KEY_DESCRIPTIONS, si no, del nombre de sección, si no, fallback
      const description = KEY_DESCRIPTIONS[key] || 
                          (currentSection ? `${currentSection} variable` : `Variable ${key}`);

      const variableDef = {
        key,
        description,
        default: cleanDefault
      };
      
      if (CRITICAL_KEYS.has(key)) {
        CRITICAL.push({ key, description });
      } else {
        REQUIRED.push(variableDef);
      }
    }
  }
}

loadFromEnvExample(SERVER_ENV_EX);
loadFromEnvExample(CLIENT_ENV_EX);

// ──────────────────────────────────────────────────────────────
// Utilidades de color
// ──────────────────────────────────────────────────────────────

const GREEN  = '\x1b[32m';
const YELLOW = '\x1b[33m';
const RED    = '\x1b[31m';
const CYAN   = '\x1b[36m';
const RESET  = '\x1b[0m';
const BOLD   = '\x1b[1m';
const DIM    = '\x1b[2m';

const ok     = (msg) => console.log(`  ${GREEN}✅ ${msg}${RESET}`);
const warn   = (msg) => console.warn(`  ${YELLOW}⚠️  ${msg}${RESET}`);
const err    = (msg) => console.error(`  ${RED}❌ ${msg}${RESET}`);
const header = (msg) => console.log(`\n${BOLD}${msg}${RESET}`);
const hint   = (msg) => console.log(`  ${DIM}   ${msg}${RESET}`);

// ──────────────────────────────────────────────────────────────
// Detectar modo bootstrap automáticamente
// Si corremos en GitHub Actions y TODOS los críticos están vacíos
// → es un setup inicial, no una configuración parcial rota
// ──────────────────────────────────────────────────────────────

function detectBootstrap() {
  if (FORCE_BOOTSTRAP) return true;
  if (!IS_GITHUB_ACTIONS) return false;

  // Bootstrap solo si NINGÚN secret crítico está configurado
  const allCriticalEmpty = CRITICAL.every(({ key }) => {
    const val = process.env[key];
    return !val || val.trim() === '';
  });

  // Si al menos uno está configurado, NO es bootstrap
  // (podría ser una configuración parcial rota → error real)
  return allCriticalEmpty;
}

const BOOTSTRAP_MODE = detectBootstrap();

// ──────────────────────────────────────────────────────────────
// Determinar el modo activo
// ──────────────────────────────────────────────────────────────

let MODE_LABEL;
if (BOOTSTRAP_MODE) {
  MODE_LABEL = 'BOOTSTRAP';
} else if (STRICT_MODE) {
  MODE_LABEL = 'STRICT  ';
} else {
  MODE_LABEL = 'NORMAL  ';
}

// ──────────────────────────────────────────────────────────────
// Validación
// ──────────────────────────────────────────────────────────────

let errors   = 0;
let warnings = 0;

const PLACEHOLDERS = ['your_', 'changeme', 'placeholder', 'example', 'replace_me', 'todo'];
const isPlaceholder = (val) => PLACEHOLDERS.some(p => val.toLowerCase().includes(p));

console.log(`
╔══════════════════════════════════════════════════╗
║     BastionDesk — Environment Variable Check     ║
║     Mode: ${MODE_LABEL}                              ║
╚══════════════════════════════════════════════════╝`);

if (BOOTSTRAP_MODE) {
  console.log(`
${YELLOW}${BOLD}  ⚡ Bootstrap mode detected — no secrets configured yet.${RESET}
${YELLOW}  This is expected on first run. Configure GitHub Secrets at:${RESET}
${CYAN}  → github.com/<org>/<repo>/settings/secrets/actions${RESET}
`);
}

// ── Critical Variables ──────────────────────────────────────
header('🔴 Critical Variables');

for (const { key, description } of CRITICAL) {
  const val = process.env[key];
  const empty = !val || val.trim() === '';

  if (empty) {
    if (BOOTSTRAP_MODE) {
      warn(`${key} — NOT CONFIGURED`);
      hint(`${description}`);
      warnings++;
    } else {
      err(`${key} — ${description} — MISSING or EMPTY`);
      hint(`Set it in GitHub Settings → Secrets → Actions  (or Jenkins credentials)`);
      errors++;
    }
  } else if (isPlaceholder(val)) {
    // Placeholder siempre es error, incluso en bootstrap
    err(`${key} — Contains a placeholder value — Replace with a real secret`);
    hint(`Current value starts with: "${val.substring(0, 20)}..."`);
    errors++;
  } else {
    ok(`${key} — ${description}`);
  }
}

// Validaciones de formato para vars críticas presentes
const jwtSecret = process.env.JWT_SECRET;
if (jwtSecret && jwtSecret.trim() && !isPlaceholder(jwtSecret) && jwtSecret.length < 32) {
  err(`JWT_SECRET — Too short (${jwtSecret.length} chars) — Minimum is 32 characters`);
  errors++;
}

const jwtRefresh = process.env.JWT_REFRESH_SECRET;
if (jwtRefresh && jwtRefresh.trim() && !isPlaceholder(jwtRefresh) && jwtRefresh.length < 32) {
  err(`JWT_REFRESH_SECRET — Too short (${jwtRefresh.length} chars) — Minimum is 32 characters`);
  errors++;
}

const mongoUri = process.env.MONGODB_URI;
if (mongoUri && mongoUri.trim() && !isPlaceholder(mongoUri) && !/^mongodb(\+srv)?:\/\/.+/.test(mongoUri)) {
  err(`MONGODB_URI — Invalid format — Must start with mongodb:// or mongodb+srv://`);
  errors++;
}

// ── Required Variables ──────────────────────────────────────
header('🟡 Required Variables');

for (const { key, description, default: def } of REQUIRED) {
  const val = process.env[key];
  const empty = !val || val.trim() === '';

  if (empty) {
    const defaultNote = def ? ` (using default: ${def})` : '';
    if (STRICT_MODE && !BOOTSTRAP_MODE) {
      err(`${key} — ${description} — EMPTY${def ? ` (default available: ${def})` : ''}`);
      errors++;
    } else {
      warn(`${key} — ${description}${defaultNote || ' — NOT SET'}`);
      warnings++;
    }
  } else if (isPlaceholder(val)) {
    err(`${key} — Contains a placeholder value`);
    errors++;
  } else {
    ok(`${key} — ${description}`);
  }
}

// ── Summary ─────────────────────────────────────────────────
const errColor  = errors   > 0 ? RED    : GREEN;
const warnColor = warnings > 0 ? YELLOW : GREEN;

console.log(`
${'─'.repeat(52)}
  Errors   : ${errColor}${errors}${RESET}
  Warnings : ${warnColor}${warnings}${RESET}
  Mode     : ${BOLD}${MODE_LABEL.trim()}${RESET}${IS_GITHUB_ACTIONS ? `  ${DIM}(GitHub Actions)${RESET}` : ''}
${'─'.repeat(52)}
`);

// ── Exit ─────────────────────────────────────────────────────
if (errors > 0) {
  console.error(`${RED}${BOLD}❌ Validation FAILED — ${errors} error(s) must be fixed.${RESET}`);
  if (!BOOTSTRAP_MODE) {
    console.error(`\n${RED}  Where to configure secrets:${RESET}`);
    console.error(`${RED}  • GitHub : Settings → Secrets → Actions${RESET}`);
    console.error(`${RED}  • Jenkins: Manage Jenkins → Credentials${RESET}`);
    console.error(`${RED}  • Local  : Edit server/.env  (copy from server/.env.example)${RESET}\n`);
  }
  process.exit(1);
} else if (BOOTSTRAP_MODE) {
  console.log(`${YELLOW}${BOLD}⚡ Bootstrap check complete — ${warnings} secret(s) not yet configured.${RESET}`);
  console.log(`${YELLOW}  Pipeline will pass until secrets are partially configured.${RESET}`);
  console.log(`${YELLOW}  Once you add any secret, bootstrap mode deactivates automatically.${RESET}\n`);
  // Salir con 0 en bootstrap — no bloquear el pipeline inicial
  process.exit(0);
} else {
  console.log(`${GREEN}${BOLD}✅ Validation PASSED${warnings > 0 ? ` — ${warnings} optional variable(s) not set` : ''}.${RESET}\n`);
}
