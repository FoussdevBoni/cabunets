// src/models/Commission.ts
import mongoose, { Schema, Document } from "mongoose";

export type CommissionStatus =
  | "detectee"
  | "en_attente"
  | "disponible"
  | "reservee"
  | "payee"
  | "rejetee"
  | "annulee";

export interface ICommission extends Document {
  _id: mongoose.Types.ObjectId;

  affiliateId: mongoose.Types.ObjectId;
  referralId: mongoose.Types.ObjectId;

  sourceType: "order" | "seller_activation";
  sourceId: string;
  qualifyingOrderId?: mongoose.Types.ObjectId;
  eventId: string;

  program: string;
  amount: number;
  currency: string;
  status: CommissionStatus;

  ruleSnapshot: {
    ruleId: mongoose.Types.ObjectId;
    sourceAmount?: number;
    sourceCurrency?: string;
    conversionRate?: number;
    mode: string;
    fixedAmount?: number;
    percentage?: number;
    cap?: number;
    availabilityDelayDays: number;
  };

  availableAt?: Date;
  validatedAt?: Date;
  paidAt?: Date;

  reason?: string;

  createdAt: Date;
  updatedAt: Date;
}

const CommissionSchema = new Schema<ICommission>(
  {
    affiliateId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    referralId: {
      type: Schema.Types.ObjectId,
      ref: "Referral",
      required: true,
      index: true,
    },

    sourceType: {
      type: String,
      enum: ["order", "seller_activation"],
      required: true,
    },

    qualifyingOrderId: { type: Schema.Types.ObjectId, ref: "Order", index: true },
    sourceId: {
      type: String,
      required: true,
      index: true,
    },

    eventId: {
      type: String,
      required: true,
      index: true,
    },

    program: {
      type: String,
      required: true,
      index: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    currency: {
      type: String,
      default: "CDF",
      uppercase: true,
    },

    status: {
      type: String,
      enum: [
        "detectee",
        "en_attente",
        "disponible",
        "reservee",
        "payee",
        "rejetee",
        "annulee",
      ],
      default: "detectee",
      index: true,
    },

    ruleSnapshot: {
      sourceAmount: Number,
      sourceCurrency: String,
      conversionRate: Number,
      ruleId: {
        type: Schema.Types.ObjectId,
        ref: "RewardRule",
        required: true,
      },
      mode: { type: String, required: true },
      fixedAmount: { type: Number },
      percentage: { type: Number },
      cap: { type: Number },
      availabilityDelayDays: { type: Number, required: true },
    },

    availableAt: { type: Date, index: true },
    validatedAt: { type: Date },
    paidAt: { type: Date },

    reason: { type: String },
  },
  { timestamps: true }
);

CommissionSchema.index(
  { affiliateId: 1, eventId: 1 },
  { unique: true }
);

CommissionSchema.index({ affiliateId: 1, status: 1, createdAt: -1 });

export const Commission = mongoose.model<ICommission>(
  "Commission",
  CommissionSchema
);