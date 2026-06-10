# 🗄️ Appointly — Documentación de Base de Datos

## Stack
- **Motor:** MongoDB Atlas
- **ODM:** Mongoose + TypeScript

---

## 📊 Diagrama de Relaciones

```
┌─────────────┐       ┌──────────────────┐
│    USER      │───────│    BUSINESS       │
│  (cliente/   │  1:1  │  (perfil del      │
│ profesional) │       │   profesional)    │
└─────────────┘       └──────────────────┘
       │                       │
       │                       │
       └──────────┬────────────┘
                  │
                  ▼
         ┌─────────────────┐
         │   APPOINTMENT    │
         │  (toda la lógica │
         │   de la cita)    │
         └─────────────────┘
                  │
         ┌────────┴────────┐
         │                 │
         ▼                 ▼
    ┌─────────┐      ┌──────────┐
    │  QUOTE  │──────│ CONTRACT │
    │(presup.)│  1:1 │(contrato)│
    └─────────┘      └──────────┘

         ┌───────────────────┐
         │   NOTIFICATION    │
         │  (todos los       │
         │   recordatorios)  │
         └───────────────────┘
              referencia a todo
```

---

## 📋 Colecciones

### 1. `users`
Almacena tanto clientes como profesionales en la misma colección.
Diferenciados por el campo `role`.

| Campo | Tipo | Descripción |
|---|---|---|
| `name` | String | Nombre completo |
| `email` | String | Email único |
| `phone` | String | Teléfono |
| `password` | String | Hash bcrypt (select: false) |
| `role` | Enum | `client` \| `professional` |
| `avatar` | String | URL de imagen |
| `isVerified` | Boolean | Email verificado |
| `clientProfile.savedAddresses` | Array | Direcciones guardadas del cliente |
| `clientProfile.savedAddresses.coordinates` | Object | `{lat, lng}` para mapa |

---

### 2. `businesses`
Perfil completo del profesional o negocio.
Un profesional puede tener solo 1 negocio (plan free/pro) o múltiples (business).

| Campo | Tipo | Descripción |
|---|---|---|
| `owner` | ObjectId → User | Dueño del negocio |
| `slug` | String | URL única: `/u/mi-plomeria` |
| `businessType` | Enum | Tipo de oficio (20+ opciones) |
| `serviceMode` | Enum | `home_visit` \| `in_store` \| `both` |
| `services[]` | Array | Catálogo de servicios |
| `workingHours[]` | Array | Horarios por día de semana |
| `blockedDates[]` | Array | Fechas bloqueadas/vacaciones |
| `appointmentConfig` | Object | Configuración de citas |
| `coverageArea` | Object | Zona de cobertura (domicilio) |
| `location` | Object | Dirección del local (in-store) |
| `plan` | Enum | `free` \| `pro` \| `business` |

---

### 3. `appointments`
El núcleo del sistema. Maneja todo el ciclo de vida de una cita.

#### Estados del flujo (Oficios con visita):
```
PENDING → CONFIRMED → IN_PROGRESS → WAITING_QUOTE
→ QUOTE_SENT → QUOTE_APPROVED → CONTRACT_SENT
→ CONTRACT_SIGNED → SCHEDULED_WORK → COMPLETED
```

#### Estados del flujo (Servicios en local):
```
PENDING → CONFIRMED → IN_PROGRESS → COMPLETED
```

| Campo | Tipo | Descripción |
|---|---|---|
| `business` | ObjectId → Business | Negocio |
| `client` | ObjectId → User | Cliente |
| `type` | Enum | `diagnosis` \| `work` \| `follow_up` \| `regular` |
| `status` | Enum | 12 estados posibles |
| `scheduledAt` | Date | Fecha y hora de la cita |
| `clientAddress` | Object | Dirección + coordenadas GPS |
| `workDescription` | String | Qué necesita el cliente |
| `workPhotos[]` | Array | Fotos del problema |
| `parentAppointment` | ObjectId → Appointment | Cita original (si es seguimiento) |
| `followUps[]` | Array | Citas de seguimiento derivadas |
| `statusHistory[]` | Array | Historial completo de cambios |
| `requiresQuote` | Boolean | Si requiere cotización |
| `remindersSent[]` | Array | Control de recordatorios enviados |

---

