// controllers/settingsController.ts
import { Request, Response } from "express";
import { Setting } from "../models/Setting";
import { CurrencyService } from "../services/currencyService";

const currencyService = new CurrencyService();

export const getSettings = async (req: Request, res: Response) => {
  try {
    const setting = await Setting.getDefault();
    
    return res.status(200).json({
      success: true,
      data: {
        commissionRate: setting.commissionRate,
        baseCurrency: setting.baseCurrency,
        defaultDisplayCurrency: setting.defaultDisplayCurrency,
        exchangeRates: setting.exchangeRates,
        minWithdrawalAmount: setting.minWithdrawalAmount,
        maxWithdrawalAmount: setting.maxWithdrawalAmount,
        updatedAt: setting.updatedAt,
        updatedBy: setting.updatedBy
      }
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const updateCommission = async (req: Request, res: Response) => {
  try {
    const { commissionRate } = req.body;
    const userId = (req as any).user?.id || "admin";

    if (commissionRate === undefined || commissionRate < 0 || commissionRate > 100) {
      return res.status(400).json({
        success: false,
        message: "Le taux doit être entre 0 et 100 (ex: 0.03 = 3%)"
      });
    }

    const setting = await Setting.getDefault();
    await setting.updateCommission(commissionRate, userId);

    return res.status(200).json({
      success: true,
      message: `Commission mise à jour à ${commissionRate}%`,
      data: {
        commissionRate: setting.commissionRate,
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

export const updateDefaultCurrency = async (req: Request, res: Response) => {
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

export const updateWithdrawalLimits = async (req: Request, res: Response) => {
  try {
    const { minAmount, maxAmount } = req.body;
    const userId = (req as any).user?.id || "admin";

    if (minAmount === undefined || maxAmount === undefined) {
      return res.status(400).json({
        success: false,
        message: "minAmount et maxAmount sont requis"
      });
    }

    if (minAmount < 0 || maxAmount < 0) {
      return res.status(400).json({
        success: false,
        message: "Les montants doivent être supérieurs ou égaux à 0"
      });
    }

    if (minAmount > maxAmount) {
      return res.status(400).json({
        success: false,
        message: "Le montant minimum ne peut pas être supérieur au montant maximum"
      });
    }

    const setting = await Setting.getDefault();
    setting.minWithdrawalAmount = minAmount;
    setting.maxWithdrawalAmount = maxAmount;
    setting.updatedBy = userId;
    await setting.save();

    return res.status(200).json({
      success: true,
      message: "Limites de retrait mises à jour",
      data: {
        minWithdrawalAmount: setting.minWithdrawalAmount,
        maxWithdrawalAmount: setting.maxWithdrawalAmount,
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