// controllers/vendeurController.ts
import { Request, Response } from "express";
import { vendeurService } from "../services/vendeurService";

// ============================
// GET ALL VENDEURS
// ============================
export const getVendeurs = async (_req: Request, res: Response) => {
  try {
    const result = await vendeurService.getAllVendeurs();
    res.status(200).json(result);
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: "Erreur lors de la récupération des vendeurs" });
  }
};

// ============================
// GET VENDEUR BY ID
// ============================
export const getVendeurById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await vendeurService.getVendeurById(id);

    if (!result) {
      return res.status(404).json({ message: "Utilisateur introuvable." });
    }

    res.status(200).json(result);
  } catch (err) {
    console.error("Erreur récupération vendeur :", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// ============================
// UPDATE VENDEUR
// ============================
export const updateVendeur = async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;
    const { username, avatar, profileData } = req.body;

    const result = await vendeurService.updateVendeur(userId, {
      username,
      avatar,
      profileData,
    });

    if (!result) {
      return res.status(404).json({ message: "Utilisateur introuvable." });
    }

    res.status(200).json({
      message: "Informations mises à jour avec succès.",
      data: result,
    });
  } catch (err) {
    console.error("Erreur update vendeur :", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// ============================
// DELETE VENDEUR
// ============================

export const deleteVendeur = async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;
    const user = await vendeurService.deleteVendeur(userId);

    if (!user) {
      return res.status(404).json({ message: "Utilisateur introuvable" });
    }

    res.status(200).json({ message: "Vendeur supprimé avec succès" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};