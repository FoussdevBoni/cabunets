import { jwtSecret } from "../../utils/authSecrets";
// controllers/metier/authController.ts
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { authService } from "../../services/metier/authService";


// ================= TOKEN =================
export const generateToken = (userId: string, role: string) => {
  return jwt.sign(
    { id: userId, role },
    jwtSecret(),
    { expiresIn: "7d" }
  );
};

// ================= LOGIN =================
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const result = await authService.login(email, password);

    const token = generateToken(result.id, result.role);

    return res.status(200).json({
      message: "Connexion réussie",
      user: { id: result.id, email: result.email, role: result.role },
      token,
    });
  } catch (err: any) {
    return res
      .status(err.statusCode ?? 500)
      .json({ message: err.message ?? "Erreur serveur" });
  }
};

// ================= REGISTER =================
export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, role, username, avatar, profileData, referralCode, telephone, becomeAffiliate } =
      req.body;

    const result = await authService.register({
      telephone,
      becomeAffiliate: becomeAffiliate === true,
      referralCode,
      email,
      password,
      role,
      username,
      avatar,
      profileData,
    });

    const token = generateToken(result.user.id, result.user.role);

    return res.status(201).json({
      message:
        "Utilisateur créé. Vérifiez votre email pour confirmer le compte.",
      user: {
        id: result.user.id,
        email: result.user.email,
        role: result.user.role,
        profile: result.profile,
      },
      token,
    });
  } catch (err: any) {
    return res
      .status(err.statusCode ?? 500)
      .json({ message: err.message ?? "Erreur serveur" });
  }
};

// ================= CONFIRM USER =================
export const confirmUser = async (req: Request, res: Response) => {
  try {
    const { email, otp } = req.body;

    const result = await authService.confirmUser(email, otp);

    const token = generateToken(result.user.id, result.user.role);

    return res.status(200).json({
      message: result.alreadyVerified
        ? "Compte déjà confirmé."
        : "Compte confirmé avec succès.",
      user: {
        id: result.user.id,
        email: result.user.email,
        role: result.user.role,
      },
      token,
    });
  } catch (err: any) {
    return res
      .status(err.statusCode ?? 500)
      .json({ message: err.message ?? "Erreur serveur" });
  }
};

// ================= PASSWORD RESET =================
export const requestPasswordReset = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    await authService.requestPasswordReset(email);

    return res
      .status(200)
      .json({ message: "Si cet email existe, un code a été envoyé." });
  } catch (err: any) {
    return res
      .status(err.statusCode ?? 500)
      .json({ message: err.message ?? "Erreur serveur" });
  }
};

export const resetPasswordWithOtp = async (req: Request, res: Response) => {
  try {
    const { email, otp, newPassword } = req.body;

    await authService.resetPasswordWithOtp(email, otp, newPassword);

    return res
      .status(200)
      .json({ message: "Mot de passe réinitialisé avec succès." });
  } catch (err: any) {
    return res
      .status(err.statusCode ?? 500)
      .json({ message: err.message ?? "Erreur serveur" });
  }
};

// ================= GET PROFILE =================
export const getUserProfile = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Veuillez vous connecter." });
    }

    const result = await authService.getUserProfile(req.user.userId);

    return res.status(200).json({
      ...result,
      impersonatedBy: req.user?.impersonatedBy ?? null,
    });
  } catch (err: any) {
    return res
      .status(err.statusCode ?? 500)
      .json({ message: err.message ?? "Erreur serveur" });
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

// ================= UPDATE USER =================
export const updateUser = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Veuillez vous connecter." });
    }

    const { username, avatar, profileData } = req.body;

    const result = await authService.updateUser(req.user.userId, {
      username,
      avatar,
      profileData,
    });

    return res.status(200).json({
      message: "Informations mises à jour avec succès.",
      data: result,
    });
  } catch (err: any) {
    return res
      .status(err.statusCode ?? 500)
      .json({ message: err.message ?? "Erreur serveur" });
  }
};