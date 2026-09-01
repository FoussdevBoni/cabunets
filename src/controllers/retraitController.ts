// controllers/retraitController.ts
import { Request, Response } from 'express';
import { retraitService } from '../services/retraitService';

export const createRetrait = async (req: Request, res: Response): Promise<Response> => {
  try {
    const {
      vendeurId,
      amount,
      netAmount,
      methodPayment,
    } = req.body;

    if (!vendeurId) {
      return res.status(400).json({ error: 'Le vendeurId est obligatoire' });
    }

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Le montant est obligatoire et doit être supérieur à 0' });
    }

   

    if (!methodPayment || !methodPayment.type || !methodPayment.number || !methodPayment.intitule) {
      return res.status(400).json({ error: 'Les informations de paiement sont obligatoires' });
    }

    const retrait = await retraitService.createRetrait({
      vendeurId,
      vendeur: vendeurId ,
      amount,
      methodPayment,
      status: 'PENDING',
    });

    return res.status(201).json({
      success: true,
      message: 'Demande de retrait créée avec succès',
      retrait,
    });

  } catch (err: any) {
    console.error('❌ Erreur createRetrait:', err.message || err);
    return res.status(500).json({
      error: err.message ||  'Erreur lors de la création de la demande de retrait',
    });
  }
};

export const getRetraits = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { day, week, month, year, status, vendeurId, ...filters } = req.query;
    let query: any = { ...filters };

    if (vendeurId) {
      query.vendeurId = vendeurId;
    }

    if (status) {
      query.status = status.toString().toUpperCase();
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

    const retraits = await retraitService.getRetraits(query);
    return res.json(retraits);
  } catch (err: any) {
    console.error('❌ Erreur getRetraits:', err.message || err);
    return res.status(500).json({ error: 'Erreur lors de la récupération des retraits' });
  }
};

export const getRetraitById = async (req: Request, res: Response): Promise<Response> => {
  try {
    const retrait = await retraitService.getRetraitById(req.params.id);
    if (!retrait) {
      return res.status(404).json({ error: 'Retrait non trouvé' });
    }
    return res.json(retrait);
  } catch (err: any) {
    console.error('❌ Erreur getRetraitById:', err.message || err);
    return res.status(500).json({ error: 'Erreur lors de la récupération du retrait' });
  }
};

export const updateRetrait = async (req: Request, res: Response): Promise<Response> => {
  try {
    const retrait = await retraitService.updateRetrait(req.params.id,  {
        ...req.body,
        vendeur: req.body.vendeurId
    });
    if (!retrait) {
      return res.status(404).json({ error: 'Retrait non trouvé' });
    }
    return res.json(retrait);
  } catch (err: any) {
    console.error('❌ Erreur updateRetrait:', err.message || err);
    return res.status(500).json({ error: 'Erreur lors de la mise à jour du retrait' });
  }
};

export const deleteRetrait = async (req: Request, res: Response): Promise<Response> => {
  try {
    const retrait = await retraitService.deleteRetrait(req.params.id);
    if (!retrait) {
      return res.status(404).json({ error: 'Retrait non trouvé' });
    }
    return res.json({ message: 'Retrait supprimé avec succès' });
  } catch (err: any) {
    console.error('❌ Erreur deleteRetrait:', err.message || err);
    return res.status(500).json({ error: 'Erreur lors de la suppression du retrait' });
  }
};

export const deleteManyRetraits = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: 'Liste d\'IDs invalide' });
    }
    const result = await retraitService.deleteManyRetraits(ids);
    return res.status(200).json({
      message: `${result.deletedCount} retraits supprimés`,
      deletedCount: result.deletedCount
    });
  } catch (err: any) {
    console.error('❌ Erreur deleteManyRetraits:', err.message || err);
    return res.status(500).json({ error: 'Erreur lors de la suppression multiple' });
  }
};

export const validateRetrait = async (req: Request, res: Response): Promise<Response> => {
  try {
    const retrait = await retraitService.validateRetrait(req.params.id);
    if (!retrait) {
      return res.status(404).json({ error: 'Retrait non trouvé' });
    }
    return res.status(200).json({
      success: true,
      message: 'Retrait validé avec succès',
      retrait
    });
  } catch (err: any) {
    console.error('❌ Erreur validateRetrait:', err.message || err);
    return res.status(500).json({ error: 'Erreur lors de la validation du retrait' });
  }
};

export const rejectRetrait = async (req: Request, res: Response): Promise<Response> => {

  console.log(req.body)
  try {
    const { reason } = req.body;
    if (!reason) {
      return res.status(400).json({ error: 'Motif de rejet requis' });
    }
    const retrait = await retraitService.rejectRetrait(req.params.id, reason);
    if (!retrait) {
      return res.status(404).json({ error: 'Retrait non trouvé' });
    }
    return res.status(200).json({
      success: true,
      message: 'Retrait rejeté avec succès',
      retrait
    });
  } catch (err: any) {
    console.error('❌ Erreur rejectRetrait:', err.message || err);
    return res.status(500).json({ error: 'Erreur lors du rejet du retrait' });
  }
};

export const getTodayRetraits = async (req: Request, res: Response): Promise<Response> => {
  try {
    const retraits = await retraitService.getTodayRetraits();
    return res.json(retraits);
  } catch (err: any) {
    console.error('❌ Erreur getTodayRetraits:', err.message || err);
    return res.status(500).json({ error: 'Erreur lors de la récupération des retraits du jour' });
  }
};

export const getRetraitsStats = async (req: Request, res: Response): Promise<Response> => {
  try {
    const stats = await retraitService.getStats();
    return res.json(stats);
  } catch (err: any) {
    console.error('❌ Erreur getRetraitsStats:', err.message || err);
    return res.status(500).json({ error: 'Erreur lors de la récupération des statistiques' });
  }
};