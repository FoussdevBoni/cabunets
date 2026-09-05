// models/Notification.ts
import mongoose, { Schema, Document } from "mongoose";

export interface INotification extends Document {
    title: string;
    receivers?: string[];
    type: "general" | "private" | "whatsapp";
    body: string;
    attachments?: string[];
    readBy: string[];
    whatsappSent: boolean;
    whatsappSentAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
    {
        title: {
            type: String,
            required: true,
        },
        receivers: {
            type: [String],
            default: [],
        },
        type: {
            type: String,
            enum: ["general", "private", "whatsapp"],
            required: true,
            default: "general",
        },
        body: {
            type: String,
            required: true,
        },
        attachments: {
            type: [String],
            default: [],
        },
        readBy: {
            type: [String],
            default: [],
        },
        whatsappSent: {
            type: Boolean,
            default: false,
        },
        whatsappSentAt: {
            type: Date,
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);

export default mongoose.model<INotification>("Notification", NotificationSchema);