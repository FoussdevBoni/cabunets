import mongoose, { Schema, Document } from "mongoose";

export interface IOrder extends Document {
  phoneNumber: string;            // Téléphone principal (client)
  paymentPhone?: string;          // Téléphone utilisé pour le paiement Mobile Money
  contactPhone?: string;          // Téléphone de contact / WhatsApp
  units: number;
  price: number;
  currency: "XOF" | "FCFA" | "CDF" | "USD";
  network: string;                // Réseau de la recharge (ex: MTN, Moov, Celtiis, Vodacom...)
  correspondent?: string;         // Identifiant opérateur Cabupay (ex: MTN_MOMO_BEN)
  offerId: string;
  vendeurId: string;
  vendeurName: string;
  vendeurPhone: string;
  clientId: string;
  depositId?: string;
  // Reference unique du paiement Cabupay
  providerTransactionId?: string; // ID transaction opérateur final
  failureReason?: string;         // Motif en cas d'échec du paiement
  failureCode?: string;
  status: "PENDING" | "COMPLETED" | "FAILED" | "DELIVERED";
  depositExistence?: 'FOUND' | 'NOT_FOUND';
  depositPaymentStatus?: string;
  whatsappSent?: boolean;
  whatsappSentAt?: Date;
  deliveredAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema = new Schema<IOrder>(
  {
    phoneNumber: { type: String, required: true },
    paymentPhone: { type: String, required: false },
    contactPhone: { type: String, required: false },
    units: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true },
    currency: {
      type: String,
      required: true,
      enum: ["XOF", "FCFA", "CDF", "USD"],
      default: "CDF"
    },
    network: { type: String, required: true },
    correspondent: { type: String, required: false },
    offerId: { type: String, required: true },
    vendeurId: { type: String, required: true },
    clientId: { type: String, required: false },

    vendeurName: { type: String, required: true },
    vendeurPhone: { type: String, required: false },
    depositId: { type: String, required: false, index: true },
    providerTransactionId: { type: String, required: false },
    failureReason: { type: String, required: false },
    failureCode: { type: String, required: false },

    status: {
      type: String,
      required: true,
      default: "PENDING",
      enum: ["PENDING", "COMPLETED", "FAILED"]
    },
    depositExistence: {
      type: String,
      enum: ['FOUND', 'NOT_FOUND'],
    },
    depositPaymentStatus: { type: String },
  },
  { timestamps: true }
);

export const Order = mongoose.model<IOrder>("Order", OrderSchema);