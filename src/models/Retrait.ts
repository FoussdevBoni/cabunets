// models/Retrait.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IRetrait extends Document {
    vendeurId: mongoose.Types.ObjectId;
    vendeur: mongoose.Types.ObjectId;
    amount: number;
    netAmount: number;
    methodPayment: {
        type: "Momo" | "Bank";
        number: string;
        intitule: string;
    };
    rejectReason?: string;
    status: "PENDING" | "COMPLETED" | "REJECTED";
    createdAt: Date;
    updatedAt: Date;
}

const RetraitSchema = new Schema<IRetrait>(
    {
        vendeurId: {
            type: Schema.Types.ObjectId,
            ref: "Vendeur",
            required: true,
            index: true,
        },
        vendeur: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        amount: {
            type: Number,
            required: true,
        },
        netAmount: {
            type: Number,
            required: true,
        },
        methodPayment: {
            type: {
                type: String,
                enum: ["Momo", "Bank"],
                required: true,
            },
            number: {
                type: String,
                required: true,
            },
            intitule: {
                type: String,
                required: true,
            },
        },
        rejectReason: {
            type: String,
        },
        status: {
            type: String,
            enum: ["PENDING", "COMPLETED", "REJECTED"],
            default: "PENDING",
            required: true,
        },
    },
    {
        timestamps: true,
    }
);


export default mongoose.model<IRetrait>("Retrait", RetraitSchema);