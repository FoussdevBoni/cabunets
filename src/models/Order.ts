import mongoose, { Schema, Document } from "mongoose";

export interface IOrder extends Document {
  phoneNumber: string;
  paymentPhone?: string;
  contactPhone?: string;
  units: number;
  price: number;
  currency: "XOF" | "FCFA" | "CDF" | "USD";
  network: string;
  correspondent?: string;
  offerId: string;
  vendeurId: string;
  vendeurName: string;
  vendeurPhone: string;
  clientId: string;
  depositId?: string;
  providerTransactionId?: string;
  failureReason?: string;
  failureCode?: string;
  status: "PENDING" | "COMPLETED" | "FAILED" | "DELIVERED";
  depositExistence?: 'FOUND' | 'NOT_FOUND';
  depositPaymentStatus?: string;
  
  // Champs pour la notification WhatsApp
  whatsappSent?: boolean;
  whatsappSentAt?: Date;
  whatsappProcessing?: boolean;
  whatsappProcessingAt?: Date;
  whatsappProcessingStuckAt?: Date;
  
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
      enum: ["PENDING", "COMPLETED", "FAILED", "DELIVERED"]
    },
    depositExistence: {
      type: String,
      enum: ['FOUND', 'NOT_FOUND'],
    },
    depositPaymentStatus: { type: String },
    
    // ✅ CHAMPS POUR LA NOTIFICATION WHATSAPP
    whatsappSent: { 
      type: Boolean, 
      default: false 
    },
    whatsappSentAt: { 
      type: Date 
    },
    whatsappProcessing: { 
      type: Boolean, 
      default: false 
    },
    whatsappProcessingAt: { 
      type: Date 
    },
    whatsappProcessingStuckAt: { 
      type: Date 
    },
    
    deliveredAt: { 
      type: Date 
    },
  },
  { timestamps: true }
);

// ✅ INDEX POUR OPTIMISER LES RECHERCHES
// Index pour trouver les commandes en attente de notification
OrderSchema.index({ status: 1, whatsappSent: 1, whatsappProcessing: 1 });

// Index pour nettoyer les verrous bloqués
OrderSchema.index({ whatsappProcessing: 1, whatsappProcessingAt: 1 });

// Index pour les recherches par depositId
OrderSchema.index({ depositId: 1 });

export const Order = mongoose.model<IOrder>("Order", OrderSchema);