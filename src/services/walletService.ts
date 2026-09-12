// services/WalletService.ts
import mongoose from "mongoose";
import { Order } from "../models/Order";
import Retrait from "../models/Retrait";
import { Setting } from "../models/Setting";
import { CurrencyService } from "./currencyService";
import User from "../models/User";
import { Vendeur } from "../models/Vendeur";

export interface IWalletInfo {
  vendeurId: string;
  vendeur?: {
    id: string;
    username?: string;
    email?: string;
    avatar?: string;
    whatsappNumber?: string;
  };
  commissionRate: number;
  ordersCount: number;
  retraitsCount: number;

  // Détail par devise
  details: {
    currency: string;
    ca: number;
    commission: number;
    net: number;
  }[];

  // Résumé en devise de base
  totalInBase: {
    currency: string;
    ca: number;
    commission: number;
    net: number;
    retraits: number;
    wallet: number;
  };

  // Résumé en devise d'affichage par défaut
  totalInDisplay: {
    currency: string;
    ca: number;
    commission: number;
    net: number;
    retraits: number;
    wallet: number;
  };
}

export class WalletService {
  private currencyService: CurrencyService;

  constructor() {
    this.currencyService = new CurrencyService();
  }

  /**
   * Récupère le setting
   */
  async getSetting() {
    return await Setting.getDefault();
  }

  /**
   * Récupère le taux de commission
   */
  async getCommissionRate(): Promise<number> {
    const setting = await this.getSetting();
    return setting.commissionRate / 100;
  }

  /**
   * Récupère les informations d'un vendeur
   */
  async getVendeurInfos(vendeurId: string): Promise<any> {
    const [user, vendeur] = await Promise.all([
      User.findById(vendeurId).select("_id username email avatar role isVerified").lean(),
      Vendeur.findById(vendeurId).select("_id whatsappNumber advantage photoUrls paymentAmount availability openingTime closingTime isOnline networks").lean()
    ]);

    return {
      id: vendeurId,
      username: user?.username,
      email: user?.email,
      avatar: user?.avatar,
      whatsappNumber: vendeur?.whatsappNumber,
    };
  }

  /**
   * Calcule le chiffre d'affaires par devise
   */
  async getChiffreAffaireParDevise(vendeurId: string): Promise<{
    details: { currency: string; total: number; count: number }[];
    total: number;
    count: number;
  }> {
    const result = await Order.aggregate([
      {
        $match: {
          vendeurId: vendeurId,
          status: { $in: ["COMPLETED", "DELIVERED"] }
        }
      },
      {
        $group: {
          _id: "$currency",
          total: { $sum: "$price" },
          count: { $sum: 1 }
        }
      }
    ]);

    const details = result.map((group: any) => ({
      currency: group._id || "CDF",
      total: group.total,
      count: group.count
    }));

    const total = details.reduce((acc, d) => acc + d.total, 0);
    const count = details.reduce((acc, d) => acc + d.count, 0);

    return { details, total, count };
  }

  /**
   * Calcule le total des retraits
   */
  async getTotalRetraits(vendeurId: string): Promise<{
    total: number;
    count: number;
  }> {
    // ✅ Vérifier si l'ID est un ObjectId valide
    if (!mongoose.Types.ObjectId.isValid(vendeurId)) {
      return { total: 0, count: 0 };
    }

    const result = await Retrait.aggregate([
      {
        $match: {
          vendeurId: new mongoose.Types.ObjectId(vendeurId),
          status: "COMPLETED",

        }
      },
      {
        $group: {
          _id: null,
          totalRetraits: { $sum: "$amount" },
          count: { $sum: 1 }
        }
      }
    ]);

    return result.length > 0
      ? { total: result[0].totalRetraits, count: result[0].count }
      : { total: 0, count: 0 };
  }

  /**
   * Calcule le wallet disponible (multi-devises)
   */
  async getWalletDisponible(vendeurId: string): Promise<IWalletInfo> {
    const [setting, caInfo, retraitsInfo, vendeurInfos] = await Promise.all([
      this.getSetting(),
      this.getChiffreAffaireParDevise(vendeurId),
      this.getTotalRetraits(vendeurId),
      this.getVendeurInfos(vendeurId)
    ]);

    const commissionRate = setting.commissionRate / 100;
    const baseCurrency = setting.baseCurrency;
    const displayCurrency = setting.defaultDisplayCurrency;

    // 1. Calculer pour chaque devise
    const details = await Promise.all(
      caInfo.details.map(async (item) => {
        const ca = item.total;
        const commission = ca * commissionRate;
        const net = ca - commission;

        return {
          currency: item.currency,
          ca,
          commission,
          net
        };
      })
    );

    // 2. Total en devise de base
    let totalCaInBase = 0;
    let totalCommissionInBase = 0;
    let totalNetInBase = 0;

    for (const detail of details) {
      const caInBase = await this.currencyService.toBase(detail.ca, detail.currency);
      const commissionInBase = await this.currencyService.toBase(detail.commission, detail.currency);
      const netInBase = await this.currencyService.toBase(detail.net, detail.currency);

      totalCaInBase += caInBase;
      totalCommissionInBase += commissionInBase;
      totalNetInBase += netInBase;
    }

    // Retraits en base (supposés en devise d'affichage par défaut)
    const retraitsInBase = await this.currencyService.toBase(
      retraitsInfo.total,
      displayCurrency
    );

    const walletInBase = Math.max(totalNetInBase - retraitsInBase, 0);

    // 3. Convertir en devise d'affichage
    const totalCaInDisplay = await this.currencyService.fromBase(totalCaInBase, displayCurrency);
    const totalCommissionInDisplay = await this.currencyService.fromBase(totalCommissionInBase, displayCurrency);
    const totalNetInDisplay = await this.currencyService.fromBase(totalNetInBase, displayCurrency);
    const retraitsInDisplay = await this.currencyService.fromBase(retraitsInBase, displayCurrency);
    const walletInDisplay = await this.currencyService.fromBase(walletInBase, displayCurrency);

    return {
      vendeurId,
      vendeur: vendeurInfos,
      commissionRate: setting.commissionRate,
      ordersCount: caInfo.count,
      retraitsCount: retraitsInfo.count,
      details,
      totalInBase: {
        currency: baseCurrency,
        ca: Math.round(totalCaInBase * 100) / 100,
        commission: Math.round(totalCommissionInBase * 100) / 100,
        net: Math.round(totalNetInBase * 100) / 100,
        retraits: Math.round(retraitsInBase * 100) / 100,
        wallet: Math.round(walletInBase * 100) / 100
      },
      totalInDisplay: {
        currency: displayCurrency,
        ca: Math.round(totalCaInDisplay),
        commission: Math.round(totalCommissionInDisplay),
        net: Math.round(totalNetInDisplay),
        retraits: Math.round(retraitsInDisplay),
        wallet: Math.round(walletInDisplay)
      }
    };
  }

