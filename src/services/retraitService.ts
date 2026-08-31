// services/retraitService.ts
import Retrait, { IRetrait } from "../models/Retrait";
import { WalletService } from "./walletService";

const walletService = new WalletService();

export const retraitService = {
  async getRetraits(query: any): Promise<IRetrait[]> {
    return await Retrait.find(query).populate('vendeur').sort({ createdAt: -1 });
  },

  async getAllRetraits(): Promise<IRetrait[]> {
    return await Retrait.find().populate('vendeur').sort({ createdAt: -1 });
  },

  async getRetraitById(id: string): Promise<IRetrait | null> {
    return await Retrait.findById(id).populate('vendeur');
  },

  async createRetrait(data: Partial<IRetrait>): Promise<IRetrait> {
    if (!data.vendeurId) {
      throw new Error("L'identifiant du vendeur est requis");
    }

    if (!data.amount || data.amount <= 0) {
      throw new Error("Le montant doit être supérieur à 0");
    }

    const walletInfo = await walletService.getWalletDisponible(data.vendeurId.toString());
    
    // ✅ Correction : utiliser totalInDisplay.wallet
    if (walletInfo.totalInDisplay.wallet < data.amount) {
      throw new Error(
        `Solde insuffisant. Disponible: ${walletInfo.totalInDisplay.wallet} ${walletInfo.totalInDisplay.currency}, Demandé: ${data.amount}`
      );
    }

    const retrait = new Retrait(data);
    return await retrait.save();
  },

  async updateRetrait(id: string, data: Partial<IRetrait>): Promise<IRetrait | null> {
    const existingRetrait = await Retrait.findById(id);
    
    if (!existingRetrait) {
      throw new Error("Retrait non trouvé");
    }

    if (data.amount !== undefined && data.amount !== existingRetrait.amount) {
      if (data.amount <= 0) {
        throw new Error("Le montant doit être supérieur à 0");
      }

      const walletInfo = await walletService.getWalletDisponible(
        existingRetrait.vendeurId.toString()
      );

      // ✅ Correction : utiliser totalInDisplay.wallet
      if (walletInfo.totalInDisplay.wallet < data.amount) {
        throw new Error(
          `Solde insuffisant. Disponible: ${walletInfo.totalInDisplay.wallet} ${walletInfo.totalInDisplay.currency}, Nouveau montant: ${data.amount}`
        );
      }
    }

    if (data.status === "COMPLETED") {
      if (existingRetrait.status !== "PENDING") {
        throw new Error(`Le retrait est déjà ${existingRetrait.status}`);
      }

      const montantAVerifier = data.amount || existingRetrait.amount;
      const walletInfo = await walletService.getWalletDisponible(
        existingRetrait.vendeurId.toString()
      );

      // ✅ Correction : utiliser totalInDisplay.wallet
      if (walletInfo.totalInDisplay.wallet < montantAVerifier) {
        throw new Error(
          `Solde insuffisant pour valider ce retrait. Disponible: ${walletInfo.totalInDisplay.wallet} ${walletInfo.totalInDisplay.currency}, Demandé: ${montantAVerifier}`
        );
      }
    }

    return await Retrait.findByIdAndUpdate(
      id,
      { ...data, updatedAt: new Date() },
      { new: true }
    ).populate('vendeur');
  },

  async deleteRetrait(id: string): Promise<IRetrait | null> {
    return await Retrait.findByIdAndDelete(id);
  },

  async deleteManyRetraits(ids: string[]): Promise<any> {
    return await Retrait.deleteMany({ _id: { $in: ids } });
  },

  async getRetraitsByVendeur(vendeurId: string): Promise<IRetrait[]> {
    return await Retrait.find({ vendeurId }).populate('vendeur').sort({ createdAt: -1 });
  },

  async getRetraitsByStatus(status: string): Promise<IRetrait[]> {
    return await Retrait.find({ status }).populate('vendeur').sort({ createdAt: -1 });
  },

  async getRetraitsByDateRange(startDate: Date, endDate: Date): Promise<IRetrait[]> {
    return await Retrait.find({
      createdAt: {
        $gte: startDate,
        $lte: endDate,
      },
    }).populate('vendeur').sort({ createdAt: -1 });
  },

  async getTodayRetraits(): Promise<IRetrait[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return await Retrait.find({
      createdAt: {
        $gte: today,
        $lt: tomorrow,
      },
    }).populate('vendeur').sort({ createdAt: -1 });
  },

  async getStats(): Promise<any> {
    const stats = await Retrait.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          totalAmount: { $sum: "$amount" },
        },
      },
    ]);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayRetraits = await Retrait.find({
      createdAt: {
        $gte: today,
        $lt: tomorrow,
      },
    }).populate('vendeur');

    const todayTotal = todayRetraits
      .filter((r) => r.status === "COMPLETED")
      .reduce((sum, r) => sum + r.amount, 0);

    return {
      stats,
      todayCount: todayRetraits.length,
      todayTotal,
    };
  },

  async validateRetrait(id: string): Promise<IRetrait | null> {
    const retrait = await Retrait.findById(id);
    
    if (!retrait) {
      throw new Error("Retrait non trouvé");
    }

    if (retrait.status !== "PENDING") {
      throw new Error(`Le retrait est déjà ${retrait.status}`);
    }

    const walletInfo = await walletService.getWalletDisponible(
      retrait.vendeurId.toString()
    );

    // ✅ Correction : utiliser totalInDisplay.wallet
    if (walletInfo.totalInDisplay.wallet < retrait.amount) {
      throw new Error(
        `Solde insuffisant pour valider ce retrait. Disponible: ${walletInfo.totalInDisplay.wallet} ${walletInfo.totalInDisplay.currency}, Demandé: ${retrait.amount}`
      );
    }

    return await Retrait.findByIdAndUpdate(
      id,
      { status: "COMPLETED", updatedAt: new Date() },
      { new: true }
    ).populate('vendeur');
  },

  async rejectRetrait(id: string, reason: string): Promise<IRetrait | null> {
    return await Retrait.findByIdAndUpdate(
      id,
      { status: "REJECTED", rejectReason: reason, updatedAt: new Date() },
      { new: true }
    ).populate('vendeur');
  },
};