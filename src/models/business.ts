import mongoose, { Document, Schema } from "mongoose";
import { BusinessType, ServiceMode, DayOfWeek } from "../types";

// ─── Sub-interfaces ────────────────────────────────────────

export interface IWorkingHours {
  day: DayOfWeek;
  isOpen: boolean;
  slots: {
    start: string;  // "09:00"
    end: string;    // "18:00"
  }[];
}

export interface IService {
  _id: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  duration: number;           // en minutos
  price?: number;             // null = precio por cotización
  priceType: "fixed" | "quote" | "range";
  priceMin?: number;          // para range
  priceMax?: number;          // para range
  requiresDiagnosis: boolean; // si requiere visita de diagnóstico primero
  isActive: boolean;
  category?: string;          // "Instalación", "Reparación", "Mantenimiento"
}

export interface IBusiness extends Document {
  _id: mongoose.Types.ObjectId;
  owner: mongoose.Types.ObjectId;    // ref: User (professional)

  // Identidad
  name: string;
  slug: string;               // URL única: /u/mi-plomeria
  description?: string;
  businessType: BusinessType;
  serviceMode: ServiceMode;
  logo?: string;
  coverImage?: string;
  tags: string[];             // ["urgencias 24h", "garantía 6 meses"]

  // Contacto y ubicación del local (para mode IN_STORE)
  location?: {
    street: string;
    city: string;
    state: string;
    zipCode?: string;
    country: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
    references?: string;      // "Frente al Oxxo, edificio azul"
  };

  // Zona de cobertura (para mode HOME_VISIT)
  coverageArea?: {
    cities: string[];
    radiusKm?: number;
    coordinates?: {           // Centro del área de cobertura
      lat: number;
      lng: number;
    };
  };

  // Servicios ofrecidos
  services: IService[];

  // Horarios de trabajo
  workingHours: IWorkingHours[];

  // Días bloqueados (vacaciones, festivos personales)
  blockedDates: {
    date: Date;
    reason?: string;
  }[];

  // Configuración de citas
  appointmentConfig: {
    bufferMinutes: number;    // Tiempo entre citas (por defecto 15 min)
    maxDaysAhead: number;     // Máximo días en el futuro para agendar (30)
    minHoursNotice: number;   // Mínimo de horas de anticipación (24)
    autoConfirm: boolean;     // Confirmar automáticamente o manualmente
    requireDeposit: boolean;  // Requiere depósito para confirmar
    depositPercent?: number;  // % del presupuesto
  };

  // Información comercial
  businessInfo?: {
    taxId?: string;           // RFC / RUT
    legalName?: string;
    website?: string;
    socialMedia?: {
      instagram?: string;
      facebook?: string;
      whatsapp?: string;
    };
  };

  // Estadísticas (se actualizan periódicamente)
  stats: {
    totalAppointments: number;
    completedAppointments: number;
    cancelledAppointments: number;
    averageRating: number;
    totalReviews: number;
  };

  // Plan de suscripción
  plan: "free" | "pro" | "business";
  planExpiresAt?: Date;

  isActive: boolean;
  isVerified: boolean;        // Negocio verificado por la plataforma
  createdAt: Date;
  updatedAt: Date;
}

// ─── Sub-schemas ───────────────────────────────────────────

const ServiceSchema = new Schema<IService>(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, maxlength: 500 },
    duration: { type: Number, required: true, min: 15 }, // mínimo 15 min
    price: { type: Number, min: 0, default: null },
    priceType: {
      type: String,
      enum: ["fixed", "quote", "range"],
      default: "quote",
    },
    priceMin: { type: Number, min: 0 },
    priceMax: { type: Number, min: 0 },
    requiresDiagnosis: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    category: { type: String, trim: true },
  },
  { _id: true }
);

const WorkingHoursSchema = new Schema<IWorkingHours>(
  {
    day: { type: Number, enum: Object.values(DayOfWeek), required: true },
    isOpen: { type: Boolean, default: true },
    slots: [
      {
        start: { type: String, required: true }, // "09:00"
        end: { type: String, required: true },   // "18:00"
      },
    ],
  },
  { _id: false }
);

