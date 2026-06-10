// ============================================
// ENUMS
// ============================================

export enum UserRole {
  CLIENT = "client",
  PROFESSIONAL = "professional",
}

export enum BusinessType {
  // Oficios con visita domiciliaria
  PLUMBING = "plumbing",
  ELECTRICAL = "electrical",
  CONSTRUCTION = "construction",
  PAINTING = "painting",
  CARPENTRY = "carpentry",
  HVAC = "hvac",
  CLEANING = "cleaning",
  LOCKSMITH = "locksmith",
  APPLIANCE_REPAIR = "appliance_repair",
  GARDENING = "gardening",

  // Servicios en local
  BARBERSHOP = "barbershop",
  HAIR_SALON = "hair_salon",
  SPA = "spa",
  NAIL_SALON = "nail_salon",
  TATTOO = "tattoo",
  DENTIST = "dentist",
  CLINIC = "clinic",
  VET = "vet",
  GYM = "gym",
  TUTOR = "tutor",

  OTHER = "other",
}

export enum ServiceMode {
  HOME_VISIT = "home_visit",   // Va al domicilio del cliente
  IN_STORE = "in_store",       // Cliente va al local
  BOTH = "both",               // Puede ser ambos
}

export enum AppointmentStatus {
  PENDING = "pending",             // Esperando confirmación del profesional
  CONFIRMED = "confirmed",         // Confirmada
  IN_PROGRESS = "in_progress",     // En curso
  WAITING_QUOTE = "waiting_quote", // Esperando presupuesto (tras visita diagnóstico)
  QUOTE_SENT = "quote_sent",       // Presupuesto enviado al cliente
  QUOTE_APPROVED = "quote_approved", // Cliente aprobó presupuesto
  QUOTE_REJECTED = "quote_rejected", // Cliente rechazó
  CONTRACT_SENT = "contract_sent", // Contrato enviado
  CONTRACT_SIGNED = "contract_signed", // Contrato firmado
  SCHEDULED_WORK = "scheduled_work",   // Visita de obra agendada
  COMPLETED = "completed",         // Trabajo terminado
  CANCELLED = "cancelled",         // Cancelada
  NO_SHOW = "no_show",             // Cliente/profesional no se presentó
}

export enum AppointmentType {
  DIAGNOSIS = "diagnosis",         // Visita de diagnóstico / presupuesto
  WORK = "work",                   // Ejecución del trabajo
  FOLLOW_UP = "follow_up",         // Visita de seguimiento
  REGULAR = "regular",             // Cita estándar (barbería, etc.)
  CONSULTATION = "consultation",   // Consulta general
}

export enum QuoteStatus {
  DRAFT = "draft",
  SENT = "sent",
  VIEWED = "viewed",
  APPROVED = "approved",
  REJECTED = "rejected",
  EXPIRED = "expired",
}

export enum ContractStatus {
  DRAFT = "draft",
  SENT = "sent",
  VIEWED = "viewed",
  SIGNED = "signed",
  REJECTED = "rejected",
  EXPIRED = "expired",
}

export enum NotificationType {
  APPOINTMENT_CONFIRMED = "appointment_confirmed",
  APPOINTMENT_REMINDER_24H = "appointment_reminder_24h",
  APPOINTMENT_REMINDER_1H = "appointment_reminder_1h",
  APPOINTMENT_CANCELLED = "appointment_cancelled",
  QUOTE_RECEIVED = "quote_received",
  QUOTE_APPROVED = "quote_approved",
  QUOTE_REJECTED = "quote_rejected",
  CONTRACT_RECEIVED = "contract_received",
  CONTRACT_SIGNED = "contract_signed",
  FOLLOW_UP_SCHEDULED = "follow_up_scheduled",
  REVIEW_REQUEST = "review_request",
}

export enum NotificationChannel {
  EMAIL = "email",
  SMS = "sms",
  PUSH = "push",
  IN_APP = "in_app",
}

export enum NotificationStatus {
  PENDING = "pending",
  SENT = "sent",
  FAILED = "failed",
  READ = "read",
}

export enum DayOfWeek {
  SUNDAY = 0,
  MONDAY = 1,
  TUESDAY = 2,
  WEDNESDAY = 3,
  THURSDAY = 4,
  FRIDAY = 5,
  SATURDAY = 6,
}