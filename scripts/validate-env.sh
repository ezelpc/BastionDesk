#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────
# BastionDesk — Environment Variable Validator (bash version)
#
# Uso:
#   ./scripts/validate-env.sh              # modo normal
#   STRICT_MODE=true ./scripts/validate-env.sh  # modo estricto
#
# Retorna:
#   0  → OK (puede tener warnings en modo normal)
#   1  → ERROR (variables críticas faltantes o modo estricto)
# ─────────────────────────────────────────────────────────────

set -euo pipefail

STRICT_MODE="${STRICT_MODE:-false}"
ERRORS=0
WARNINGS=0

# ── Colores ──────────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m'

ok()   { echo -e "  ${GREEN}✅ $1${NC}"; }
warn() { echo -e "  ${YELLOW}⚠️  $1${NC}"; ((WARNINGS++)) || true; }
err()  { echo -e "  ${RED}❌ $1${NC}"; ((ERRORS++)) || true; }

check_var() {
  local KEY="$1"
  local DESCRIPTION="$2"
  local CRITICAL="${3:-false}"
  local VAL="${!KEY:-}"

  if [[ -z "$VAL" ]]; then
    if [[ "$CRITICAL" == "true" ]] || [[ "$STRICT_MODE" == "true" ]]; then
      err "$KEY — $DESCRIPTION — MISSING or EMPTY"
      ((ERRORS++)) || true
    else
      warn "$KEY — $DESCRIPTION — NOT SET"
    fi
  elif echo "$VAL" | grep -qiE "your_.*_here|changeme|placeholder"; then
    err "$KEY — Contains a placeholder value — Replace with real secret"
    ((ERRORS++)) || true
  else
    ok "$KEY — $DESCRIPTION"
  fi
}

# ── Banner ────────────────────────────────────────────────────
echo -e "${BOLD}"
echo "╔══════════════════════════════════════════════════╗"
echo "║     BastionDesk — Environment Variable Check     ║"
printf "║     Mode: %-39s║\n" "${STRICT_MODE^^}"
echo "╚══════════════════════════════════════════════════╝"
echo -e "${NC}"

# ── Variables CRÍTICAS ────────────────────────────────────────
echo -e "${BOLD}🔴 Critical Variables${NC}"
check_var "JWT_SECRET"         "Clave secreta JWT (mín. 32 chars)"         "true"
check_var "JWT_REFRESH_SECRET" "Clave secreta JWT Refresh (mín. 32 chars)" "true"
check_var "MONGODB_URI"        "URI de conexión a MongoDB"                 "true"

# Validar longitud de JWT_SECRET
if [[ -n "${JWT_SECRET:-}" ]] && [[ ${#JWT_SECRET} -lt 32 ]]; then
  err "JWT_SECRET — Too short (${#JWT_SECRET} chars) — Minimum is 32 chars"
  ((ERRORS++)) || true
fi
if [[ -n "${JWT_REFRESH_SECRET:-}" ]] && [[ ${#JWT_REFRESH_SECRET} -lt 32 ]]; then
  err "JWT_REFRESH_SECRET — Too short (${#JWT_REFRESH_SECRET} chars) — Minimum is 32 chars"
  ((ERRORS++)) || true
fi

# Validar formato de MONGODB_URI
if [[ -n "${MONGODB_URI:-}" ]] && ! echo "$MONGODB_URI" | grep -qE "^mongodb(\+srv)?://"; then
  err "MONGODB_URI — Invalid format — Must start with mongodb:// or mongodb+srv://"
  ((ERRORS++)) || true
fi

echo ""

# ── Variables REQUERIDAS ──────────────────────────────────────
echo -e "${BOLD}🟡 Required Variables${NC}"

# Server
check_var "PORT"                   "Puerto del servidor Express"
check_var "NODE_ENV"               "Entorno de Node.js"
check_var "CLIENT_URL"             "URL del cliente para CORS"
check_var "MONGODB_URI_TEST"       "URI de MongoDB para tests"

# JWT
check_var "JWT_EXPIRES_IN"         "Expiración del JWT"
check_var "JWT_REFRESH_EXPIRES_IN" "Expiración del JWT Refresh"

# Email
check_var "RESEND_API_KEY"         "API Key de Resend (email)"

# SMS
check_var "TWILIO_ACCOUNT_SID"     "Twilio Account SID"
check_var "TWILIO_AUTH_TOKEN"      "Twilio Auth Token"
check_var "TWILIO_PHONE_NUMBER"    "Número de Twilio"

# Maps
check_var "GOOGLE_MAPS_API_KEY"    "Google Maps API Key"

# Cloudinary
check_var "CLOUDINARY_CLOUD_NAME"  "Cloudinary Cloud Name"
check_var "CLOUDINARY_API_KEY"     "Cloudinary API Key"
check_var "CLOUDINARY_API_SECRET"  "Cloudinary API Secret"

# Cliente
check_var "VITE_API_URL"           "URL de la API para Vite"
check_var "VITE_GOOGLE_MAPS_KEY"   "Google Maps Key para cliente"

# ── Resumen ───────────────────────────────────────────────────
echo ""
echo "────────────────────────────────────────────────────"
echo -e "  Errors   : $([ $ERRORS -gt 0 ] && echo "${RED}$ERRORS${NC}" || echo "${GREEN}$ERRORS${NC}")"
echo -e "  Warnings : $([ $WARNINGS -gt 0 ] && echo "${YELLOW}$WARNINGS${NC}" || echo "${GREEN}$WARNINGS${NC}")"
echo -e "  Mode     : $STRICT_MODE"
echo "────────────────────────────────────────────────────"

if [[ $ERRORS -gt 0 ]]; then
  echo -e "\n${RED}${BOLD}❌ Validation FAILED — $ERRORS error(s) found.${NC}"
  echo -e "${RED}   Configure the required secrets in:${NC}"
  echo -e "${RED}   → GitHub: Settings → Secrets → Actions${NC}"
  echo -e "${RED}   → Jenkins: Manage Jenkins → Credentials${NC}\n"
  exit 1
else
  echo -e "\n${GREEN}${BOLD}✅ Validation PASSED$([ $WARNINGS -gt 0 ] && echo " with $WARNINGS warning(s)" || echo "").${NC}\n"
fi
