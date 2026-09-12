// services/retraitService.ts
import Retrait, { IRetrait } from "../models/Retrait";
import { cabupayPayoutService } from "./cabupayPayoutService";
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
  async getByPayoutId(payoutId: string): Promise<IRetrait | null> {
    return await Retrait.findOne({ payoutId }).populate('vendeur');
  },


  async createRetrait(data: Partial<IRetrait>): Promise<{
    success: boolean;
    data: {
      retrait: IRetrait;
      status: string;
      pawapayData: any;
    };
  }> {
    if (!data.vendeurId) {
      throw new Error("L'identifiant du vendeur est requis");
    }

    if (!data.amount || data.amount <= 0) {
      throw new Error("Le montant doit être supérieur à 0");
    }

    const walletInfo = await walletService.getWalletDisponible(data.vendeurId.toString());

    if (walletInfo.totalInDisplay.wallet < data.amount) {
      throw new Error(
        `Solde insuffisant. Disponible: ${walletInfo.totalInDisplay.wallet} ${walletInfo.totalInDisplay.currency}, Demandé: ${data.amount}`
      );
    }

    const retrait = new Retrait(data);
    await retrait.save();

    const { amount, methodPayment, correspondent, currency } = data;
    const payoutResult = await cabupayPayoutService.initiatePayout({
      amount: amount!.toString(),
      currency: currency || "CDF",
      phone: methodPayment?.number || "",
      correspondent: correspondent || "",
      clientReference: retrait._id.toString(),
    });

    // Statuts possibles lors de l'initialisation d'un payout : ACCEPTED | REJECTED | DUPLICATE_IGNORED
    const status = payoutResult.data.pawaResponse?.status || payoutResult.data.status;

    if (payoutResult.data.payoutId) {
      retrait.payoutId = payoutResult.data.payoutId;
    }

    if (status === "REJECTED") {
      retrait.status = "REJECTED";
      retrait.rejectReason =
        payoutResult.data.pawaResponse?.failureReason?.failureMessage ||
        "Retrait rejeté";
    } else if (status === "DUPLICATE_IGNORED") {
      // Doublon ignoré, on garde PENDING (déjà en cours de traitement)
      retrait.status = "PENDING";
      retrait.rejectReason = "Doublon ignoré";
    } else if (status === "ACCEPTED") {
      // Accepté pour traitement, en attente du callback final
      retrait.status = "PENDING";
    }

    await retrait.save();

    return {
      success: status === "ACCEPTED",
      data: {
        retrait,
        status,
        pawapayData: payoutResult.data.pawaResponse,
      },
    };
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

      if (existingRetrait.vendeurId) {
        const walletInfo = await walletService.getWalletDisponible(
          existingRetrait.vendeurId.toString()
        );

        if (walletInfo.totalInDisplay.wallet < data.amount) {
          throw new Error(
            `Solde insuffisant. Disponible: ${walletInfo.totalInDisplay.wallet} ${walletInfo.totalInDisplay.currency}, Nouveau montant: ${data.amount}`
          );
        }
      }
    }

    if (data.status === "COMPLETED") {
      if (existingRetrait.status !== "PENDING") {
        throw new Error(`Le retrait est déjà ${existingRetrait.status}`);
      }

      if (existingRetrait.vendeurId) {
        const montantAVerifier = data.amount || existingRetrait.amount;
        const walletInfo = await walletService.getWalletDisponible(
          existingRetrait.vendeurId.toString()
        );

        if (walletInfo.totalInDisplay.wallet < montantAVerifier) {
          throw new Error(
            `Solde insuffisant pour valider ce retrait. Disponible: ${walletInfo.totalInDisplay.wallet} ${walletInfo.totalInDisplay.currency}, Demandé: ${montantAVerifier}`
          );
        }
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

    if (!retrait.payoutId) {
      throw new Error("Le retrait est invalide : aucun payoutId associé");
    }

    // Vérifier le statut réel chez PawaPay
    const directPayout = await cabupayPayoutService.getPayoutDirect(retrait.payoutId);

    // Vérifier d'abord si le payout existe chez PawaPay

    if (!directPayout.success) {
      throw new Error("Impossible de valider : ce retrait n'existe pas chez PawaPay");
    }

    // Ensuite vérifier le vrai statut de la transaction
    const pawaStatus = directPayout.data?.status?.toUpperCase();

    if (pawaStatus !== "COMPLETED") {
      throw new Error(
        `Impossible de valider : le retrait est en statut "${pawaStatus}" chez PawaPay (attendu: COMPLETED)`
      );
    }

    // Vérification du solde
    if (retrait.vendeurId) {
      const walletInfo = await walletService.getWalletDisponible(
        retrait.vendeurId.toString()
      );

      if (walletInfo.totalInDisplay.wallet < retrait.amount) {
        throw new Error(
          `Solde insuffisant pour valider ce retrait. Disponible: ${walletInfo.totalInDisplay.wallet} ${walletInfo.totalInDisplay.currency}, Demandé: ${retrait.amount}`
        );
      }
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

  async createRetraitCabunet(data: Partial<IRetrait>): Promise<{
    success: boolean;
    data: {
      retrait: IRetrait;
      status: string;
      pawapayData: any;
    };
  }> {
    if (!data.amount || data.amount <= 0) {
      throw new Error("Le montant doit être supérieur à 0");
    }

    const solde = await walletService.getCabunetWallet();

    if (solde.disponible < data.amount) {
      throw new Error(
        `Solde commission insuffisant. Disponible: ${solde.disponible} ${solde.currency}, Demandé: ${data.amount}`
      );
    }

    const retrait = new Retrait({
      ...data,
      type: "cabunet",
    });
    await retrait.save();

    const { amount, methodPayment, correspondent, currency } = data;
    const payoutResult = await cabupayPayoutService.initiatePayout({
      amount: amount!.toString(),
      currency: currency || "CDF",
      phone: methodPayment?.number || "",
      correspondent: correspondent || "",
      clientReference: retrait._id.toString()
    });

    const status = payoutResult.data.pawaResponse?.status || payoutResult.data.status;

    if (payoutResult.data.payoutId) {
      retrait.payoutId = payoutResult.data.payoutId;
    }

    if (status === "REJECTED") {
      retrait.status = "REJECTED";
      retrait.rejectReason =
        payoutResult.data.pawaResponse?.failureReason?.failureMessage ||
        "Retrait rejeté";
    } else if (status === "DUPLICATE_IGNORED") {
      retrait.status = "PENDING";
      retrait.rejectReason = "Doublon ignoré";
    } else if (status === "ACCEPTED") {
      retrait.status = "PENDING";
    }

    await retrait.save();

    return {
      success: status === "ACCEPTED",
      data: {
        retrait,
        status,
        pawapayData: payoutResult.data.pawaResponse,
      },
    };
  },

  async getRetraitsCabunet(): Promise<IRetrait[]> {
    return await Retrait.find({ type: "cabunet" }).sort({ createdAt: -1 });
  },

  async getTotalRetraitsCabunet(): Promise<number> {
    const result = await Retrait.aggregate([
      { $match: { type: "cabunet", status: "COMPLETED" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);
    return result[0]?.total || 0;
  },
};