### 4. `quotes`
Presupuesto generado por el profesional tras la visita de diagnóstico.

| Campo | Tipo | Descripción |
|---|---|---|
| `appointment` | ObjectId → Appointment | Cita de diagnóstico |
| `quoteNumber` | String | Número único: `COT-2024-0001` |
| `status` | Enum | `draft → sent → viewed → approved/rejected` |
| `materials[]` | Array | Lista detallada de materiales |
| `materials[].suppliedBy` | Enum | Quién provee: `professional/client/shared` |
| `labor[]` | Array | Desglose de mano de obra |
| `totals` | Object | Subtotal, descuento, IVA, total |
| `validUntil` | Date | Vigencia de la cotización (15 días default) |
| `clientResponse` | Object | Respuesta del cliente con comentario |

---

### 5. `contracts`
Contrato digital generado a partir de la cotización aprobada.

| Campo | Tipo | Descripción |
|---|---|---|
| `quote` | ObjectId → Quote | Cotización base |
| `contractNumber` | String | Número único: `CTR-2024-0001` |
| `status` | Enum | `draft → sent → viewed → signed/rejected` |
| `parties` | Object | Datos de ambas partes |
| `workSections[]` | Array | Desglose del trabajo por secciones |
| `conditions` | Object | Monto, garantía, términos de pago |
| `materialList[]` | Array | Lista de materiales que va al contrato |
| `professionalSignature` | Object | Firma digital del profesional |
| `clientSignature` | Object | Firma + aceptación de términos del cliente |
| `pdfUrl` | String | URL del PDF generado |

---

### 6. `notifications`
Cola de todas las notificaciones del sistema.

| Campo | Tipo | Descripción |
|---|---|---|
| `recipient` | ObjectId → User | Destinatario |
| `type` | Enum | Tipo de notificación (11 tipos) |
| `channel` | Enum | `email` \| `sms` \| `push` \| `in_app` |
| `status` | Enum | `pending → sent/failed → read` |
| `scheduledFor` | Date | Cuándo debe enviarse |
| `attempts` | Number | Intentos de envío (para reintentos) |
| TTL | Index | Auto-elimina tras 90 días de enviadas |

---

## 🔑 Índices Clave

```javascript
// Búsqueda de citas de un negocio en fecha específica
{ business: 1, scheduledAt: 1, status: 1 }

// Link único del profesional
{ slug: 1 } // unique

// Email único de usuario
{ email: 1 } // unique

// Worker de notificaciones pendientes
{ status: 1, scheduledFor: 1 }

// Historial del cliente
{ client: 1, scheduledAt: -1 }
```

---

## 🔄 Flujo Completo en BD

```
1. Usuario se registra        → INSERT User (role: professional)
2. Crea su perfil             → INSERT Business (owner: userId, slug: "mi-plomeria")
3. Cliente se registra        → INSERT User (role: client)
4. Agenda diagnóstico         → INSERT Appointment (type: diagnosis, status: pending)
5. Profesional confirma       → UPDATE Appointment (status: confirmed)
                              → INSERT Notification (type: appointment_confirmed, scheduled: NOW)
                              → INSERT Notification (type: reminder_24h, scheduled: -24h antes)
                              → INSERT Notification (type: reminder_1h, scheduled: -1h antes)
6. Profesional sube presupuesto → INSERT Quote (status: draft)
                              → UPDATE Quote (status: sent)
                              → UPDATE Appointment (status: quote_sent)
                              → INSERT Notification (type: quote_received)
7. Cliente aprueba            → UPDATE Quote (status: approved, clientResponse: {...})
                              → UPDATE Appointment (status: quote_approved)
                              → INSERT Contract (status: draft)
8. Contrato enviado           → UPDATE Contract (status: sent)
                              → UPDATE Appointment (status: contract_sent)
9. Cliente firma              → UPDATE Contract (clientSignature: {...}, status: signed)
                              → UPDATE Appointment (status: contract_signed)
10. Agenda visita de obra     → INSERT Appointment (type: work, parentAppointment: diagId)
                              → UPDATE Appointment[diag] (followUps: [workId])
                              → INSERT Notifications (reminders)
11. Trabajo completado        → UPDATE Appointment (status: completed)
                              → UPDATE Business.stats
                              → INSERT Notification (type: review_request)
```