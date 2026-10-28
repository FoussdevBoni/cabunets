// src/models/RewardWithdrawal.ts
import mongoose, { Schema, Document } from "mongoose";

export type RewardWithdrawalStatus =
  | "en_attente"
  | "approuvee"
  | "rejetee"
  | "payee";

export type RewardWithdrawalChannel =
  | "airtel_money"
  | "vodacom_mpesa"
  | "orange_money"
  | "africell_money"
  | "manuel";

export interface IRewardWithdrawal extends Document {
  _id: mongoose.Types.ObjectId;

  affiliateId: mongoose.Types.ObjectId;

  amount: number;
  currency: string;

  channel: RewardWithdrawalChannel;
  maskedDestination: string;
  destinationEncrypted?: string;

  status: RewardWithdrawalStatus;

  reason?: string;
  externalReference?: string;
  paymentProof?: string;

  processedBy?: mongoose.Types.ObjectId;
  processedAt?: Date;

  createdAt: Date;
  updatedAt: Date;
}

const RewardWithdrawalSchema = new Schema<IRewardWithdrawal>(
  {
    affiliateId: {
      type: Schema.Types.ObjectId,
      ref: "User",
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

    channel: {
      type: String,
      enum: [
        "airtel_money",
        "vodacom_mpesa",
        "orange_money",
        "africell_money",
        "manuel",
      ],
      required: true,
    },

    destinationEncrypted: { type: String, select: false },
    maskedDestination: {
      type: String,
      required: true,
      trim: true,
    },

    status: {
      type: String,
      enum: ["en_attente", "approuvee", "rejetee", "payee"],
      default: "en_attente",
      index: true,
    },

    reason: { type: String },
    externalReference: { type: String },
    paymentProof: { type: String },

    processedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    processedAt: { type: Date },
  },
  { timestamps: true }
);

RewardWithdrawalSchema.index({ affiliateId: 1, createdAt: -1 });
RewardWithdrawalSchema.index({ status: 1, createdAt: -1 });

export const RewardWithdrawal = mongoose.model<IRewardWithdrawal>(
  "RewardWithdrawal",
  RewardWithdrawalSchema
);