#!/bin/bash

set -e

echo "[+] Verifying Environment"

ALL_OK=true

check() {
    local name=$1
    local cmd=$2
    local version

    if version=$($cmd 2>/dev/null); then
        echo "    ✓ $name: $version"
    else
        echo "    ✗ $name: NOT FOUND"
        ALL_OK=false
    fi
}

# ── Versiones del stack ───────────────────────────────────
check "Node.js"    "node --version"
check "npm"        "npm --version"
check "TypeScript" "tsc --version"
check "ts-node"    "ts-node --version"
check "nodemon"    "nodemon --version"
check "mongosh"    "mongosh --version"
check "Git"        "git --version"

echo ""

if [ "$ALL_OK" = true ]; then
    echo "[✓] All tools verified"
else
    echo "[!] Some tools are missing — check the output above"
    exit 1
fi
