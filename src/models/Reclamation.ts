// models/Reclamation.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IReclamation extends Document {
  clientId: string;
  reference?: string;
  objet: string;
  description?: string;
  statut: 'brouillon' | 'soumise' | 'en_cours' | 'resolue' | 'rejetee';
  attachements?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const ReclamationSchema = new Schema<IReclamation>(
  {
    clientId: {
      type: String,
      required: true,
      index: true,
    },
    reference: {
      type: String,
    },
    objet: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    statut: {
      type: String,
      enum: ['brouillon', 'soumise', 'en_cours', 'resolue', 'rejetee'],
      default: 'brouillon',
      required: true,
    },
    attachements: {
      type: [String],
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IReclamation>("Reclamation", ReclamationSchema);