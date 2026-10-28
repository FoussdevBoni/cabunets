import mongoose, { Schema } from "mongoose";
const schema = new Schema({
  _id: { type: String, required: true },
  orderId: { type: Schema.Types.ObjectId, ref: "Order" },
  affiliateId: { type: Schema.Types.ObjectId, ref: "User" },
  category: { type: String, required: true },
  message: { type: String, required: true },
  status: { type: String, enum: ["open", "resolved"], default: "open", index: true },
  attempts: { type: Number, default: 0 },
  resolution: String,
  resolvedBy: { type: Schema.Types.ObjectId, ref: "User" },
  resolvedAt: Date,
}, { timestamps: true });
export const AffiliateIssue = mongoose.model("AffiliateIssue", schema);
