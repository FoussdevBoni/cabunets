import { Request, Response } from "express";
import User, { IUser } from "../models/User";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import validator from "validator";
import crypto from "crypto";
import { sendOtpEmail } from "../utils/sendOTPEmail";
import { Vendeur } from "../models/Vendeur";


// === Types JWT ===
interface TokenPayload {
  id: string;
  role: string;
  iat: number;
  exp: number;
}

// === Générer un token JWT ===
export const generateToken = (userId: string, role: string) => {
  return jwt.sign(
    { id: userId, role },
    process.env.JWT_SECRET || "supersecret",
    { expiresIn: "7d" }
  );
};

// === Vérifier un token JWT ===
export const verifyToken = (token: string): TokenPayload | null => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "supersecret");
    if (typeof decoded !== "object" || !("id" in decoded) || !("role" in decoded)) {
      return null;
    }
    return decoded as TokenPayload;
  } catch (err) {
    console.error("Token invalide :", err);
    return null;
  }
};


// ================= LOGIN =================
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Sélection explicite du password si select:false dans le modèle
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(400).json({ message: "User non trouvé." });
    }



    // Vérification du mot de passe
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      console.log(password + "Mot de passe incorrect.")
      return res.status(400).json({ message: "Mot de passe incorrect." });
    }

    // Génération du token
    const token = generateToken(user._id.toString(), user.role);

    res.status(200).json({
      message: "Connexion réussie",
      user: { id: user._id, email: user.email, role: user.role },
      token,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Erreur serveur", error: err });
  }
};

// === REGISTER ===
export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, role, username, avatar, profileData } = req.body;

    // 1️⃣ Vérifications de base
    if (!email || !password || !role)
      return res.status(400).json({ message: "Tous les champs requis." });
    if (!validator.isEmail(email))
      return res.status(400).json({ message: "Email invalide." });
    if (password.length < 6)
      return res.status(400).json({ message: "Mot de passe trop court." });

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "Email déjà utilisé." });

    // 2️⃣ Création du user
    const user = new User({ email, password, role, username, avatar, isVerified: false });

    // Génération OTP pour email confirmation
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.emailConfirmationOtp = crypto.createHash("sha256").update(otp).digest("hex");
    user.emailConfirmationExpires = new Date(Date.now() + 30 * 60 * 1000); // 30 min
    await user.save();

    let profile = null;



    if (role === "vendeur") {
   


      profile = await Vendeur.create({
        _id: user._id,
        email,
        ...profileData
      });
    }

    // 4️⃣ Envoi de l'OTP par email
    //  await sendOtpEmail(user.email, otp);

    res.status(201).json({
      message: "Utilisateur créé. Vérifiez votre email pour confirmer le compte.",
      user: { id: user._id, email: user.email, role: user.role, profile },
    });

  } catch (err) {
    console.error("Erreur lors de l’inscription :", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

export const confirmUser = async (req: Request, res: Response) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ message: "Email et code requis." });

    const otpHash = crypto.createHash("sha256").update(otp).digest("hex");

    const user = await User.findOne({
      email,
      emailConfirmationOtp: otpHash,
      emailConfirmationExpires: { $gt: new Date() },
    });

    if (!user) return res.status(400).json({ message: "OTP invalide ou expiré." });
    if (user.isVerified) return res.status(200).json({ message: "Compte déjà confirmé." });

    user.isVerified = true;
    user.emailConfirmationOtp = undefined;
    user.emailConfirmationExpires = undefined;
    await user.save();

    const token = generateToken(user._id.toString(), user.role);

    res.status(200).json({
      message: "Compte confirmé avec succès.",
      user: { id: user._id, email: user.email, role: user.role },
      token,
    });
  } catch (err) {
    console.error("Erreur confirmation:", err);
    res.status(500).json({ message: "Erreur serveur." });
  }
};

export const updateUserData = async (req: Request, res: Response) => {
  try {


    await updateUser(req, res)
  } catch (err) {
    console.error("Erreur update user :", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};





export const requestPasswordReset = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email requis." });

    const user = await User.findOne({ email });
    if (!user) return res.status(200).json({ message: "Si cet email existe, un code a été envoyé." });

    // créer OTP à 6 chiffres
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // stocker hash OTP et expiration
    const otpHash = crypto.createHash("sha256").update(otp).digest("hex");
    user.passwordResetOtp = otpHash;
    user.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 min
    await user.save();

    await sendOtpEmail(user.email, otp)

    res.status(200).json({ message: "Si cet email existe, un code a été envoyé." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur." });
  }
};

// 2️⃣ Réinitialiser le mot de passe avec OTP
export const resetPasswordWithOtp = async (req: Request, res: Response) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
      return res.status(400).json({ message: "Email, OTP et nouveau mot de passe requis." });
    }

    const otpHash = crypto.createHash("sha256").update(otp).digest("hex");

    const user = await User.findOne({
      email,
      passwordResetOtp: otpHash,
      passwordResetExpires: { $gt: new Date() },
    }).select("+password");

    if (!user) return res.status(400).json({ message: "OTP invalide ou expiré." });

    // hasher nouveau mot de passe
    const salt = await bcrypt.genSalt(10);
    user.password = newPassword

    // supprimer OTP et expiration
    user.passwordResetOtp = undefined;
    user.passwordResetExpires = undefined;

    await user.save();

    res.status(200).json({ message: "Mot de passe réinitialisé avec succès." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur." });
  }
};



export const getUserProfile = async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Token manquant." });
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ message: "Token invalide." });
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ message: "User introuvable." });
    }

    // Récupération des infos selon le rôle
    let roleInfo: any = null;
    switch (user.role) {

      case 'vendeur':
        roleInfo = await Vendeur.findOne({ _id: user._id });
        break;

      default:
        roleInfo = null;
    }

  

    res.status(200).json({
      id: user._id,
      email: user.email,
      role: user.role,
      username: user.username,
      avatar: user.avatar,
      isPremium: user.isPremium,
      profile: roleInfo,

    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};


export const logout = async (_req: Request, res: Response) => {
  try {

    res.status(200).json({ message: "Déconnexion réussie (supprimez le token côté client)." });
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur", error: err });
  }
};


export const updateUser = async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;
    const { username, avatar, profileData } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur introuvable." });
    }

    if (username !== undefined) user.username = username;
    if (avatar !== undefined) user.avatar = avatar;

    await user.save();

    let vendeurProfile = null;

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

    res.status(200).json({
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
        profile: vendeurProfile,
      },
    });
  } catch (err) {
    console.error("Erreur update vendeur :", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};





