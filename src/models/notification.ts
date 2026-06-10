import mongoose, { Document, Schema } from "mongoose";
import {
  NotificationType,
  NotificationChannel,
  NotificationStatus,
} from "../types";

export interface INotification extends Document {
  _id: mongoose.Types.ObjectId;

  // Destinatario
  recipient: mongoose.Types.ObjectId;   // ref: User
  recipientEmail?: string;
  recipientPhone?: string;

  // Tipo y canal
  type: NotificationType;
  channel: NotificationChannel;
  status: NotificationStatus;

  // Contenido
  title: string;
  body: string;
  data?: Record<string, unknown>;  // Datos adicionales (appointmentId, etc.)

  // Referencias contextuales
  relatedAppointment?: mongoose.Types.ObjectId;
  relatedBusiness?: mongoose.Types.ObjectId;
  relatedQuote?: mongoose.Types.ObjectId;
  relatedContract?: mongoose.Types.ObjectId;

  // Programación
  scheduledFor: Date;        // Cuándo debe enviarse
  sentAt?: Date;             // Cuándo se envió
  readAt?: Date;             // Cuándo fue leída (in-app)

  // Control de errores
  attempts: number;
  lastAttemptAt?: Date;
  failureReason?: string;

  // Link de acción
  actionUrl?: string;        // Link al que apunta la notificación

  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    recipient: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    recipientEmail: String,
    recipientPhone: String,

    type: {
      type: String,
      enum: Object.values(NotificationType),
      required: true,
    },
    channel: {
      type: String,
      enum: Object.values(NotificationChannel),
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(NotificationStatus),
      default: NotificationStatus.PENDING,
    },

    title: {
      type: String,
      required: true,
      maxlength: 200,
    },
    body: {
      type: String,
      required: true,
      maxlength: 1000,
    },
    data: {
      type: Schema.Types.Mixed,
      default: {},
    },

    relatedAppointment: {
      type: Schema.Types.ObjectId,
      ref: "Appointment",
    },
    relatedBusiness: {
      type: Schema.Types.ObjectId,
      ref: "Business",
    },
    relatedQuote: {
      type: Schema.Types.ObjectId,
      ref: "Quote",
    },
    relatedContract: {
      type: Schema.Types.ObjectId,
      ref: "Contract",
    },

    scheduledFor: {
      type: Date,
      required: true,
      default: Date.now,
    },
    sentAt: Date,
    readAt: Date,

    attempts: {
      type: Number,
      default: 0,
    },
    lastAttemptAt: Date,
    failureReason: String,

    actionUrl: String,
  },
  {
    timestamps: true,
  }
);

// ─── Índices ───────────────────────────────────────────────

// Para el worker que procesa notificaciones pendientes
NotificationSchema.index({ status: 1, scheduledFor: 1 });
NotificationSchema.index({ recipient: 1, status: 1 });
NotificationSchema.index({ recipient: 1, readAt: 1 });
NotificationSchema.index({ relatedAppointment: 1 });

// TTL: Eliminar notificaciones enviadas/leídas después de 90 días
NotificationSchema.index(
  { sentAt: 1 },
  { expireAfterSeconds: 90 * 24 * 60 * 60, sparse: true }
);

export const Notification = mongoose.model<INotification>(
  "Notification",
  NotificationSchema
);