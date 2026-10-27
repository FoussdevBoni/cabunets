import mongoose, { Schema } from "mongoose";
const schema = new Schema({
  _id: { type: String, default: "default" },
  minWithdrawalAmount: { type: Number, required: true, min: 1, default: 5000 },
  updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
}, { timestamps: true });
export const AffiliateSettings = mongoose.model("AffiliateSettings", schema);
