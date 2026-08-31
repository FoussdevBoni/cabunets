// controllers/reclamationController.ts
import { Request, Response } from 'express';
import { reclamationService } from '../services/reclamationService';

export const createReclamation = async (req: Request, res: Response): Promise<Response> => {
  try {
    const {
      clientId,
      reference,
      objet,
      description,
      statut,
      attachements,
    } = req.body;

    if (!clientId) {
      return res.status(400).json({ error: 'Le clientId est obligatoire' });
    }

    if (!objet) {
      return res.status(400).json({ error: 'L\'objet est obligatoire' });
    }

    const reclamation = await reclamationService.createReclamation({
      clientId,
      reference,
      objet,
      description,
      statut: statut || 'brouillon',
      attachements,
    });

    return res.status(201).json({
      success: true,
      message: 'Réclamation créée avec succès',
      reclamation,
    });

  } catch (err: any) {
    console.error('❌ Erreur createReclamation:', err.message || err);
    return res.status(500).json({
      error: 'Erreur lors de la création de la réclamation',
      details: err.message || err,
    });
  }
};

export const getReclamations = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { day, week, month, year, statut, clientId, ...filters } = req.query;
    let query: any = { ...filters };

    if (clientId) {
      query.clientId = clientId;
    }

    if (statut) {
      query.statut = statut;
    }

    if (day || week || month || year) {
      const now = new Date();
      let start: Date | null = null;
      let end: Date | null = null;

      if (day) {
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
      } else if (week) {
        const dayOfWeek = now.getDay();
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

    const reclamations = await reclamationService.getReclamations(query);
    return res.json(reclamations);
  } catch (err: any) {
    console.error('❌ Erreur getReclamations:', err.message || err);
    return res.status(500).json({ error: 'Erreur lors de la récupération des réclamations' });
  }
};

export const getReclamationById = async (req: Request, res: Response): Promise<Response> => {
  try {
    const reclamation = await reclamationService.getReclamationById(req.params.id);
    if (!reclamation) {
      return res.status(404).json({ error: 'Réclamation non trouvée' });
    }
    return res.json(reclamation);
  } catch (err: any) {
    console.error('❌ Erreur getReclamationById:', err.message || err);
    return res.status(500).json({ error: 'Erreur lors de la récupération de la réclamation' });
  }
};

export const updateReclamation = async (req: Request, res: Response): Promise<Response> => {
  try {
    const reclamation = await reclamationService.updateReclamation(req.params.id, req.body);
    if (!reclamation) {
      return res.status(404).json({ error: 'Réclamation non trouvée' });
    }
    return res.json(reclamation);
  } catch (err: any) {
    console.error('❌ Erreur updateReclamation:', err.message || err);
    return res.status(500).json({ error: 'Erreur lors de la mise à jour de la réclamation' });
  }
};

export const deleteReclamation = async (req: Request, res: Response): Promise<Response> => {
  try {
    const reclamation = await reclamationService.deleteReclamation(req.params.id);
    if (!reclamation) {
      return res.status(404).json({ error: 'Réclamation non trouvée' });
    }
    return res.json({ message: 'Réclamation supprimée avec succès' });
  } catch (err: any) {
    console.error('❌ Erreur deleteReclamation:', err.message || err);
    return res.status(500).json({ error: 'Erreur lors de la suppression de la réclamation' });
  }
};

export const deleteManyReclamations = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: 'Liste d\'IDs invalide' });
    }
    const result = await reclamationService.deleteManyReclamations(ids);
    return res.status(200).json({
      message: `${result.deletedCount} réclamations supprimées`,
      deletedCount: result.deletedCount
    });
  } catch (err: any) {
    console.error('❌ Erreur deleteManyReclamations:', err.message || err);
    return res.status(500).json({ error: 'Erreur lors de la suppression multiple' });
  }
};

export const updateReclamationStatut = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { statut } = req.body;
    const validStatuts = ['brouillon', 'soumise', 'en_cours', 'resolue', 'rejetee'];
    
    if (!statut || !validStatuts.includes(statut)) {
      return res.status(400).json({ 
        error: 'Statut invalide. Les statuts valides sont: brouillon, soumise, en_cours, resolue, rejetee' 
      });
    }

    const reclamation = await reclamationService.updateStatut(req.params.id, statut);
    if (!reclamation) {
      return res.status(404).json({ error: 'Réclamation non trouvée' });
    }
    return res.status(200).json({
      success: true,
      message: 'Statut mis à jour avec succès',
      reclamation
    });
  } catch (err: any) {
    console.error('❌ Erreur updateReclamationStatut:', err.message || err);
    return res.status(500).json({ error: 'Erreur lors de la mise à jour du statut' });
  }
};

export const getTodayReclamations = async (req: Request, res: Response): Promise<Response> => {
  try {
    const reclamations = await reclamationService.getTodayReclamations();
    return res.json(reclamations);
  } catch (err: any) {
    console.error('❌ Erreur getTodayReclamations:', err.message || err);
    return res.status(500).json({ error: 'Erreur lors de la récupération des réclamations du jour' });
  }
};

export const getReclamationsStats = async (req: Request, res: Response): Promise<Response> => {
  try {
    const stats = await reclamationService.getStats();
    return res.json(stats);
  } catch (err: any) {
    console.error('❌ Erreur getReclamationsStats:', err.message || err);
    return res.status(500).json({ error: 'Erreur lors de la récupération des statistiques' });
  }
};