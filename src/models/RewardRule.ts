// src/models/RewardRule.ts
import mongoose, { Schema, Document } from "mongoose";

export type ProgramType =
  | "affiliation_client"
  | "affiliation_vendeur"
  | "parrainage_client";

export type RewardMode = "fixe" | "pourcentage" | "hybride";

export interface IRewardRule extends Document {
  _id: mongoose.Types.ObjectId;

  name: string;
  description?: string;

  program: ProgramType;
  mode: RewardMode;

  fixedAmount?: number;
  percentage?: number;

  cap?: number;

  currency: string;

  availabilityDelayDays: number;

  active: boolean;

  startDate?: Date;
  endDate?: Date;

  createdAt: Date;
  updatedAt: Date;
}

const RewardRuleSchema = new Schema<IRewardRule>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
      default: "",
    },

    program: {
      type: String,
      enum: [
        "affiliation_client",
        "affiliation_vendeur",
        "parrainage_client",
      ],
      required: true,
      index: true,
    },

    mode: {
      type: String,
      enum: ["fixe", "pourcentage", "hybride"],
      required: true,
    },

    fixedAmount: {
      type: Number,
      min: 0,
      default: 0,
    },

    percentage: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },

    cap: {
      type: Number,
      min: 0,
    },

    currency: {
      type: String,
      default: "CDF",
      uppercase: true,
    },

    availabilityDelayDays: {
      type: Number,
      default: 7,
      min: 0,
    },

    active: {
      type: Boolean,
      default: true,
      index: true,
    },

    startDate: { type: Date },
    endDate: { type: Date },
  },
  { timestamps: true }
);

RewardRuleSchema.index({ program: 1, active: 1 });

export const RewardRule = mongoose.model<IRewardRule>(
  "RewardRule",
  RewardRuleSchema
);