import mongoose, { Schema, Document } from "mongoose";

export interface IVendeur extends Document {
  _id: mongoose.Types.ObjectId;

  whatsappNumber: string;
  advantage: string;

  networks: {
    Airtel: boolean;
    Vodacom: boolean;
    Africell: boolean;
    Orange: boolean;
  };

  photoUrls: string[];
  paymentAmount: number;
  availability: string;

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
    },
  },
  { timestamps: true }
);

export const Vendeur = mongoose.model<IVendeur>("Vendeur", VendeurSchema);
