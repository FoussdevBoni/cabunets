// src/models/User.ts
import mongoose, { Document, Schema } from "mongoose";
import bcrypt from "bcrypt";

export interface IUser extends Document {
  email: string;
  password: string;
  role: "vendeur" | "admin" | "client";
  username?: string;
  avatar?: string;
  isVerified: boolean;
  isPremium: boolean;
  isActive: boolean;

  // ─────────────────────────────────────────────
  // 🆕 Cabuaffili : dimension parrain
  // ─────────────────────────────────────────────
  isAffiliate: boolean;
  codeParrainage?: string;

  // Suivi d'activité
  lastLoginAt?: Date;
  loginCount: number;
  actionsCount: number;

  passwordResetOtp?: string;
  passwordResetExpires?: Date;
  emailConfirmationOtp?: string;
  emailConfirmationExpires?: Date;

  createdAt: Date;
  updatedAt: Date;

  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true, select: false },
    username: { type: String },
    avatar: { type: String },
    role: {
      type: String,
      enum: ["client", "vendeur", "admin"],
      required: true,
      default: "client",
    },
    isVerified: { type: Boolean, default: false },
    isPremium: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },

    // ─────────────────────────────────────────────
    // 🆕 Cabuaffili
    // ─────────────────────────────────────────────
    isAffiliate: {
      type: Boolean,
      default: false,
      index: true,
    },

    codeParrainage: {
      type: String,
      uppercase: true,
      trim: true,
      sparse: true,   // autorise plusieurs users sans code
      unique: true,   // un code = un seul user
      index: true,
      validate: {
        validator: function (v: string) {
          if (!v) return true;
          return /^[A-Z0-9-]{4,20}$/.test(v);
        },
        message: (props) =>
          `${props.value} n'est pas un code de parrainage valide (4 à 20 caractères)`,
      },
    },

    // Suivi d'activité
    lastLoginAt: { type: Date, index: true },
    loginCount: { type: Number, default: 0, min: 0 },
    actionsCount: { type: Number, default: 0, min: 0 },

    passwordResetOtp: { type: String, select: false },
    passwordResetExpires: { type: Date },
    emailConfirmationOtp: { type: String, select: false },
    emailConfirmationExpires: { type: Date },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Index pour requêter les top users actifs
userSchema.index({ role: 1, actionsCount: -1 });
userSchema.index({ role: 1, loginCount: -1 });

// 🆕 Index Cabuaffili
userSchema.index({ isAffiliate: 1, isActive: 1 });

// Hash automatique du mot de passe
userSchema.pre<IUser>("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Comparer le mot de passe
userSchema.methods.comparePassword = async function (
  candidatePassword: string
) {
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model<IUser>("User", userSchema);