// ─── Business Schema ───────────────────────────────────────

const BusinessSchema = new Schema<IBusiness>(
  {
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: [true, "El nombre del negocio es requerido"],
      trim: true,
      maxlength: [100, "El nombre no puede superar 100 caracteres"],
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[a-z0-9-]+$/, "El slug solo puede contener letras, números y guiones"],
    },
    description: { type: String, maxlength: 1000 },
    businessType: {
      type: String,
      enum: Object.values(BusinessType),
      required: true,
    },
    serviceMode: {
      type: String,
      enum: Object.values(ServiceMode),
      required: true,
    },
    logo: { type: String, default: null },
    coverImage: { type: String, default: null },
    tags: [{ type: String, trim: true }],

    location: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: { type: String, default: "México" },
      coordinates: { lat: Number, lng: Number },
      references: String,
    },

    coverageArea: {
      cities: [String],
      radiusKm: Number,
      coordinates: { lat: Number, lng: Number },
    },

    services: [ServiceSchema],

    workingHours: {
      type: [WorkingHoursSchema],
      default: () => [
        { day: 1, isOpen: true, slots: [{ start: "09:00", end: "18:00" }] },
        { day: 2, isOpen: true, slots: [{ start: "09:00", end: "18:00" }] },
        { day: 3, isOpen: true, slots: [{ start: "09:00", end: "18:00" }] },
        { day: 4, isOpen: true, slots: [{ start: "09:00", end: "18:00" }] },
        { day: 5, isOpen: true, slots: [{ start: "09:00", end: "18:00" }] },
        { day: 6, isOpen: false, slots: [] },
        { day: 0, isOpen: false, slots: [] },
      ],
    },

    blockedDates: [
      {
        date: { type: Date, required: true },
        reason: String,
      },
    ],

    appointmentConfig: {
      bufferMinutes: { type: Number, default: 15 },
      maxDaysAhead: { type: Number, default: 30 },
      minHoursNotice: { type: Number, default: 24 },
      autoConfirm: { type: Boolean, default: false },
      requireDeposit: { type: Boolean, default: false },
      depositPercent: { type: Number, min: 0, max: 100 },
    },

    businessInfo: {
      taxId: String,
      legalName: String,
      website: String,
      socialMedia: {
        instagram: String,
        facebook: String,
        whatsapp: String,
      },
    },

    stats: {
      totalAppointments: { type: Number, default: 0 },
      completedAppointments: { type: Number, default: 0 },
      cancelledAppointments: { type: Number, default: 0 },
      averageRating: { type: Number, default: 0, min: 0, max: 5 },
      totalReviews: { type: Number, default: 0 },
    },

    plan: {
      type: String,
      enum: ["free", "pro", "business"],
      default: "free",
    },
    planExpiresAt: { type: Date, default: null },
    isActive: { type: Boolean, default: true },
    isVerified: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─── Virtuals ──────────────────────────────────────────────

BusinessSchema.virtual("profileUrl").get(function () {
  return `/u/${this.slug}`;
});

BusinessSchema.virtual("activeServices").get(function () {
  return this.services.filter((s) => s.isActive);
});

// ─── Índices ───────────────────────────────────────────────

BusinessSchema.index({ slug: 1 }, { unique: true });
BusinessSchema.index({ owner: 1 });
BusinessSchema.index({ businessType: 1 });
BusinessSchema.index({ serviceMode: 1 });
BusinessSchema.index({ "location.city": 1 });
BusinessSchema.index({ "stats.averageRating": -1 });
BusinessSchema.index({ isActive: 1 });

// ─── Hooks ────────────────────────────────────────────────

// Auto-generar slug si no se provee
BusinessSchema.pre("save", function (next) {
  if (!this.slug && this.name) {
    this.slug = this.name
      .toLowerCase()
      .trim()
      .replace(/[áàä]/g, "a")
      .replace(/[éèë]/g, "e")
      .replace(/[íìï]/g, "i")
      .replace(/[óòö]/g, "o")
      .replace(/[úùü]/g, "u")
      .replace(/ñ/g, "n")
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  }
  next();
});

export const Business = mongoose.model<IBusiness>("Business", BusinessSchema);