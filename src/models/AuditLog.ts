// models/AuditLog.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IAuditLog extends Document {
  actorId: mongoose.Types.ObjectId;        // qui a VRAIMENT agi (admin)
  impersonatedUserId?: mongoose.Types.ObjectId; // sous quelle identité
  action: string;                          // "order.create", "profile.update"...
  targetType?: string;                     // "Order", "Client", "Vendeur"...
  targetId?: string;
  method: string;
  path: string;
  ip?: string;
  userAgent?: string;
  payload?: any;                           // body filtré (⚠️ pas de password/token)
  status?: number;
  createdAt: Date;
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    actorId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    impersonatedUserId: { type: Schema.Types.ObjectId, ref: "User", index: true },
    action: { type: String, required: true, index: true },
    targetType: String,
    targetId: { type: String, index: true },
    method: String,
    path: String,
    ip: String,
    userAgent: String,
    payload: Schema.Types.Mixed,
    status: Number,
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

AuditLogSchema.index({ createdAt: -1 });

export const AuditLog = mongoose.model<IAuditLog>("AuditLog", AuditLogSchema);