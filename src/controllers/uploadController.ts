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

// Nouvelle fonction pour upload multiple avec progression
export const uploadMultipleFiles = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ message: "Non authentifié" });

    const { bucket, path } = req.body;
    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
      return res.status(400).json({ message: "Aucun fichier fourni" });
    }

    // Utiliser Server-Sent Events (SSE) pour la progression
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const urls: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      try {
        const url = await uploadService.upload({
          bucket: bucket || "uploads",
          path: path || `users/${user.userId}`,
          file
        });
        
        urls.push(url);
        
        // Envoyer la progression
        res.write(`data: ${JSON.stringify({
          type: 'progress',
          current: i + 1,
          total: files.length,
          file: file.originalname,
          status: 'success',
          url
        })}\n\n`);
        
      } catch (error: any) {
        // Envoyer l'erreur
        res.write(`data: ${JSON.stringify({
          type: 'error',
          current: i + 1,
          total: files.length,
          file: file.originalname,
          error: error.message
        })}\n\n`);
      }
    }

    // Envoyer la réponse finale
    res.write(`data: ${JSON.stringify({
      type: 'complete',
      urls,
      total: files.length,
      success: urls.length
    })}\n\n`);
    
    res.end();

  } catch (error: any) {
    console.error("Erreur upload multiple:", error);
    res.status(500).json({ message: error.message || "Erreur lors de l'upload" });
  }
};

// Version simplifiée sans SSE (retourne juste les URLs)
export const uploadMultipleFilesSimple = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ message: "Non authentifié" });

    const { bucket, path } = req.body;
    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
      return res.status(400).json({ message: "Aucun fichier fourni" });
    }

    const urls: string[] = [];

    for (const file of files) {
      const url = await uploadService.upload({
        bucket: bucket || "uploads",
        path: path || `users/${user.userId}`,
        file
      });
      urls.push(url);
    }

    res.status(200).json({ 
      urls, 
      message: `${urls.length} fichier(s) uploadé(s) avec succès` 
    });
  } catch (error: any) {
    console.error("Erreur upload multiple:", error);
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