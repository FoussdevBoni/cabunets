// src/models/User.ts
import mongoose, { Document, Schema } from "mongoose";
import bcrypt from "bcrypt";

export interface IUser extends Document {
  email: string;
  password: string;
  role: 'vendeur' | 'admin';
  username?: string;
  avatar?: string;
  isVerified: boolean;
  isPremium: boolean;

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
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    username: { type: String },
    avatar: { type: String },
    role: { type: String, enum: ["superviseur", "vendeur", "admin"], required: true },
    isVerified: { type: Boolean, default: false },
    isPremium: { type: Boolean, default: false },
    passwordResetOtp: { type: String, select: false },
    passwordResetExpires: { type: Date },
    emailConfirmationOtp: { type: String, select: false },
    emailConfirmationExpires: { type: Date },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } } // virtuals activés
);

// Hash automatique du mot de passe
userSchema.pre<IUser>("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Comparer le mot de passe
userSchema.methods.comparePassword = async function (candidatePassword: string) {
  return bcrypt.compare(candidatePassword, this.password);
};

// -----------------------------
// VIRTUALS POPULATE
// -----------------------------

// Dernier balance pour un vendeur
userSchema.virtual("lastBalanceVendeur", {
  ref: "Balance",
  localField: "_id",
  foreignField: "vendeurId",
  justOne: true, // 1 balance
  options: { sort: { createdAt: -1 } }, // dernier
});

// Dernier balance pour un superviseur
userSchema.virtual("lastBalanceSuperviseur", {
  ref: "Balance",
  localField: "_id",
  foreignField: "superviseurId",
  justOne: true, // 1 balance
  options: { sort: { createdAt: -1 } }, // dernier
});

export default mongoose.model<IUser>("User", userSchema);
