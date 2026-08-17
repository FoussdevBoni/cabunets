import mongoose, { Schema, Document } from "mongoose";

export interface IVendeur extends Document {
  _id: mongoose.Types.ObjectId;

  whatsappNumber: string;
  advantage: string;

  networks: {
    Airtel: boolean;
    Vodacom: boolean;
    Africell: boolean;
    Orange: boolean;
  };

  photoUrls: string[];
  paymentAmount: number;
  availability: string;
  
  // Nouveaux champs pour les horaires
  openingTime?: string; // Format "HH:mm" (ex: "08:00")
  closingTime?: string; // Format "HH:mm" (ex: "18:00")
  isOnline?: boolean; // Statut calculé ou défini manuellement

  createdAt: Date;
  updatedAt: Date;
}

const VendeurSchema = new Schema<IVendeur>(
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

    advantage: {
      type: String,
      trim: true,
      default: "",
    },

    networks: {
      Airtel: { type: Boolean, default: false },
      Vodacom: { type: Boolean, default: false },
      Africell: { type: Boolean, default: false },
      Orange: { type: Boolean, default: false },
    },

    photoUrls: {
      type: [String],
      default: [],
    },

    paymentAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    availability: {
      type: String,
      default: "disponible",
    },

    // Nouveaux champs
    openingTime: {
      type: String,
      trim: true,
      default: "08:00",
      validate: {
        validator: function(v: string) {
          return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
        },
        message: props => `${props.value} n'est pas un format d'heure valide (HH:mm)`
      }
    },

    closingTime: {
      type: String,
      trim: true,
      default: "18:00",
      validate: {
        validator: function(v: string) {
          return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
        },
        message: props => `${props.value} n'est pas un format d'heure valide (HH:mm)`
      }
    },

    isOnline: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Méthode virtuelle pour vérifier si le vendeur est en ligne
VendeurSchema.virtual('isCurrentlyOnline').get(function() {
  if (!this.openingTime || !this.closingTime) return false;
  
  const now = new Date();
  const currentTime = now.getHours() * 60 + now.getMinutes();
  
  const [openHour, openMinute] = this.openingTime.split(':').map(Number);
  const [closeHour, closeMinute] = this.closingTime.split(':').map(Number);
  
  const openingMinutes = openHour * 60 + openMinute;
  const closingMinutes = closeHour * 60 + closeMinute;
  
  // Si l'heure d'ouverture est après l'heure de fermeture (ex: 22:00 - 06:00)
  if (openingMinutes > closingMinutes) {
    return currentTime >= openingMinutes || currentTime < closingMinutes;
  }
  
  return currentTime >= openingMinutes && currentTime < closingMinutes;
});

// Middleware pour mettre à jour automatiquement isOnline avant la sauvegarde
VendeurSchema.pre('save', function(next) {
  if (this.openingTime && this.closingTime) {
    // @ts-ignore - isCurrentlyOnline est une propriété virtuelle
    this.isOnline = this.isCurrentlyOnline;
  }
  next();
});

// Index pour les performances
VendeurSchema.index({ isOnline: 1 });
VendeurSchema.index({ openingTime: 1, closingTime: 1 });

export const Vendeur = mongoose.model<IVendeur>("Vendeur", VendeurSchema);