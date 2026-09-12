// models/Retrait.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IRetrait extends Document {
    vendeurId?: mongoose.Types.ObjectId;
    vendeur?: mongoose.Types.ObjectId;
    type: 'cabunet' | 'vendeur';
    amount: number;
    payoutId?: string
    correspondent?: string;
    currency: "CDF" | "USD";
    methodPayment: {
        type: "Momo" | "Bank";
        number: string;
        intitule: string;
    };
    rejectReason?: string;
    status: "PENDING" | "COMPLETED" | "REJECTED" | 'ACCEPTED' | 'DUPLICATE_IGNORED';
    createdAt: Date;
    updatedAt: Date;
}

const RetraitSchema = new Schema<IRetrait>(
    {
        vendeurId: {
            type: Schema.Types.ObjectId,
            ref: "Vendeur",
            required: false,
            index: true,
        },
        vendeur: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: false,
            index: true,
        },
        type: {
            type: String,
            enum: ["cabunet", "vendeur"],
            required: true,
            default: "vendeur",
            index: true,
        },
        amount: {
            type: Number,
            required: true,
        },
        payoutId: {
            type: String,
            required: false,
        },

        correspondent: {
            type: String,
            required: false,
        },

        currency: {
            type: String,
            required: true,
            enum: ["CDF", "USD"],
            default: "CDF"
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
            enum: ["PENDING", "ACCEPTED", "COMPLETED", "REJECTED", "DUPLICATE_IGNORED"],
            default: "PENDING",
            required: true,
        },
    },
    {
        timestamps: true,
    }
);


export default mongoose.model<IRetrait>("Retrait", RetraitSchema);