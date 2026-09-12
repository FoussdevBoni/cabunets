// controllers/WalletController.ts
import { Request, Response } from "express";
import { WalletService } from "../services/walletService";
import { CurrencyService } from "../services/currencyService";

const walletService = new WalletService();
const currencyService = new CurrencyService();

/**
 * GET /api/wallet/:vendeurId
 * Récupère le wallet en plusieurs devises
 */
export const getWallet = async (req: Request, res: Response) => {
  try {
    const { vendeurId } = req.params;

    const walletInfo = await walletService.getWalletDisponible(vendeurId);

    return res.status(200).json({
      success: true,
      data: walletInfo
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * GET /api/wallet/:vendeurId/check-retrait
 * Vérifie si un retrait est possible
 */
export const checkRetrait = async (req: Request, res: Response) => {
  try {
    const { vendeurId } = req.params;
    const { amount, currency } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Le montant est requis et doit être supérieur à 0"
      });
    }

    const result = await walletService.peutRetirer(
      vendeurId,
      amount,
      currency || "CDF"
    );

    return res.status(200).json({
      success: true,
      data: result
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * GET /api/wallet/settings/rates
 * Récupère les taux de change
 */
export const getExchangeRates = async (req: Request, res: Response) => {
  try {
    const setting = await currencyService.getSetting();

    return res.status(200).json({
      success: true,
      data: {
        baseCurrency: setting.baseCurrency,
        defaultDisplayCurrency: setting.defaultDisplayCurrency,
        rates: setting.exchangeRates
      }
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * PUT /api/wallet/settings/rates
 * Met à jour un taux de change (admin)
 */
export const updateExchangeRate = async (req: Request, res: Response) => {
  try {
    const { currency, rate } = req.body;
    const userId = (req as any).user?.id || "admin";

    if (!currency || !rate || rate <= 0) {
      return res.status(400).json({
        success: false,
        message: "La devise et le taux sont requis (taux > 0)"
      });
    }

    const setting = await currencyService.updateExchangeRate(
      currency.toUpperCase(),
      rate,
      userId
    );

    return res.status(200).json({
      success: true,
      message: `Taux de change mis à jour: 1 ${setting.baseCurrency} = ${rate} ${currency.toUpperCase()}`,
      data: {
        currency: currency.toUpperCase(),
        rate,
        updatedBy: setting.updatedBy,
        updatedAt: setting.updatedAt
      }
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * PUT /api/wallet/settings/default-currency
 * Met à jour la devise d'affichage par défaut (admin)
 */
export const updateDefaultDisplayCurrency = async (req: Request, res: Response) => {
  try {
    const { currency } = req.body;
    const userId = (req as any).user?.id || "admin";

    if (!currency) {
      return res.status(400).json({
        success: false,
        message: "La devise est requise"
      });
    }

    const setting = await currencyService.updateDefaultDisplayCurrency(
      currency.toUpperCase(),
      userId
    );

    return res.status(200).json({
      success: true,
      message: `Devise d'affichage par défaut: ${currency.toUpperCase()}`,
      data: {
        defaultDisplayCurrency: setting.defaultDisplayCurrency,
        updatedBy: setting.updatedBy,
        updatedAt: setting.updatedAt
      }
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }


};


/**
 * GET /api/wallet/all
 * Récupère les wallets de tous les vendeurs
 */
export const getAllWallets = async (req: Request, res: Response) => {
  try {
    const wallets = await walletService.getAllWallets();

    return res.status(200).json({
      success: true,
      data: wallets
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


/**
 * GET /api/wallet/commission-solde
 * Récupère le solde commission de la plateforme
 */
export const getCabunetWallet = async (req: Request, res: Response) => {

  try {
    const solde = await walletService.getCabunetWallet();

    return res.status(200).json({
      success: true,
      data: solde
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};