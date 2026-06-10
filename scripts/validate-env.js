#!/usr/bin/env node
/**
 * BastionDesk — Environment Variables Validator
 *
 * Verifica que todas las variables de entorno requeridas
 * estén definidas y no estén vacías.
 *
 * Uso:
 *   node scripts/validate-env.js              # modo normal
 *   STRICT_MODE=true node scripts/validate-env.js  # falla si alguna está vacía
 *
 * Usado por:
 *   - GitHub Actions (ci-devsecops.yml)
 *   - GitHub Actions (env-validation.yml)
 *   - Jenkinsfile
 */

'use strict';

const STRICT_MODE = process.env.STRICT_MODE === 'true';

// ──────────────────────────────────────────────────────────────
// Definición de variables requeridas
// ──────────────────────────────────────────────────────────────

/**
 * Variables CRÍTICAS — pipeline falla si están ausentes o vacías
 * independientemente del modo
 */
const CRITICAL = [
  { key: 'JWT_SECRET',          description: 'Clave secreta JWT — mín. 32 chars' },
  { key: 'JWT_REFRESH_SECRET',  description: 'Clave secreta JWT Refresh — mín. 32 chars' },
  { key: 'MONGODB_URI',         description: 'URI de conexión a MongoDB' },
];

/**
 * Variables REQUERIDAS — pipeline falla si no existen
 * En modo estricto también falla si están vacías
 */
const REQUIRED = [
  // Servidor
  { key: 'PORT',                  description: 'Puerto del servidor Express',         default: '5000' },
  { key: 'NODE_ENV',              description: 'Entorno de Node.js',                  default: 'development' },
  { key: 'CLIENT_URL',            description: 'URL del cliente para CORS',           default: 'http://localhost:3000' },

  // MongoDB
  { key: 'MONGODB_URI_TEST',      description: 'URI de MongoDB para tests' },

  // JWT
  { key: 'JWT_EXPIRES_IN',        description: 'Expiración del JWT',                  default: '7d' },
  { key: 'JWT_REFRESH_EXPIRES_IN', description: 'Expiración del JWT Refresh',         default: '30d' },

  // Email
  { key: 'RESEND_API_KEY',        description: 'API Key de Resend (email)' },

  // SMS
  { key: 'TWILIO_ACCOUNT_SID',    description: 'Twilio Account SID' },
  { key: 'TWILIO_AUTH_TOKEN',     description: 'Twilio Auth Token' },
  { key: 'TWILIO_PHONE_NUMBER',   description: 'Número de Twilio' },

  // Maps
  { key: 'GOOGLE_MAPS_API_KEY',   description: 'Google Maps API Key' },

  // Cloudinary
  { key: 'CLOUDINARY_CLOUD_NAME', description: 'Cloudinary Cloud Name' },
  { key: 'CLOUDINARY_API_KEY',    description: 'Cloudinary API Key' },
  { key: 'CLOUDINARY_API_SECRET', description: 'Cloudinary API Secret' },

  // Cliente (Vite)
  { key: 'VITE_API_URL',          description: 'URL de la API para el cliente Vite' },
  { key: 'VITE_GOOGLE_MAPS_KEY',  description: 'Google Maps Key para el cliente' },
];

// ──────────────────────────────────────────────────────────────
// Utilidades
// ──────────────────────────────────────────────────────────────

const GREEN  = '\x1b[32m';
const YELLOW = '\x1b[33m';
const RED    = '\x1b[31m';
const BLUE   = '\x1b[34m';
const RESET  = '\x1b[0m';
const BOLD   = '\x1b[1m';

function ok(msg)   { console.log(`  ${GREEN}✅ ${msg}${RESET}`); }
function warn(msg) { console.warn(`  ${YELLOW}⚠️  ${msg}${RESET}`); }
function err(msg)  { console.error(`  ${RED}❌ ${msg}${RESET}`); }
function info(msg) { console.log(`${BLUE}${msg}${RESET}`); }
function header(msg) { console.log(`\n${BOLD}${msg}${RESET}`); }

// ──────────────────────────────────────────────────────────────
// Validación
// ──────────────────────────────────────────────────────────────

let errors = 0;
let warnings = 0;

console.log(`
╔══════════════════════════════════════════════════╗
║     BastionDesk — Environment Variable Check     ║
║     Mode: ${STRICT_MODE ? 'STRICT' : 'NORMAL '}                              ║
╚══════════════════════════════════════════════════╝
`);

// -- CRITICAL CHECK --
header('🔴 Critical Variables');
for (const { key, description } of CRITICAL) {
  const val = process.env[key];
  if (!val || val.trim() === '') {
    err(`${key} — ${description} — MISSING or EMPTY`);
    errors++;
  } else if (val.includes('your_') || val.includes('changeme') || val.includes('placeholder')) {
    err(`${key} — Contains a placeholder value — Replace with real secret`);
    errors++;
  } else {
    ok(`${key} — ${description}`);
  }
}

// -- REQUIRED CHECK --
header('🟡 Required Variables');
for (const { key, description, default: def } of REQUIRED) {
  const val = process.env[key];

  if (!val || val.trim() === '') {
    if (def) {
      if (STRICT_MODE) {
        err(`${key} — ${description} — EMPTY (strict mode: must be explicitly set)`);
        errors++;
      } else {
        warn(`${key} — ${description} — EMPTY (using default: ${def})`);
        warnings++;
      }
    } else {
      if (STRICT_MODE) {
        err(`${key} — ${description} — MISSING`);
        errors++;
      } else {
        warn(`${key} — ${description} — NOT SET`);
        warnings++;
      }
    }
  } else if (val.includes('your_') || val.includes('changeme')) {
    err(`${key} — Contains placeholder value`);
    errors++;
  } else {
    ok(`${key} — ${description}`);
  }
}

// -- SUMMARY --
console.log(`
${'─'.repeat(52)}
  Errors   : ${errors > 0 ? RED : GREEN}${errors}${RESET}
  Warnings : ${warnings > 0 ? YELLOW : GREEN}${warnings}${RESET}
  Mode     : ${STRICT_MODE ? 'STRICT' : 'NORMAL'}
${'─'.repeat(52)}
`);

if (errors > 0) {
  console.error(`${RED}${BOLD}❌ Validation FAILED — ${errors} error(s) found.${RESET}`);
  console.error(`${RED}   Set the required secrets in GitHub Settings → Secrets → Actions${RESET}`);
  console.error(`${RED}   or in your Jenkins credentials store.${RESET}\n`);
  process.exit(1);
} else {
  console.log(`${GREEN}${BOLD}✅ Validation PASSED${warnings > 0 ? ` with ${warnings} warning(s)` : ''}.${RESET}\n`);
}
