// services/reclamationService.ts
import Reclamation, { IReclamation } from "../models/Reclamation";

export const reclamationService = {
  async getReclamations(query: any): Promise<IReclamation[]> {
    return await Reclamation.find(query).sort({ createdAt: -1 });
  },

  async getAllReclamations(): Promise<IReclamation[]> {
    return await Reclamation.find().sort({ createdAt: -1 });
  },

  async getReclamationById(id: string): Promise<IReclamation | null> {
    return await Reclamation.findById(id);
  },

  async createReclamation(data: Partial<IReclamation>): Promise<IReclamation> {
    const reclamation = new Reclamation(data);
    return await reclamation.save();
  },

  async updateReclamation(id: string, data: Partial<IReclamation>): Promise<IReclamation | null> {
    return await Reclamation.findByIdAndUpdate(
      id,
      { ...data, updatedAt: new Date() },
      { new: true }
    );
  },

  async deleteReclamation(id: string): Promise<IReclamation | null> {
    return await Reclamation.findByIdAndDelete(id);
  },

  async deleteManyReclamations(ids: string[]): Promise<any> {
    return await Reclamation.deleteMany({ _id: { $in: ids } });
  },

  async getReclamationsByClient(clientId: string): Promise<IReclamation[]> {
    return await Reclamation.find({ clientId }).sort({ createdAt: -1 });
  },

  async getReclamationsByStatut(statut: string): Promise<IReclamation[]> {
    return await Reclamation.find({ statut }).sort({ createdAt: -1 });
  },

  async getReclamationsByDateRange(startDate: Date, endDate: Date): Promise<IReclamation[]> {
    return await Reclamation.find({
      createdAt: {
        $gte: startDate,
        $lte: endDate,
      },
    }).sort({ createdAt: -1 });
  },

  async getTodayReclamations(): Promise<IReclamation[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return await Reclamation.find({
      createdAt: {
        $gte: today,
        $lt: tomorrow,
      },
    }).sort({ createdAt: -1 });
  },

  async getStats(): Promise<any> {
    const stats = await Reclamation.aggregate([
      {
        $group: {
          _id: "$statut",
          count: { $sum: 1 },
        },
      },
    ]);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayReclamations = await Reclamation.find({
      createdAt: {
        $gte: today,
        $lt: tomorrow,
      },
    });

    return {
      stats,
      todayCount: todayReclamations.length,
    };
  },

  async updateStatut(id: string, statut: string): Promise<IReclamation | null> {
    return await Reclamation.findByIdAndUpdate(
      id,
      { statut, updatedAt: new Date() },
      { new: true }
    );
  },
};