// models/Reclamation.ts
import mongoose, { Schema, Document } from "mongoose";

export interface LinkedEntity {
  type: 'vendeur' | 'order' | 'offer' | 'client';
  id: string;
}

export interface IReclamation extends Document {
  userId: string;
  user: mongoose.Types.ObjectId;
  reference?: string;
  objet: string;
  description?: string;
  statut: 'soumise' | 'en_cours' | 'resolue' | 'rejetee';
  attachements?: string[];
  linkedEntities?: LinkedEntity[];
  createdAt: Date;
  updatedAt: Date;
}

const ReclamationSchema = new Schema<IReclamation>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
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
      enum: ['soumise', 'en_cours', 'resolue', 'rejetee'],
      default: 'soumise',
      required: true,
    },
    attachements: {
      type: [String],
    },
    linkedEntities: {
      type: [{
        type: {
          type: String,
          enum: ['vendeur', 'order', 'offer', 'client'],
          required: true,
        },
        id: {
          type: String,
          required: true,
        }
      }],
      default: [],
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

ReclamationSchema.virtual('reference').get(function() {
  return `REC-${this._id.toString().slice(-8).toUpperCase()}`;
});

export default mongoose.model<IReclamation>("Reclamation", ReclamationSchema);