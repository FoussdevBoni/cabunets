import mongoose, { Schema, Document } from "mongoose";

export interface IClient extends Document {
    _id: mongoose.Types.ObjectId;

    whatsappNumber: string;
    rechargePhone?: string
    address?: string


    createdAt: Date;
    updatedAt: Date;
}

const ClientSchema = new Schema<IClient>(
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

        rechargePhone: {
            type: String,
            required: false,
            trim: true,
        },

        address: {
            type: String,
            required: false,
            trim: true,
        },




    },
    { timestamps: true }
);

export const Client = mongoose.model<IClient>("Client", ClientSchema);
