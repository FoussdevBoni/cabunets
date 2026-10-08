// controllers/userController.ts
import { Request, Response } from "express";
import { userService, UserFilters } from "../services/userService";
import { register } from "./authController";

// ============================================================
// HELPERS
// ============================================================

function parseFilters(req: Request): UserFilters {
  const {
    role, isActive, isVerified, search,
    day, week, month, year, startDate, endDate,
  } = req.query;

  return {
    role: role as UserFilters["role"],
    isActive:
      isActive === "true" ? true : isActive === "false" ? false : undefined,
    isVerified:
      isVerified === "true" ? true : isVerified === "false" ? false : undefined,
    search: search as string,
    day: day === "true" || day === "1",
    week: week === "true" || week === "1",
    month: month === "true" || month === "1",
    year: year === "true" || year === "1",
    startDate: startDate as string,
    endDate: endDate as string,
  };
}

// ============================================================
// CREATE (délégué à register)
// ============================================================
export const createUser = async (req: Request, res: Response) => {
  try {
    const user = await register(req, res);
    res.status(201).json(user);
  } catch (err) {
    res.status(500).json({ error: "Erreur lors de la création du user", details: err });
  }
};

// ============================================================
// LIST (pagination + filtres)
// ============================================================
export const getUsers = async (req: Request, res: Response): Promise<Response> => {
  try {
    const filters = parseFilters(req);
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 50;

    const result = await userService.getUsers({ ...filters, page, limit });
    return res.json(result);
  } catch (err) {
    console.error("getUsers error:", err);
    return res.status(500).json({ error: "Erreur lors de la récupération des users" });
  }
};

// ============================================================
// STATS
// ============================================================
export const getUsersStats = async (req: Request, res: Response): Promise<Response> => {
  try {
    const filters = parseFilters(req);
    const stats = await userService.getUserStats(filters);
    return res.json(stats);
  } catch (err) {
    console.error("getUsersStats error:", err);
    return res.status(500).json({ error: "Erreur lors du calcul des statistiques" });
  }
};

// ============================================================
// GET ONE
// ============================================================
export const getUserById = async (req: Request, res: Response): Promise<Response> => {
  try {
    const user = await userService.getUserById(req.params.id);
    return res.status(200).json(user);
  } catch (err: any) {
    if (err.statusCode === 404) return res.status(404).json({ message: err.message });
    console.error(err);
    return res.status(500).json({ message: "Erreur serveur" });
  }
};

// ============================================================
// UPDATE
// ============================================================
export const updateUser = async (req: Request, res: Response): Promise<Response> => {
  try {
    const result = await userService.updateUser(req.params.id, req.body);
    return res.status(200).json({
      message: "Informations mises à jour avec succès.",
      ...result,
    });
  } catch (err: any) {
    if (err.statusCode === 404) return res.status(404).json({ message: err.message });
    console.error("Erreur update user :", err);
    return res.status(500).json({ message: "Erreur serveur" });
  }
};

// ============================================================
// DELETE
// ============================================================
export const deleteUser = async (req: Request, res: Response): Promise<Response> => {
  try {
    await userService.deleteUser(req.params.id);
    return res.json({ message: "User supprimé avec succès" });
  } catch (err: any) {
    if (err.statusCode === 404) return res.status(404).json({ error: err.message });
    return res.status(500).json({ error: "Erreur lors de la suppression du user" });
  }
};

// ============================================================
// GET PROFILE (impersonation-safe)
// ============================================================
export const getProfile = async (req: Request, res: Response): Promise<Response> => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Veuillez vous connecter." });
    }

    const result = await userService.getProfile(req.user.userId);
    return res.status(200).json(result);
  } catch (err: any) {
    if (err.statusCode === 404) return res.status(404).json({ message: err.message });
    console.error(err);
    return res.status(500).json({ message: "Erreur serveur", error: err });
  }
};

// ============================================================
// VERIFY USER
// ============================================================
export const verifyUser = async (req: Request, res: Response): Promise<Response> => {
  try {
    const user = await userService.verifyUser(req.params.id);
    return res.status(200).json({
      message: "Utilisateur vérifié avec succès.",
      user,
    });
  } catch (err: any) {
    if (err.statusCode === 404) return res.status(404).json({ message: err.message });
    if (err.statusCode === 400) return res.status(400).json({ message: err.message });
    console.error("Erreur lors de la vérification de l'utilisateur :", err);
    return res.status(500).json({
      message: "Erreur serveur lors de la vérification de l'utilisateur",
      error: err,
    });
  }
};

// ============================================================
// TOGGLE USER STATUS
// ============================================================
export const toggleUserStatus = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { isActive } = req.body;
    const currentUserId = req.user?.userId;

    const result = await userService.toggleUserStatus(
      req.params.id,
      isActive,
      currentUserId
    );

    return res.status(200).json({
      message: `Compte utilisateur ${result.statusText} avec succès.`,
      user: result.user,
    });
  } catch (err: any) {
    if (err.statusCode === 404) return res.status(404).json({ message: err.message });
    if (err.statusCode === 400) return res.status(400).json({ message: err.message });
    console.error("Erreur lors de l'activation/désactivation du compte :", err);
    return res.status(500).json({
      message: "Erreur serveur lors de l'activation/désactivation du compte",
      error: err,
    });
  }
};