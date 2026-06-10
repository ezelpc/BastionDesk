FROM mcr.microsoft.com/devcontainers/javascript-node:22-bookworm

# ── System tools (single layer) ───────────────────────────
RUN apt-get update && apt-get install -y --no-install-recommends \
    jq \
    tree \
    unzip \
    zip \
    vim \
    nano \
    gnupg \
    && rm -rf /var/lib/apt/lists/*

# ── MongoDB Shell (mongosh) ───────────────────────────────
RUN curl -fsSL https://www.mongodb.org/static/pgp/server-8.0.asc | \
    gpg -o /usr/share/keyrings/mongodb-server-8.0.gpg --dearmor && \
    echo "deb [ signed-by=/usr/share/keyrings/mongodb-server-8.0.gpg ] https://repo.mongodb.org/apt/debian bookworm/mongodb-org/8.0 main" \
    | tee /etc/apt/sources.list.d/mongodb-org-8.0.list && \
    apt-get update && \
    apt-get install -y --no-install-recommends mongodb-mongosh && \
    rm -rf /var/lib/apt/lists/*

# ── Global npm packages + fix permisos (single layer, como root) ─────
RUN npm install -g \
    typescript \
    ts-node \
    nodemon \
    concurrently \
    dotenv-cli \
    && chown -R node:node /usr/local/share/npm-global 2>/dev/null || true

# ── Cambiar a usuario node para el resto ─────────────────
USER node