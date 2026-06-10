import mongoose, { Document, Schema } from "mongoose";
import { ContractStatus } from "../types";

export interface IContract extends Document {
  _id: mongoose.Types.ObjectId;

  // Referencias
  quote: mongoose.Types.ObjectId;        // ref: Quote
  appointment: mongoose.Types.ObjectId;  // ref: Appointment (diagnóstico)
  business: mongoose.Types.ObjectId;     // ref: Business
  client: mongoose.Types.ObjectId;       // ref: User

  // Número de contrato
  contractNumber: string;               // CTR-2024-0001

  // Estado
  status: ContractStatus;

  // Partes del contrato
  parties: {
    professional: {
      name: string;
      email: string;
      phone: string;
      taxId?: string;         // RFC / RUT del profesional
      legalName?: string;
    };
    client: {
      name: string;
      email: string;
      phone: string;
      address?: string;
    };
  };

  // Contenido del contrato
  title: string;
  workDescription: string;   // Descripción completa del trabajo a realizar

  // Desglose de trabajo (secciones)
  workSections: {
    title: string;           // "Instalación de tuberías"
    description: string;     // Detalle de lo que incluye
    estimatedCost?: number;
  }[];

  // Condiciones del contrato
  conditions: {
    startDate?: Date;        // Fecha estimada de inicio
    endDate?: Date;          // Fecha estimada de término
    totalAmount: number;     // Monto total del contrato
    depositAmount?: number;  // Anticipo requerido
    paymentTerms: string;    // "50% anticipo, 50% al terminar"
    warrantyDays?: number;   // Días de garantía del trabajo
    warrantyDescription?: string;
    includes: string[];      // Qué incluye el servicio ["mano de obra", "materiales X"]
    excludes: string[];      // Qué NO incluye ["materiales adicionales no cotizados"]
    terms: string;           // Términos y condiciones generales
  };

  // Material list incluida en el contrato
  materialList?: {
    name: string;
    quantity: number;
    unit: string;
    suppliedBy: "professional" | "client";
  }[];

  // Firma digital del profesional
  professionalSignature?: {
    signedAt: Date;
    ipAddress?: string;
    signatureData: string;   // Base64 de la firma dibujada o hash
    signatureType: "drawn" | "typed" | "digital_id";
    fullName: string;
  };

  // Firma digital del cliente
  clientSignature?: {
    signedAt: Date;
    ipAddress?: string;
    signatureData: string;
    signatureType: "drawn" | "typed" | "digital_id";
    fullName: string;
    acceptedTerms: boolean;  // Checkbox de aceptación explícita
  };

  // Fechas clave
  sentAt?: Date;
  viewedAt?: Date;
  signedByClientAt?: Date;
  signedByProfessionalAt?: Date;
  rejectedAt?: Date;

  // Rechazo
  rejection?: {
    rejectedBy: mongoose.Types.ObjectId;
    reason: string;
    rejectedAt: Date;
  };

  // URL del PDF generado
  pdfUrl?: string;

  // Notas adicionales
  notes?: string;

  // Versión del contrato (si se re-genera)
  version: number;

  createdAt: Date;
  updatedAt: Date;
}

const ContractSchema = new Schema<IContract>(
  {
    quote: {
      type: Schema.Types.ObjectId,
      ref: "Quote",
      required: true,
    },
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

    contractNumber: {
      type: String,
      unique: true,
      required: true,
    },

    status: {
      type: String,
      enum: Object.values(ContractStatus),
      default: ContractStatus.DRAFT,
    },

    parties: {
      professional: {
        name: { type: String, required: true },
        email: { type: String, required: true },
        phone: { type: String, required: true },
        taxId: String,
        legalName: String,
      },
      client: {
        name: { type: String, required: true },
        email: { type: String, required: true },
        phone: { type: String, required: true },
        address: String,
      },
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },
    workDescription: {
      type: String,
      required: true,
      maxlength: 3000,
    },

    workSections: [
      {
        title: { type: String, required: true },
        description: { type: String, required: true },
        estimatedCost: Number,
      },
    ],

    conditions: {
      startDate: Date,
      endDate: Date,
      totalAmount: { type: Number, required: true, min: 0 },
      depositAmount: Number,
      paymentTerms: { type: String, required: true },
      warrantyDays: { type: Number, default: 30 },
      warrantyDescription: String,
      includes: [String],
      excludes: [String],
      terms: {
        type: String,
        default:
          "El presente contrato obliga a ambas partes a cumplir con lo estipulado. Cualquier trabajo adicional no contemplado deberá ser acordado por escrito.",
      },
    },

    materialList: [
      {
        name: String,
        quantity: Number,
        unit: String,
        suppliedBy: {
          type: String,
          enum: ["professional", "client"],
          default: "professional",
        },
      },
    ],

    professionalSignature: {
      signedAt: Date,
      ipAddress: String,
      signatureData: String,
      signatureType: {
        type: String,
        enum: ["drawn", "typed", "digital_id"],
        default: "drawn",
      },
      fullName: String,
    },

    clientSignature: {
      signedAt: Date,
      ipAddress: String,
      signatureData: String,
      signatureType: {
        type: String,
        enum: ["drawn", "typed", "digital_id"],
        default: "drawn",
      },
      fullName: String,
      acceptedTerms: { type: Boolean, default: false },
    },

    sentAt: Date,
    viewedAt: Date,
    signedByClientAt: Date,
    signedByProfessionalAt: Date,
    rejectedAt: Date,

    rejection: {
      rejectedBy: { type: Schema.Types.ObjectId, ref: "User" },
      reason: String,
      rejectedAt: Date,
    },

    pdfUrl: String,
    notes: { type: String, maxlength: 1000 },
    version: { type: Number, default: 1 },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─── Virtuals ──────────────────────────────────────────────

ContractSchema.virtual("isFullySigned").get(function () {
  return (
    this.professionalSignature?.signedAt != null &&
    this.clientSignature?.signedAt != null
  );
});

ContractSchema.virtual("signedByClient").get(function () {
  return this.clientSignature?.signedAt != null;
});

// ─── Hooks ────────────────────────────────────────────────

ContractSchema.pre("save", async function (next) {
  if (this.isNew) {
    const count = await mongoose.model("Contract").countDocuments();
    const year = new Date().getFullYear();
    this.contractNumber = `CTR-${year}-${String(count + 1).padStart(4, "0")}`;
  }
  next();
});

// ─── Índices ───────────────────────────────────────────────

ContractSchema.index({ quote: 1 });
ContractSchema.index({ appointment: 1 });
ContractSchema.index({ business: 1, status: 1 });
ContractSchema.index({ client: 1 });
ContractSchema.index({ contractNumber: 1 }, { unique: true });

export const Contract = mongoose.model<IContract>("Contract", ContractSchema);