  /**
   * Vérifie si un vendeur peut retirer un montant
   */
  async peutRetirer(
    vendeurId: string,
    montantDemande: number,
    currency: string = "CDF"
  ): Promise<{
    peut: boolean;
    walletDisponible: number;
    walletCurrency: string;
    message?: string;
    minAmount?: number;
    maxAmount?: number;
  }> {
    const [walletInfo, setting] = await Promise.all([
      this.getWalletDisponible(vendeurId),
      this.getSetting()
    ]);

    const montantInBase = await this.currencyService.toBase(montantDemande, currency);
    const minInBase = setting.minWithdrawalAmount || 0;
    const maxInBase = setting.maxWithdrawalAmount || Infinity;

    if (montantInBase < minInBase) {
      const minInDisplay = await this.currencyService.fromBase(minInBase, currency);
      return {
        peut: false,
        walletDisponible: walletInfo.totalInDisplay.wallet,
        walletCurrency: walletInfo.totalInDisplay.currency,
        message: `Montant minimum de retrait: ${Math.round(minInDisplay)} ${currency}`,
        minAmount: Math.round(minInDisplay)
      };
    }

    if (montantInBase > maxInBase) {
      const maxInDisplay = await this.currencyService.fromBase(maxInBase, currency);
      return {
        peut: false,
        walletDisponible: walletInfo.totalInDisplay.wallet,
        walletCurrency: walletInfo.totalInDisplay.currency,
        message: `Montant maximum de retrait: ${Math.round(maxInDisplay)} ${currency}`,
        maxAmount: Math.round(maxInDisplay)
      };
    }

    if (walletInfo.totalInBase.wallet < montantInBase) {
      return {
        peut: false,
        walletDisponible: walletInfo.totalInDisplay.wallet,
        walletCurrency: walletInfo.totalInDisplay.currency,
        message: `Solde insuffisant. Disponible: ${Math.round(walletInfo.totalInDisplay.wallet)} ${walletInfo.totalInDisplay.currency}, Demandé: ${Math.round(montantDemande)} ${currency}`
      };
    }

    return {
      peut: true,
      walletDisponible: walletInfo.totalInDisplay.wallet,
      walletCurrency: walletInfo.totalInDisplay.currency
    };
  }

  /**
   * Calcule le montant net après commission (avec conversion)
   */
  async calculerMontantNet(
    montantBrut: number,
    currency: string
  ): Promise<{
    commission: number;
    net: number;
    commissionRate: number;
    currency: string;
  }> {
    const rate = await this.getCommissionRate();
    const commission = montantBrut * rate;
    const net = montantBrut - commission;

    return {
      commission,
      net,
      commissionRate: rate,
      currency
    };
  }

  /**
   * Récupère les wallets de tous les vendeurs avec leurs informations
   */

  async getAllWallets(): Promise<IWalletInfo[]> {
    // Récupérer TOUS les vendeurs de la collection Vendeur
    const allVendeurs = await User.find({ role: "vendeur" }).select("_id").lean();

    const wallets: IWalletInfo[] = [];

    for (const vendeur of allVendeurs) {
      const vendeurId = vendeur._id.toString();
      const wallet = await this.getWalletDisponible(vendeurId);
      wallets.push(wallet);
    }

    return wallets;
  }


    /**
   * Récupère le wallet Cabunet (commission plateforme)
   */
  
  async getCabunetWallet(): Promise<{
    generee: number;
    retiree: number;
    disponible: number;
    currency: string;
  }> {
    const wallets = await this.getAllWallets();
    const setting = await this.getSetting();

    // Commission générée = somme des commissions calculées par vendeur
    const generee = wallets.reduce(
      (sum, w) => sum + w.totalInDisplay.commission,
      0
    );

    // Retraits cabunet déjà effectués
    const retraitsResult = await Retrait.aggregate([
      {
        $match: {
          type: "cabunet",
          status: "COMPLETED",
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" },
        },
      },
    ]);

    const retiree = retraitsResult[0]?.total || 0;
    const disponible = Math.max(generee - retiree, 0);

    return {
      generee,
      retiree,
      disponible,
      currency: setting.defaultDisplayCurrency || "CDF",
    };
  }
  /**
   * Vide le cache
   */
  invalidateCache(): void {
    this.currencyService.invalidateCache();
  }


}