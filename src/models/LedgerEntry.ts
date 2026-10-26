// src/models/LedgerEntry.ts
import mongoose, { Schema, Document } from "mongoose";

export type LedgerType =
  | "commission_credit"
  | "withdrawal_reserve"
  | "withdrawal_release"
  | "regularisation" | "adjustment";

export interface ILedgerEntry extends Document {
  _id: mongoose.Types.ObjectId;

  affiliateId: mongoose.Types.ObjectId;

  commissionId?: mongoose.Types.ObjectId;
  rewardWithdrawalId?: mongoose.Types.ObjectId; // 🆕 renommé

  type: LedgerType;
  signedAmount: number;
  currency: string;

  description: string;

  createdAt: Date;
}

const LedgerEntrySchema = new Schema<ILedgerEntry>(
  {
    affiliateId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    commissionId: {
      type: Schema.Types.ObjectId,
      ref: "Commission",
      index: true,
    },

    rewardWithdrawalId: {                       // 🆕 renommé
      type: Schema.Types.ObjectId,
      ref: "RewardWithdrawal",
      index: true,
    },

    type: {
      type: String,
      enum: [
        "commission_credit",
        "withdrawal_reserve",
        "withdrawal_release",
        "regularisation", "adjustment",
      ],
      required: true,
      index: true,
    },

    signedAmount: {
      type: Number,
      required: true,
    },

    currency: {
      type: String,
      default: "CDF",
      uppercase: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

LedgerEntrySchema.pre("save", function (next) {
  if (!this.isNew) return next(new Error("LedgerEntry est immuable : modification interdite"));
  next();
});
LedgerEntrySchema.pre("findOneAndDelete", function (next) {
  next(new Error("LedgerEntry est immuable : suppression interdite"));
});
LedgerEntrySchema.pre("replaceOne", function (next) {
  next(new Error("LedgerEntry est immuable : remplacement interdit"));
});

LedgerEntrySchema.pre("findOneAndUpdate", function (next) {
  next(new Error("LedgerEntry est immuable : modification interdite"));
});
LedgerEntrySchema.pre("updateOne", function (next) {
  next(new Error("LedgerEntry est immuable : modification interdite"));
});
LedgerEntrySchema.pre("updateMany", function (next) {
  next(new Error("LedgerEntry est immuable : modification interdite"));
});
LedgerEntrySchema.pre("deleteOne", function (next) {
  next(new Error("LedgerEntry est immuable : suppression interdite"));
});
LedgerEntrySchema.pre("deleteMany", function (next) {
  next(new Error("LedgerEntry est immuable : suppression interdite"));
});

LedgerEntrySchema.index({ affiliateId: 1, createdAt: -1 });

export const LedgerEntry = mongoose.model<ILedgerEntry>(
  "LedgerEntry",
  LedgerEntrySchema
);