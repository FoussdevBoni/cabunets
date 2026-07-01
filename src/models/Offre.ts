import mongoose, { Schema, Document } from "mongoose";

export interface IOffre extends Document {
  vendeurId: mongoose.Types.ObjectId;
  vendeurName: string
  network: "Airtel" | "Vodacom" | "Africell" | "Orange";
  priceFC: number;
  priceUSD: number;
  units: number;
  createdAt: Date;
  updatedAt: Date;
}

const OffreSchema = new Schema<IOffre>(
  {
    vendeurId: {
      type: Schema.Types.ObjectId,
      ref: "Vendeur",
      required: true,
      index: true,
    },
   vendeurName: {
      type: String,
      required: true,
   },
    network: {
      type: String,
      enum: ["Airtel", "Vodacom", "Africell", "Orange"],
      required: true,
    },

    priceFC: {
      type: Number,
      required: true,
      min: 0,
    },

    priceUSD: {
      type: Number,
      required: true,
      min: 0,
    },

    units: {
      type: Number,
      required: true,
      min: 1,
    },
  },
  { timestamps: true }
);

export const Offre = mongoose.model<IOffre>("Offre", OffreSchema);
