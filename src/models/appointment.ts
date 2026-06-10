import mongoose, { Document, Schema } from "mongoose";
import {
  AppointmentStatus,
  AppointmentType,
} from "../types";

export interface IAppointment extends Document {
  _id: mongoose.Types.ObjectId;

  // Referencias principales
  business: mongoose.Types.ObjectId;   // ref: Business
  client: mongoose.Types.ObjectId;     // ref: User
  service: mongoose.Types.ObjectId;    // ref: subdoc en Business.services

  // Snapshot del servicio al momento de agendar (por si cambia después)
  serviceSnapshot: {
    name: string;
    duration: number;
    priceType: "fixed" | "quote" | "range";
    price?: number;
  };

  // Tipo y estado
  type: AppointmentType;
  status: AppointmentStatus;

  // Fechas
  scheduledAt: Date;         // Fecha y hora de la cita
  endAt: Date;               // Fecha y hora de fin estimada
  confirmedAt?: Date;
  completedAt?: Date;
  cancelledAt?: Date;

  // Ubicación (para visitas domiciliarias)
  clientAddress?: {
    street: string;
    city: string;
    state: string;
    zipCode?: string;
    country: string;
    references?: string;     // "Casa azul, portón negro"
    coordinates?: {
      lat: number;
      lng: number;
    };
  };

  // Descripción del trabajo que solicita el cliente
  workDescription: string;
  workCategory?: string;     // "Instalación nueva", "Reparación", "Mantenimiento"
  workPhotos?: string[];     // Fotos del problema (antes)

  // Notas
  clientNotes?: string;      // Notas adicionales del cliente
  professionalNotes?: string; // Notas internas del profesional

  // Relación con citas anteriores (seguimientos)
  parentAppointment?: mongoose.Types.ObjectId;  // ref: Appointment (la original)
  followUps: mongoose.Types.ObjectId[];          // citas de seguimiento derivadas

  // Historial de cambios de estado
  statusHistory: {
    status: AppointmentStatus;
    changedAt: Date;
    changedBy: mongoose.Types.ObjectId;  // ref: User
    reason?: string;
    note?: string;
  }[];

  // Cancelación
  cancellation?: {
    cancelledBy: mongoose.Types.ObjectId;
    reason: string;
    cancelledAt: Date;
  };

  // Calificación (solo cuando status = COMPLETED)
  review?: {
    rating: number;          // 1-5
    comment?: string;
    createdAt: Date;
    isPublic: boolean;
  };

  // Flags útiles
  isFollowUp: boolean;       // true si es visita de seguimiento
  requiresQuote: boolean;    // true si el servicio requiere cotización
  remindersSent: {
    type: "24h" | "1h";
    sentAt: Date;
    channel: "email" | "sms";
  }[];

  createdAt: Date;
  updatedAt: Date;
}

const AppointmentSchema = new Schema<IAppointment>(
  {
    business: {
      type: Schema.Types.ObjectId,
      ref: "Business",
      required: true,
    },
    client: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    service: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    serviceSnapshot: {
      name: { type: String, required: true },
      duration: { type: Number, required: true },
      priceType: {
        type: String,
        enum: ["fixed", "quote", "range"],
        required: true,
      },
      price: Number,
    },

    type: {
      type: String,
      enum: Object.values(AppointmentType),
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(AppointmentStatus),
      default: AppointmentStatus.PENDING,
    },

    scheduledAt: {
      type: Date,
      required: [true, "La fecha de la cita es requerida"],
    },
    endAt: {
      type: Date,
      required: true,
    },
    confirmedAt: Date,
    completedAt: Date,
    cancelledAt: Date,

    clientAddress: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: { type: String, default: "México" },
      references: String,
      coordinates: { lat: Number, lng: Number },
    },

    workDescription: {
      type: String,
      required: [true, "Describe brevemente el trabajo requerido"],
      maxlength: [1000, "La descripción no puede superar 1000 caracteres"],
    },
    workCategory: String,
    workPhotos: [{ type: String }],

    clientNotes: { type: String, maxlength: 500 },
    professionalNotes: { type: String, maxlength: 1000 },

    parentAppointment: {
      type: Schema.Types.ObjectId,
      ref: "Appointment",
      default: null,
    },
    followUps: [
      {
        type: Schema.Types.ObjectId,
        ref: "Appointment",
      },
    ],

    statusHistory: [
      {
        status: {
          type: String,
          enum: Object.values(AppointmentStatus),
          required: true,
        },
        changedAt: { type: Date, default: Date.now },
        changedBy: {
          type: Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        reason: String,
        note: String,
      },
    ],

    cancellation: {
      cancelledBy: { type: Schema.Types.ObjectId, ref: "User" },
      reason: String,
      cancelledAt: Date,
    },

    review: {
      rating: { type: Number, min: 1, max: 5 },
      comment: { type: String, maxlength: 500 },
      createdAt: { type: Date, default: Date.now },
      isPublic: { type: Boolean, default: true },
    },

    isFollowUp: { type: Boolean, default: false },
    requiresQuote: { type: Boolean, default: false },

    remindersSent: [
      {
        type: { type: String, enum: ["24h", "1h"] },
        sentAt: Date,
        channel: { type: String, enum: ["email", "sms"] },
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─── Virtuals ──────────────────────────────────────────────

AppointmentSchema.virtual("duration").get(function () {
  if (this.scheduledAt && this.endAt) {
    return (this.endAt.getTime() - this.scheduledAt.getTime()) / 60000; // minutos
  }
  return null;
});

AppointmentSchema.virtual("isPast").get(function () {
  return this.scheduledAt < new Date();
});

AppointmentSchema.virtual("hasFollowUps").get(function () {
  return this.followUps && this.followUps.length > 0;
});

// ─── Índices ───────────────────────────────────────────────

AppointmentSchema.index({ business: 1, scheduledAt: 1 });
AppointmentSchema.index({ client: 1, scheduledAt: -1 });
AppointmentSchema.index({ status: 1 });
AppointmentSchema.index({ scheduledAt: 1 });
AppointmentSchema.index({ parentAppointment: 1 });
// Índice compuesto para buscar citas de un negocio en un rango de fechas
AppointmentSchema.index({ business: 1, scheduledAt: 1, status: 1 });

// ─── Hooks ────────────────────────────────────────────────

// Registrar cambio de estado automáticamente en el historial
AppointmentSchema.pre("save", function (next) {
  if (this.isModified("status")) {
    // El changedBy se debe pasar en el contexto de la operación
    // Se maneja en el controller
  }
  next();
});

export const Appointment = mongoose.model<IAppointment>(
  "Appointment",
  AppointmentSchema
);