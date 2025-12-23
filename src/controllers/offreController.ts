import { Request, Response } from 'express';
import {Offre} from '../models/Offre';

export const createOffre = async (req: Request, res: Response) => {
  try {
    const offre = await Offre.create(req.body);
    res.status(201).json({offre});
  } catch (err) {
    res.status(500).json({ error: 'Erreur lors de la création du offre', details: err });
  }
};

export const getOffres = async (req: Request, res: Response) => {
  try {
    const { day, week, month, year, ...filters } = req.query;

    let query: any = { ...filters }; // filtres dynamiques (status, customerId, etc.)

    // Gestion du filtre temporel
    if (day || week || month || year) {
      const now = new Date();
      let start: Date | null = null;
      let end: Date | null = null;

      if (day) {
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
      } else if (week) {
        const dayOfWeek = now.getDay(); // 0 = dimanche
        start = new Date(now);
        start.setDate(now.getDate() - dayOfWeek);
        start.setHours(0, 0, 0, 0);

        end = new Date(start);
        end.setDate(start.getDate() + 7);
      } else if (month) {
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      } else if (year) {
        start = new Date(now.getFullYear(), 0, 1);
        end = new Date(now.getFullYear() + 1, 0, 1);
      }

      if (start && end) {
        query.createdAt = { $gte: start, $lt: end };
      }
    }

    const offres = await Offre.find(query);


    res.json(offres);
  } catch (err) {
    res.status(500).json({ error: "Erreur lors de la récupération des offres" });
  }
};

export const getOffreById = async (req: Request, res: Response) => {
  try {
    const offre = await Offre.findById(req.params.id);
    if (!offre) return res.status(404).json({ error: 'Offre non trouvé' });
    res.json(offre);
  } catch (err) {
    res.status(500).json({ error: 'Erreur lors de la récupération du offre' });
  }
};

export const updateOffre = async (req: Request, res: Response) => {
  try {
    const offre = await Offre.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!offre) return res.status(404).json({ error: 'Offre non trouvé' });
    res.json(offre);
  } catch (err) {
    res.status(500).json({ error: 'Erreur lors de la mise à jour du offre' });
  }
};

export const deleteOffre = async (req: Request, res: Response) => {
  try {
    const offre = await Offre.findByIdAndDelete(req.params.id);
    if (!offre) return res.status(404).json({ error: 'Offre non trouvé' });
    res.json({ message: 'Offre supprimé avec succès' });
  } catch (err) {
    res.status(500).json({ error: 'Erreur lors de la suppression du offre' });
  }
};
