// models/Client.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IClient extends Document {
  _id: mongoose.Types.ObjectId;

  whatsappNumber: string;
  rechargePhone?: string;
  address?: string;

  // ─────────────────────────────────────────────
  // Affiliation
  // - referredBy pointe vers Affiliate (PAS Vendeur)
  // - codeAffiliation retiré (redondant, on le retrouve via l'affilié)
  // ─────────────────────────────────────────────
  referredBy?: mongoose.Types.ObjectId;

  createdAt: Date;
  updatedAt: Date;
}

const ClientSchema = new Schema<IClient>(
  {
    _id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    whatsappNumber: {
      type: String,
      required: true,
      trim: true,
    },

    rechargePhone: {
      type: String,
      required: false,
      trim: true,
    },

    address: {
      type: String,
      required: false,
      trim: true,
    },

    // ─────────────────────────────────────────────
    // Référence vers l'affilié qui a parrainé ce client
    // ─────────────────────────────────────────────
    referredBy: {
      type: Schema.Types.ObjectId,
      ref: "Affiliate",
      required: false,
      index: true,
    },
  },
  { timestamps: true }
);

// Index pour retrouver rapidement les clients d'un affilié
ClientSchema.index({ referredBy: 1, createdAt: -1 });

export const Client = mongoose.model<IClient>("Client", ClientSchema);