import mongoose, { Document, Schema } from "mongoose";
import { QuoteStatus } from "../types";

export interface IMaterialItem {
  name: string;
  description?: string;
  quantity: number;
  unit: string;           // "pieza", "metro", "litro", "kg"
  unitPrice: number;
  total: number;          // quantity * unitPrice
  suppliedBy: "professional" | "client" | "shared";
}

export interface ILaborItem {
  description: string;
  hours?: number;
  unitPrice: number;
  total: number;
}

export interface IQuote extends Document {
  _id: mongoose.Types.ObjectId;

  // Referencias
  appointment: mongoose.Types.ObjectId;  // ref: Appointment (la de diagnóstico)
  business: mongoose.Types.ObjectId;     // ref: Business
  client: mongoose.Types.ObjectId;       // ref: User

  // Número de cotización (ej: COT-2024-0001)
  quoteNumber: string;

  // Estado
  status: QuoteStatus;

  // Descripción del trabajo
  workTitle: string;
  workDescription: string;
  workPhotos?: string[];         // Fotos tomadas durante el diagnóstico

  // Materiales
  materials: IMaterialItem[];

  // Mano de obra
  labor: ILaborItem[];

  // Costos adicionales
  additionalCosts: {
    description: string;
    amount: number;
  }[];

  // Totales calculados
  totals: {
    materials: number;
    labor: number;
    additionalCosts: number;
    subtotal: number;
    discountPercent?: number;
    discountAmount?: number;
    taxPercent?: number;       // IVA u otro impuesto
    taxAmount?: number;
    total: number;
  };

  // Depósito requerido
  depositRequired?: number;    // monto fijo
  depositPercent?: number;     // % del total

  // Tiempo estimado de trabajo
  estimatedDays?: number;
  estimatedHours?: number;

  // Condiciones y notas
  validUntil: Date;            // Fecha de vencimiento de la cotización
  terms?: string;              // Condiciones generales del presupuesto
  professionalNotes?: string;  // Notas internas

  // Respuesta del cliente
  clientResponse?: {
    respondedAt: Date;
    approved: boolean;
    comment?: string;
  };

  // Fechas clave
  sentAt?: Date;
  viewedAt?: Date;
  approvedAt?: Date;
  rejectedAt?: Date;

  // El appointment de obra que se genera tras aprobar
  workAppointment?: mongoose.Types.ObjectId;  // ref: Appointment

  createdAt: Date;
  updatedAt: Date;
}

const MaterialItemSchema = new Schema<IMaterialItem>(
  {
    name: { type: String, required: true, trim: true },
    description: String,
    quantity: { type: Number, required: true, min: 0 },
    unit: { type: String, required: true, default: "pieza" },
    unitPrice: { type: Number, required: true, min: 0 },
    total: { type: Number, required: true, min: 0 },
    suppliedBy: {
      type: String,
      enum: ["professional", "client", "shared"],
      default: "professional",
    },
  },
  { _id: true }
);

const LaborItemSchema = new Schema<ILaborItem>(
  {
    description: { type: String, required: true },
    hours: Number,
    unitPrice: { type: Number, required: true, min: 0 },
    total: { type: Number, required: true, min: 0 },
  },
  { _id: true }
);

const QuoteSchema = new Schema<IQuote>(
  {
    appointment: {
      type: Schema.Types.ObjectId,
      ref: "Appointment",
      required: true,
    },
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

    quoteNumber: {
      type: String,
      unique: true,
      required: true,
    },

    status: {
      type: String,
      enum: Object.values(QuoteStatus),
      default: QuoteStatus.DRAFT,
    },

    workTitle: {
      type: String,
      required: true,
      trim: true,
    },
    workDescription: {
      type: String,
      required: true,
      maxlength: 2000,
    },
    workPhotos: [String],

    materials: [MaterialItemSchema],
    labor: [LaborItemSchema],
    additionalCosts: [
      {
        description: String,
        amount: Number,
      },
    ],

    totals: {
      materials: { type: Number, default: 0 },
      labor: { type: Number, default: 0 },
      additionalCosts: { type: Number, default: 0 },
      subtotal: { type: Number, default: 0 },
      discountPercent: Number,
      discountAmount: { type: Number, default: 0 },
      taxPercent: Number,
      taxAmount: { type: Number, default: 0 },
      total: { type: Number, required: true, default: 0 },
    },

    depositRequired: Number,
    depositPercent: { type: Number, min: 0, max: 100 },

    estimatedDays: Number,
    estimatedHours: Number,

    validUntil: {
      type: Date,
      required: true,
      default: () => new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 días
    },

    terms: { type: String, maxlength: 2000 },
    professionalNotes: { type: String, maxlength: 1000 },

    clientResponse: {
      respondedAt: Date,
      approved: Boolean,
      comment: { type: String, maxlength: 500 },
    },

    sentAt: Date,
    viewedAt: Date,
    approvedAt: Date,
    rejectedAt: Date,

    workAppointment: {
      type: Schema.Types.ObjectId,
      ref: "Appointment",
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─── Virtuals ──────────────────────────────────────────────

QuoteSchema.virtual("isExpired").get(function () {
  return this.validUntil < new Date() && this.status === QuoteStatus.SENT;
});

QuoteSchema.virtual("materialsBySupplier").get(function () {
  return {
    professional: this.materials.filter((m) => m.suppliedBy === "professional"),
    client: this.materials.filter((m) => m.suppliedBy === "client"),
    shared: this.materials.filter((m) => m.suppliedBy === "shared"),
  };
});

// ─── Hooks ────────────────────────────────────────────────

// Auto-calcular totales antes de guardar
QuoteSchema.pre("save", function (next) {
  const materialsTotal = this.materials.reduce((sum, m) => sum + m.total, 0);
  const laborTotal = this.labor.reduce((sum, l) => sum + l.total, 0);
  const additionalTotal = this.additionalCosts.reduce(
    (sum, a) => sum + a.amount,
    0
  );

  const subtotal = materialsTotal + laborTotal + additionalTotal;
  const discountAmount = this.totals.discountPercent
    ? (subtotal * this.totals.discountPercent) / 100
    : this.totals.discountAmount || 0;

  const afterDiscount = subtotal - discountAmount;
  const taxAmount = this.totals.taxPercent
    ? (afterDiscount * this.totals.taxPercent) / 100
    : 0;

  this.totals.materials = materialsTotal;
  this.totals.labor = laborTotal;
  this.totals.additionalCosts = additionalTotal;
  this.totals.subtotal = subtotal;
  this.totals.discountAmount = discountAmount;
  this.totals.taxAmount = taxAmount;
  this.totals.total = afterDiscount + taxAmount;

  next();
});

// Auto-generar número de cotización
QuoteSchema.pre("save", async function (next) {
  if (this.isNew) {
    const count = await mongoose.model("Quote").countDocuments();
    const year = new Date().getFullYear();
    this.quoteNumber = `COT-${year}-${String(count + 1).padStart(4, "0")}`;
  }
  next();
});

// ─── Índices ───────────────────────────────────────────────

QuoteSchema.index({ appointment: 1 });
QuoteSchema.index({ business: 1, status: 1 });
QuoteSchema.index({ client: 1 });
QuoteSchema.index({ quoteNumber: 1 }, { unique: true });

export const Quote = mongoose.model<IQuote>("Quote", QuoteSchema);