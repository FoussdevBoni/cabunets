// src/models/Affiliate.ts
import mongoose, { Schema, Document } from "mongoose";

export type AffiliateStatus = "en_attente" | "actif" | "suspendu";

export interface IAffiliate extends Document {
  _id: mongoose.Types.ObjectId;   // ⚠️ MÊME _id que User

  telephone: string;
  telephoneVerifie: boolean;

  statut: AffiliateStatus;

  createdAt: Date;
  updatedAt: Date;
}

const AffiliateSchema = new Schema<IAffiliate>(
  {
    _id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    telephone: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    telephoneVerifie: {
      type: Boolean,
      default: false,
    },

    statut: {
      type: String,
      enum: ["en_attente", "actif", "suspendu"],
      default: "en_attente",
      index: true,
    },
  },
  { timestamps: true }
);

export const Affiliate = mongoose.model<IAffiliate>(
  "Affiliate",
  AffiliateSchema
);