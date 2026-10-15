// src/services/metier/authService.ts
import User, { IUser } from "../../models/User";
import { Vendeur } from "../../models/Vendeur";
import { Client } from "../../models/Client";
import { emailService } from "../utilitaires/emailService";
import { validators } from "../../utils/validators";
import { otp as otpUtil } from "../../utils/otp";
import {
  AuthError,
  NotFoundError,
  ValidationError,
  ConflictError,
} from "../../utils/errors";

// ============================================================
// Types
// ============================================================
export interface RegisterPayload {
  email: string;
  password: string;
  role: "client" | "vendeur" | "admin";
  username?: string;
  avatar?: string;
  profileData?: Record<string, any>;
}

export interface UpdateUserPayload {
  username?: string;
  avatar?: string;
  profileData?: Record<string, any>;
}

// ============================================================
// Constantes
// ============================================================
const OTP_TTL_MINUTES = 30;
const PASSWORD_RESET_TTL_MINUTES = 10;

// ============================================================
// Service
// ============================================================
export const authService = {
  // ---------- LOGIN ----------
  async login(email: string, password: string) {
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      throw new NotFoundError("Utilisateur non trouvé");
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new AuthError("Mot de passe incorrect");
    }

    user.lastLoginAt = new Date();
    user.loginCount = (user.loginCount ?? 0) + 1;
    await user.save();

    return {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
    };
  },

  // ---------- REGISTER ----------
  async register(payload: RegisterPayload) {
    const { email, password, role, username, avatar, profileData } = payload;

    // Validation
    if (!email || !password || !role) {
      throw new ValidationError("Tous les champs requis");
    }
    if (!validators.isEmail(email)) {
      throw new ValidationError("Email invalide");
    }
    if (!validators.isStrongPassword(password)) {
      throw new ValidationError("Mot de passe trop court (min. 6 caractères)");
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new ConflictError("Email déjà utilisé");
    }

    // Création du user
    const user = new User({
      email,
      password,
      role,
      username,
      avatar,
      isVerified: false,
    });

    // OTP de confirmation
    const code = otpUtil.generate();
    user.emailConfirmationOtp = otpUtil.hash(code);
    user.emailConfirmationExpires = otpUtil.expiryFromNow(OTP_TTL_MINUTES);

    await user.save();

    // Profil lié selon le rôle
    let profile = null;
    if (role === "vendeur") {
      profile = await Vendeur.create({
        _id: user._id,
        email,
        ...(profileData ?? {}),
      });
    } else if (role === "client") {
      profile = await Client.create({
        _id: user._id,
        email,
        ...(profileData ?? {}),
      });
    }

    // Envoi de l'email (on ne bloque pas si échec)
    try {
      await emailService.sendConfirmationOtp(email, code);
    } catch (err) {
      console.error("Échec envoi email de confirmation :", err);
    }

    return {
      user: {
        id: user._id.toString(),
        email: user.email,
        role: user.role,
      },
      profile,
    };
  },

  // ---------- CONFIRM USER ----------
  async confirmUser(email: string, code: string) {
    if (!email || !code) {
      throw new ValidationError("Email et code requis");
    }
    if (!validators.isOtp(code)) {
      throw new ValidationError("Code OTP invalide");
    }

    const otpHash = otpUtil.hash(code);

    const user = await User.findOne({
      email,
      emailConfirmationOtp: otpHash,
      emailConfirmationExpires: { $gt: new Date() },
    });

    if (!user) {
      throw new AuthError("OTP invalide ou expiré");
    }

    if (user.isVerified) {
      return {
        alreadyVerified: true,
        user: {
          id: user._id.toString(),
          email: user.email,
          role: user.role,
        },
      };
    }

    user.isVerified = true;
    user.emailConfirmationOtp = undefined;
    user.emailConfirmationExpires = undefined;
    user.lastLoginAt = new Date();
    user.loginCount = (user.loginCount ?? 0) + 1;

    await user.save();

    return {
      alreadyVerified: false,
      user: {
        id: user._id.toString(),
        email: user.email,
        role: user.role,
      },
    };
  },

  // ---------- PASSWORD RESET ----------
  async requestPasswordReset(email: string) {
    if (!email) {
      throw new ValidationError("Email requis");
    }

    const user = await User.findOne({ email });
    if (!user) {
      // On ne révèle jamais si l'email existe ou non
      return { sent: true };
    }

    const code = otpUtil.generate();
    user.passwordResetOtp = otpUtil.hash(code);
    user.passwordResetExpires = otpUtil.expiryFromNow(PASSWORD_RESET_TTL_MINUTES);
    await user.save();

    try {
      await emailService.sendPasswordResetOtp(email, code);
    } catch (err) {
      console.error("Échec envoi email de reset :", err);
    }

    return { sent: true };
  },

  async resetPasswordWithOtp(
    email: string,
    code: string,
    newPassword: string
  ) {
    if (!email || !code || !newPassword) {
      throw new ValidationError("Email, OTP et nouveau mot de passe requis");
    }
    if (!validators.isStrongPassword(newPassword)) {
      throw new ValidationError("Mot de passe trop court (min. 6 caractères)");
    }

    const otpHash = otpUtil.hash(code);

    const user = await User.findOne({
      email,
      passwordResetOtp: otpHash,
      passwordResetExpires: { $gt: new Date() },
    }).select("+password");

    if (!user) {
      throw new AuthError("OTP invalide ou expiré");
    }

    user.password = newPassword;
    user.passwordResetOtp = undefined;
    user.passwordResetExpires = undefined;

    await user.save();

    return { success: true };
  },

  // ---------- GET PROFILE ----------
  async getUserProfile(userId: string) {
    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError("Utilisateur introuvable");
    }

    let roleInfo: any = null;
    switch (user.role) {
      case "vendeur":
        roleInfo = await Vendeur.findOne({ _id: user._id });
        break;
      case "client":
        roleInfo = await Client.findOne({ _id: user._id });
        break;
      default:
        roleInfo = null;
    }

    return {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
      username: user.username,
      avatar: user.avatar,
      isPremium: user.isPremium,
      isVerified: user.isVerified,
      profile: roleInfo,
      lastLoginAt: user.lastLoginAt ?? null,
      loginCount: user.loginCount ?? 0,
      actionsCount: user.actionsCount ?? 0,
      createdAt: user.createdAt,
    };
  },

  // ---------- UPDATE USER ----------
  async updateUser(userId: string, payload: UpdateUserPayload) {
    const { username, avatar, profileData } = payload;

    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError("Utilisateur introuvable");
    }

    if (username !== undefined) user.username = username;
    if (avatar !== undefined) user.avatar = avatar;
    await user.save();

    let vendeurProfile = null;
    let clientProfile = null;

    if (user.role === "vendeur" && profileData) {
      const allowedProfileData = {
        whatsappNumber: profileData.whatsappNumber,
        advantage: profileData.advantage,
        availability: profileData.availability,
        paymentAmount: profileData.paymentAmount,
        photoUrls: profileData.photoUrls,
        networks: profileData.networks,
      };

      vendeurProfile = await Vendeur.findByIdAndUpdate(
        user._id,
        { $set: allowedProfileData },
        { new: true }
      );
    }

    if (user.role === "client" && profileData) {
      const allowedProfileData = {
        whatsappNumber: profileData.whatsappNumber,
        rechargePhone: profileData.rechargePhone,
      };

      clientProfile = await Client.findByIdAndUpdate(
        user._id,
        { $set: allowedProfileData },
        { new: true }
      );
    }

    return {
      _id: user._id.toString(),
      email: user.email,
      username: user.username,
      avatar: user.avatar,
      role: user.role,
      isVerified: user.isVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      profile: user.role === "vendeur" ? vendeurProfile : clientProfile,
    };
  },
};

export type AuthService = typeof authService;