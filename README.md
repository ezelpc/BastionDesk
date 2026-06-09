<div align="center">

<img src="https://img.shields.io/badge/version-0.1.0-blue?style=flat-square" />
<img src="https://img.shields.io/badge/status-in%20development-orange?style=flat-square" />
<img src="https://img.shields.io/badge/license-MIT-green?style=flat-square" />

<br />
<br />

```
██████╗  █████╗ ███████╗████████╗██╗ ██████╗ ███╗   ██╗
██╔══██╗██╔══██╗██╔════╝╚══██╔══╝██║██╔═══██╗████╗  ██║
██████╔╝███████║███████╗   ██║   ██║██║   ██║██╔██╗ ██║
██╔══██╗██╔══██║╚════██║   ██║   ██║██║   ██║██║╚██╗██║
██████╔╝██║  ██║███████║   ██║   ██║╚██████╔╝██║ ╚████║
╚═════╝ ╚═╝  ╚═╝╚══════╝   ╚═╝   ╚═╝ ╚═════╝ ╚═╝  ╚═══╝
                                          B  O  O  K
```

### La plataforma de agendamiento para profesionales y oficios

[Características](#-características) · [Stack](#-stack) · [Inicio Rápido](#-inicio-rápido) · [Estructura](#-estructura-del-proyecto) · [Flujo](#-flujo-de-citas) · [Variables de Entorno](#-variables-de-entorno)

</div>

---

## ¿Qué es BastionBook?

**BastionBook** es una plataforma SaaS de agendamiento de citas diseñada para profesionales independientes y pequeños negocios — desde plomeros y electricistas hasta barberías y estilistas.

Cada profesional obtiene un **link único** (`bastionbook.com/u/mi-negocio`) que puede compartir con sus clientes por WhatsApp, Instagram o tarjeta digital. Sin app que instalar, sin complicaciones.

---

## ✨ Características

### Para Profesionales
- 🔗 **Perfil público** con link único y personalizable
- 📅 **Gestión de agenda** con horarios y días bloqueados
- 💼 **Catálogo de servicios** con precios fijos, por rango o a cotizar
- 📋 **Presupuestos digitales** con desglose de materiales y mano de obra
- ✍️ **Contratos digitales** con firma electrónica del cliente
- 📊 **Dashboard** con historial, estadísticas y calificaciones

### Para Clientes
- 📍 **Compartir ubicación** vía mapa interactivo o dirección manual
- 📸 **Fotos del problema** al agendar (para oficios)
- 🔔 **Recordatorios automáticos** 24h y 1h antes de la cita
- 📄 **Revisión y firma** de presupuestos y contratos desde el celular
- 🔄 **Seguimiento** de citas y visitas adicionales

### Dos modos de servicio

| Modo | Para quién | Flujo |
|---|---|---|
| 🏠 **Visita domiciliaria** | Plomeros, electricistas, albañiles, técnicos... | Diagnóstico → Presupuesto → Contrato → Obra |
| 🏪 **Servicio en local** | Barberías, estilistas, spas, dentistas... | Seleccionar servicio → Fecha y hora → Confirmar |

---

## 🛠 Stack

### Frontend
![React](https://img.shields.io/badge/React-20232A?style=flat-square&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-B73BFE?style=flat-square&logo=vite&logoColor=FFD62E)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat-square&logo=typescript&logoColor=white)

### Backend
![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=flat-square&logo=express&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat-square&logo=typescript&logoColor=white)

### Base de Datos
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=flat-square&logo=mongodb&logoColor=white)
![Mongoose](https://img.shields.io/badge/Mongoose-880000?style=flat-square&logoColor=white)

### Servicios Externos

| Servicio | Uso |
|---|---|
| Google Maps API | Ubicación del cliente en mapa |
| Resend | Notificaciones por email |
| Twilio | Recordatorios por SMS |
| Cloudinary | Almacenamiento de fotos y documentos |
| Stripe *(fase 2)* | Pagos y depósitos en línea |

### Infraestructura
![Vercel](https://img.shields.io/badge/Vercel-000000?style=flat-square&logo=vercel&logoColor=white)
![Railway](https://img.shields.io/badge/Railway-131415?style=flat-square&logo=railway&logoColor=white)
![MongoDB Atlas](https://img.shields.io/badge/MongoDB%20Atlas-4EA94B?style=flat-square&logo=mongodb&logoColor=white)

---

## 🚀 Inicio Rápido

### Prerrequisitos

- Node.js 22+
- MongoDB (local o Atlas)
- Git

### Instalación

```bash
# 1. Clonar el repositorio
git clone https://github.com/tu-usuario/bastionbook.git
cd bastionbook

# 2. Instalar dependencias del servidor
cd server
npm install
cp .env.example .env   # Editar con tus valores

# 3. Instalar dependencias del cliente
cd ../client
npm install
cp .env.example .env
```

### Correr en desarrollo

```bash
# Desde la raíz del proyecto — levanta cliente y servidor en paralelo
npm run dev
```

O por separado:

```bash
# Terminal 1 — API
cd server && npm run dev

# Terminal 2 — Cliente
cd client && npm run dev
```

### URLs

| Servicio | URL |
|---|---|
| React (Vite) | http://localhost:3000 |
| Express API | http://localhost:5000 |
| MongoDB | mongodb://localhost:27017/bastionbook |

---

## 📁 Estructura del Proyecto

```
bastionbook/
│
├── client/                       # React + Vite + TypeScript
│   ├── src/
│   │   ├── components/           # Componentes reutilizables
│   │   ├── pages/                # Vistas principales
│   │   │   ├── [slug]/           # Perfil público del profesional
│   │   │   ├── dashboard/        # Panel del profesional
│   │   │   └── client/           # Vista del cliente
│   │   ├── hooks/                # Custom hooks
│   │   ├── services/             # Llamadas a la API
│   │   ├── store/                # Estado global
│   │   └── types/                # Tipos TypeScript
│   └── .env.example
│
├── server/                       # Node.js + Express + TypeScript
│   ├── src/
│   │   ├── models/               # Modelos Mongoose
│   │   │   ├── User.ts
│   │   │   ├── Business.ts
│   │   │   ├── Appointment.ts
│   │   │   ├── Quote.ts
│   │   │   ├── Contract.ts
│   │   │   └── Notification.ts
│   │   ├── controllers/          # Lógica de cada recurso
│   │   ├── routes/               # Definición de endpoints
│   │   ├── middleware/           # Auth, validación, errores
│   │   ├── services/             # Email, SMS, mapas, PDFs
│   │   ├── utils/                # Helpers y utilidades
│   │   └── types/                # Enums y tipos compartidos
│   └── .env.example
│
├── shared/                       # Tipos compartidos cliente/servidor
├── .devcontainer/                # Dev Container (VS Code)
└── README.md
```

---

## 🔄 Flujo de Citas

### Modo Oficios (visita domiciliaria)

```
Cliente agenda diagnóstico
         │
         ▼
Profesional confirma cita  ──→  Recordatorios automáticos (24h / 1h)
         │
         ▼
Visita de diagnóstico
         │
         ▼
Profesional sube presupuesto + lista de materiales
         │
         ▼
Cliente recibe notificación → revisa → aprueba o rechaza
         │
         ▼ (aprobado)
Contrato digital generado automáticamente
         │
         ▼
Cliente firma digitalmente
         │
         ▼
Se agenda visita de obra  ──→  Recordatorios automáticos
         │
         ▼
Trabajo ejecutado
         │
         ▼
¿Requiere seguimiento?
    ├── Sí → Nueva cita de seguimiento
    └── No → Cierre + solicitud de calificación
```

### Modo Local (barbería, estilista, etc.)

```
Cliente elige servicio → fecha → hora disponible
         │
         ▼
Confirmación inmediata + recordatorio 24h y 1h
         │
         ▼
Cita completada → Calificación
```

---

## 🗄️ Modelos de Base de Datos

| Colección | Descripción |
|---|---|
| `users` | Clientes y profesionales |
| `businesses` | Perfil del negocio, horarios, servicios |
| `appointments` | Ciclo de vida completo de cada cita |
| `quotes` | Presupuestos con desglose de materiales |
| `contracts` | Contratos con firma digital |
| `notifications` | Cola de recordatorios y alertas |

---

## 🔐 Variables de Entorno

### server/.env

```env
# Servidor
PORT=5000
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb://localhost:27017/bastionbook

# JWT
JWT_SECRET=
JWT_EXPIRES_IN=7d

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
```

### client/.env

```env
VITE_API_URL=http://localhost:5000/api
VITE_GOOGLE_MAPS_KEY=
```

---

## 📋 Scripts Disponibles

### Servidor

```bash
npm run dev        # Desarrollo con nodemon
npm run build      # Compilar TypeScript
npm run start      # Producción
npm run lint       # ESLint
```

### Cliente

```bash
npm run dev        # Vite dev server
npm run build      # Build de producción
npm run preview    # Preview del build
npm run lint       # ESLint
```

---

## 🗺️ Roadmap

- [x] Base de datos — modelos y relaciones
- [x] Dev Container configurado
- [ ] Autenticación JWT (registro / login)
- [ ] CRUD de negocios y servicios
- [ ] Sistema de agendamiento
- [ ] Presupuestos y contratos digitales
- [ ] Firma digital
- [ ] Notificaciones email y SMS
- [ ] Integración Google Maps
- [ ] Dashboard del profesional
- [ ] Vista pública del profesional (`/u/slug`)
- [ ] Pagos en línea (Stripe)
- [ ] App móvil

---

## 📄 Licencia

MIT © 2026 BastionBook

---

<div align="center">
  Hecho con 🔨 para los que trabajan con sus manos
</div>
# BastionDesk