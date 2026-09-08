# BastionDesk

> Security-oriented service management platform focused on operational workflows, automation and maintainable backend/frontend architecture.

[![Status](https://img.shields.io/badge/status-in%20development-orange?style=flat-square)](https://github.com/ezelpc/BastionDesk)
[![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)](https://github.com/ezelpc/BastionDesk)

## 🎯 Project goal

BastionDesk is an engineering project focused on building a structured platform for managing service operations, users, workflows and supporting information through a modern web stack.

The project is part of a broader portfolio demonstrating **full-stack engineering, secure application design and DevSecOps practices**.

## 🧩 Capabilities

- User and service management
- Operational workflow management
- Dashboard-oriented interface
- API-driven backend architecture
- Authentication and authorization foundations
- Database-backed business logic
- Environment-based configuration
- Development container support

## 🏗️ Architecture

```text
┌──────────────────────┐
│      Web Client      │
│   React / Vite / TS  │
└──────────┬───────────┘
           │ HTTPS / REST
           ▼
┌──────────────────────┐
│      API Layer       │
│ Node.js / Express    │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│    Persistence       │
│ MongoDB / Mongoose   │
└──────────────────────┘

Security controls surround the application:
validation · authentication · authorization · secrets management · dependency auditing
```

## 🛠️ Stack

| Layer | Technologies |
|---|---|
| Frontend | React · Vite · TypeScript |
| Backend | Node.js · Express · TypeScript |
| Database | MongoDB · Mongoose |
| Infrastructure | Docker · Dev Containers |
| External services | Maps · Email · Notifications · Cloud storage |

## 🔐 Security engineering

The project is being developed with security as part of the application lifecycle rather than as a final review.

Planned/target controls include:

- Authentication and authorization
- Input validation
- Secure HTTP headers and CORS policy
- Secrets outside source control
- Dependency vulnerability auditing
- Container hardening
- SAST and secret scanning in CI
- Least-privilege service access
- Security-focused logging and error handling

**No production credentials or real customer data belong in this repository.**

## 🚀 Local development

### Prerequisites

- Node.js 20+
- MongoDB local instance or MongoDB Atlas
- Git

### Setup

```bash
git clone https://github.com/ezelpc/BastionDesk.git
cd BastionDesk

# Install dependencies according to the client/server structure
npm install
```

Use the repository's `.env.example` files when available. Never commit populated `.env` files or API credentials.

## 📁 Project structure

```text
BastionDesk/
├── client/          # Web application
├── server/          # API and business logic
├── shared/          # Shared types/utilities when applicable
├── .devcontainer/   # Reproducible development environment
└── README.md
```

> The structure may evolve while the project is under active development.

## 🗺️ Roadmap

- [ ] Complete authentication and authorization flows
- [ ] Strengthen API validation and error handling
- [ ] Add automated tests
- [ ] Add SAST / SCA / secret scanning to CI
- [ ] Add container image scanning and SBOM generation
- [ ] Improve observability and audit logging
- [ ] Document deployment architecture

## 📌 Portfolio context

BastionDesk demonstrates breadth beyond the cloud-security flagship projects in this GitHub profile. It is intentionally presented as a **software engineering + security** project rather than as a finished commercial SaaS.

For the strongest DevSecOps examples, see:

- [AURONTEK](https://github.com/ezelpc/AURONTEK) — AWS / Cloud Security / DevSecOps
- [BastionGuard](https://github.com/ezelpc/BastionGuard) — Secure SDLC / AppSec
- [SOAR Log Analyzer](https://github.com/ezelpc/soar-log-analyzer) — SOC / Detection Engineering

## 📄 License

MIT © 2026 Ezequiel Nahun Pérez
