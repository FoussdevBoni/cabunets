// controllers/uploadController.ts
import { Request, Response } from 'express';
import { uploadService } from '../services/uploadService';

export const uploadFile = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ message: "Non authentifié" });

    const { bucket, path } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: "Aucun fichier fourni" });
    }

    const url = await uploadService.upload({
      bucket: bucket || "uploads",
      path: path || `users/${user.userId}`,
      file
    });

    res.status(200).json({ url, message: "Fichier uploadé avec succès" });
  } catch (error: any) {
    console.error("Erreur upload:", error);
    res.status(500).json({ message: error.message || "Erreur lors de l'upload" });
  }
};

export const deleteFile = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ message: "Non authentifié" });

    const { bucket, path } = req.body;

    if (!bucket || !path) {
      return res.status(400).json({ message: "Bucket et path requis" });
    }

    await uploadService.delete(bucket, path);
    res.status(200).json({ message: "Fichier supprimé avec succès" });
  } catch (error: any) {
    console.error("Erreur suppression:", error);
    res.status(500).json({ message: error.message || "Erreur lors de la suppression" });
  }
};