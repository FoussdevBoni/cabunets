// models/Vendeur.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IVendeur extends Document {
  _id: mongoose.Types.ObjectId;

  isApproved: boolean;
  approvedAt?: Date;
  approvedBy?: mongoose.Types.ObjectId;
  whatsappNumber: string;
  advantage: string;

  // Code d'affiliation (généré côté serveur, PAS dans le schéma)
  codeAffiliation?: string;

  networks: {
    Airtel: boolean;
    Vodacom: boolean;
    Africell: boolean;
    Orange: boolean;
  };

  photoUrls: string[];
  paymentAmount: number;
  availability: string;

  // Horaires d'ouverture
  openingTime?: string; // Format "HH:mm"
  closingTime?: string;  // Format "HH:mm"

  createdAt: Date;
  updatedAt: Date;
}

const VendeurSchema = new Schema<IVendeur>(
  {
    _id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    isApproved: { type: Boolean, default: false },
    approvedAt: Date,
    approvedBy: { type: Schema.Types.ObjectId, ref: "User" },
    whatsappNumber: {
      type: String,
      required: true,
      trim: true,
    },

    advantage: {
      type: String,
      trim: true,
      default: "",
    },

    // ─────────────────────────────────────────────
    // Code d'affiliation
    // - Pas de "default" : généré côté serveur
    // - Unique : un code = un seul vendeur
    // - Indexé : recherche rapide
    // ─────────────────────────────────────────────
    codeAffiliation: {
      type: String,
      required: false,
      unique: true,
      sparse: true, // autorise plusieurs documents sans code
      uppercase: true,
      trim: true,
      index: true,
      validate: {
        validator: function (v: string) {
          if (!v) return true; // optionnel
          return /^[A-Z0-9-]{4,20}$/.test(v);
        },
        message: (props) =>
          `${props.value} n'est pas un code d'affiliation valide (4 à 20 caractères alphanumériques ou tirets)`,
      },
    },

    networks: {
      Airtel: { type: Boolean, default: false },
      Vodacom: { type: Boolean, default: false },
      Africell: { type: Boolean, default: false },
      Orange: { type: Boolean, default: false },
    },

    photoUrls: {
      type: [String],
      default: [],
    },

    paymentAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    availability: {
      type: String,
      default: "disponible",
    },

    openingTime: {
      type: String,
      trim: true,
      default: "08:00",
      validate: {
        validator: function (v: string) {
          return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
        },
        message: (props) =>
          `${props.value} n'est pas un format d'heure valide (HH:mm)`,
      },
    },

    closingTime: {
      type: String,
      trim: true,
      default: "18:00",
      validate: {
        validator: function (v: string) {
          return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
        },
        message: (props) =>
          `${props.value} n'est pas un format d'heure valide (HH:mm)`,
      },
    },
  },
  { timestamps: true }
);

// Index pour filtrer/trier par horaires
VendeurSchema.index({ openingTime: 1, closingTime: 1 });

// Index unique sur le code (sécurité supplémentaire)
VendeurSchema.index({ codeAffiliation: 1 }, { unique: true, sparse: true });

export const Vendeur = mongoose.model<IVendeur>("Vendeur", VendeurSchema);