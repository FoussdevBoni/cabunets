import mongoose, { Schema, Document } from "mongoose";

export interface IOrder extends Document {
  email: string;
  phoneNumber: string;
  units: number;
  price: number;
  currency: "FC" | "USD";
  network: string;
  offerId: string;
  vendeurId: string;
  vendeurName: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema = new Schema<IOrder>(
  {
    email: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    units: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true },
    currency: { type: String, required: true, enum: ["FC", "USD"] },
    network: { type: String, required: true },
    offerId: { type: String, required: true },
    vendeurId: { type: String, required: true },
    vendeurName: { type: String, required: true },
    status: { 
      type: String, 
      default: "pending",
      enum: ["pending", "confirmed", "completed", "cancelled"]
    }
  },
  { timestamps: true }
);

export const Order = mongoose.model<IOrder>("Order", OrderSchema);