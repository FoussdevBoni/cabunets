// src/models/Referral.ts
import mongoose, { Schema, Document } from "mongoose";

export type ReferralType = "client" | "vendeur";
export type ReferralSource = "lien" | "code_manuel" | "admin";

export interface IReferral extends Document {
  _id: mongoose.Types.ObjectId;

  affiliateId: mongoose.Types.ObjectId;   // Le parrain (User affilié)
  filleulId: mongoose.Types.ObjectId;     // Le filleul (User)
  type: ReferralType;                      // client ou vendeur

  codeUtilise: string;                     // Le code utilisé
  source: ReferralSource;

  attributedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ReferralSchema = new Schema<IReferral>(
  {
    affiliateId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    filleulId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    type: {
      type: String,
      enum: ["client", "vendeur"],
      required: true,
    },

    codeUtilise: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },

    source: {
      type: String,
      enum: ["lien", "code_manuel", "admin"],
      default: "lien",
    },

    attributedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// ─────────────────────────────────────────────
// RÈGLE D'OR : un filleul ne peut avoir qu'UN SEUL parrain
// ─────────────────────────────────────────────
ReferralSchema.index({ filleulId: 1 }, { unique: true, name: "referral_filleul_unique" });

// Recherche rapide : tous les filleuls d'un parrain
ReferralSchema.index({ affiliateId: 1, createdAt: -1 });

export const Referral = mongoose.model<IReferral>("Referral", ReferralSchema);