// controllers/authController.ts
import { Request, Response } from "express";
import User from "../models/User";
import jwt from "jsonwebtoken";
import validator from "validator";
import crypto from "crypto";
import { sendOtpEmail } from "../utils/sendOTPEmail";
import { Vendeur } from "../models/Vendeur";
import { Client } from "../models/Client";

// ================= TOKEN =================
export const generateToken = (userId: string, role: string) => {
  return jwt.sign(
    { id: userId, role },
    process.env.JWT_SECRET || "supersecret",
    { expiresIn: "7d" }
  );
};

// ================= LOGIN =================
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(400).json({ message: "User non trouvé." });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: "Mot de passe incorrect." });
    }

    // 🆕 Suivi de connexion
    user.lastLoginAt = new Date();
    user.loginCount = (user.loginCount ?? 0) + 1;
    await user.save();

    const token = generateToken(user._id.toString(), user.role);

    return res.status(200).json({
      message: "Connexion réussie",
      user: { id: user._id, email: user.email, role: user.role },
      token,
    });
  } catch (err) {
    console.error("login error:", err);
    return res.status(500).json({ message: "Erreur serveur" });
  }
};

// ================= REGISTER =================
export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, role, username, avatar, profileData } = req.body;

    if (!email || !password || !role)
      return res.status(400).json({ message: "Tous les champs requis." });
    if (!validator.isEmail(email))
      return res.status(400).json({ message: "Email invalide." });
    if (password.length < 6)
      return res.status(400).json({ message: "Mot de passe trop court." });

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "Email déjà utilisé." });

    const user = new User({
      email,
      password,
      role,
      username,
      avatar,
      isVerified: false,
    });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.emailConfirmationOtp = crypto
      .createHash("sha256")
      .update(otp)
      .digest("hex");
    user.emailConfirmationExpires = new Date(Date.now() + 30 * 60 * 1000);
    await user.save();

    let profile = null;

    if (role === "vendeur") {
      profile = await Vendeur.create({
        _id: user._id,
        email,
        ...profileData,
      });
    }

    if (role === "client") {
      profile = await Client.create({
        _id: user._id,
        email,
        ...profileData,
      });
    }

    // await sendOtpEmail(user.email, otp);

    const token = generateToken(user._id.toString(), user.role);

    return res.status(201).json({
      message:
        "Utilisateur créé. Vérifiez votre email pour confirmer le compte.",
      user: { id: user._id, email: user.email, role: user.role, profile },
      token,
    });
  } catch (err) {
    console.error("Erreur lors de l’inscription :", err);
    return res.status(500).json({ message: "Erreur serveur" });
  }
};

// ================= CONFIRM USER =================
export const confirmUser = async (req: Request, res: Response) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp)
      return res.status(400).json({ message: "Email et code requis." });

    const otpHash = crypto.createHash("sha256").update(otp).digest("hex");

    const user = await User.findOne({
      email,
      emailConfirmationOtp: otpHash,
      emailConfirmationExpires: { $gt: new Date() },
    });

    if (!user)
      return res.status(400).json({ message: "OTP invalide ou expiré." });
    if (user.isVerified)
      return res.status(200).json({ message: "Compte déjà confirmé." });

    user.isVerified = true;
    user.emailConfirmationOtp = undefined;
    user.emailConfirmationExpires = undefined;

    // 🆕 Première connexion implicite à la confirmation
    user.lastLoginAt = new Date();
    user.loginCount = (user.loginCount ?? 0) + 1;

    await user.save();

    const token = generateToken(user._id.toString(), user.role);

    return res.status(200).json({
      message: "Compte confirmé avec succès.",
      user: { id: user._id, email: user.email, role: user.role },
      token,
    });
  } catch (err) {
    console.error("Erreur confirmation:", err);
    return res.status(500).json({ message: "Erreur serveur." });
  }
};

// ================= PASSWORD RESET =================
export const requestPasswordReset = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email requis." });

    const user = await User.findOne({ email });
    if (!user)
      return res
        .status(200)
        .json({ message: "Si cet email existe, un code a été envoyé." });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpHash = crypto.createHash("sha256").update(otp).digest("hex");
    user.passwordResetOtp = otpHash;
    user.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    await sendOtpEmail(user.email, otp);

    return res
      .status(200)
      .json({ message: "Si cet email existe, un code a été envoyé." });
  } catch (err) {
    console.error("requestPasswordReset error:", err);
    return res.status(500).json({ message: "Erreur serveur." });
  }
};

export const resetPasswordWithOtp = async (req: Request, res: Response) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
      return res
        .status(400)
        .json({ message: "Email, OTP et nouveau mot de passe requis." });
    }

    const otpHash = crypto.createHash("sha256").update(otp).digest("hex");

    const user = await User.findOne({
      email,
      passwordResetOtp: otpHash,
      passwordResetExpires: { $gt: new Date() },
    }).select("+password");

    if (!user)
      return res.status(400).json({ message: "OTP invalide ou expiré." });

    user.password = newPassword;
    user.passwordResetOtp = undefined;
    user.passwordResetExpires = undefined;

    await user.save();

    return res
      .status(200)
      .json({ message: "Mot de passe réinitialisé avec succès." });
  } catch (err) {
    console.error("resetPasswordWithOtp error:", err);
    return res.status(500).json({ message: "Erreur serveur." });
  }
};

// ================= GET PROFILE (impersonation-safe) =================
export const getUserProfile = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Veuillez vous connecter." });
    }

    // req.user.userId = la CIBLE si impersonation, sinon l'utilisateur normal
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: "User introuvable." });
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

    return res.status(200).json({
      id: user._id,
      email: user.email,
      role: user.role,
      username: user.username,
      avatar: user.avatar,
      isPremium: user.isPremium,
      profile: roleInfo,
      impersonatedBy: req.user?.impersonatedBy ?? null,

      // 🆕 Suivi d'activité
      lastLoginAt: user.lastLoginAt ?? null,
      loginCount: user.loginCount ?? 0,
      actionsCount: user.actionsCount ?? 0,
      createdAt: user.createdAt,
    });
  } catch (err) {
    console.error("getUserProfile error:", err);
    return res.status(500).json({ message: "Erreur serveur" });
  }
};

// ================= LOGOUT =================
export const logout = async (_req: Request, res: Response) => {
  try {
    return res.status(200).json({
      message: "Déconnexion réussie (supprimez le token côté client).",
    });
  } catch (err) {
    return res.status(500).json({ message: "Erreur serveur", error: err });
  }
};

// ================= UPDATE USER (impersonation-safe) =================
export const updateUser = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Veuillez vous connecter." });
    }

    const userId = req.user.userId;
    const { username, avatar, profileData } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur introuvable." });
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

    return res.status(200).json({
      message: "Informations mises à jour avec succès.",
      data: {
        _id: user._id,
        email: user.email,
        username: user.username,
        avatar: user.avatar,
        role: user.role,
        isVerified: user.isVerified,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        profile: user.role === "vendeur" ? vendeurProfile : clientProfile,
      },
    });
  } catch (err) {
    console.error("Erreur update user :", err);
    return res.status(500).json({ message: "Erreur serveur" });
  }
};