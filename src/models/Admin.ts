import mongoose, { Schema, Document } from "mongoose";

export interface IAdmin extends Document {
    _id: mongoose.Types.ObjectId;

   

    createdAt: Date;
    updatedAt: Date;
}

const AdminSchema = new Schema<IAdmin>(
    {
        _id: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

       




    },
    { timestamps: true }
);

export const Admin = mongoose.model<IAdmin>("Admin", AdminSchema);
