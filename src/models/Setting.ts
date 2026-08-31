// models/Setting.ts
import mongoose, { Schema, Document, Model } from "mongoose";

export interface IExchangeRate {
  currency: string;
  rate: number; // Taux par rapport à la devise de base (USD)
  isActive: boolean;
}

export interface ISetting extends Document {
  // Commission
  commissionRate: number;
  
  // Devises
  baseCurrency: string; // Devise de référence (ex: "USD")
  defaultDisplayCurrency: string; // Devise d'affichage par défaut (ex: "CDF")
  
  // Taux de change
  exchangeRates: IExchangeRate[];
  
  // Seuils de retrait
  minWithdrawalAmount?: number;
  maxWithdrawalAmount?: number;
  
  // Métadonnées
  updatedBy?: string;
  createdAt: Date;
  updatedAt: Date;
  
  // Méthodes
  updateCommission(newRate: number, updatedBy?: string): Promise<ISetting>;
  updateExchangeRate(currency: string, rate: number, updatedBy?: string): Promise<ISetting>;
  getExchangeRate(currency: string): number;
  convertToBase(amount: number, fromCurrency: string): number;
  convertFromBase(amount: number, toCurrency: string): number;
}

export interface ISettingModel extends Model<ISetting> {
  getDefault(): Promise<ISetting>;
}

const ExchangeRateSchema = new Schema<IExchangeRate>(
  {
    currency: {
      type: String,
      required: true,
      uppercase: true,
      enum: ["USD", "CDF", "FCFA", "XOF", "EUR"]
    },
    rate: {
      type: Number,
      required: true,
      min: 0,
      comment: "Taux par rapport à la devise de base"
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  { _id: false }
);

const SettingSchema = new Schema<ISetting, ISettingModel>(
  {
    commissionRate: {
      type: Number,
      required: true,
      default: 0.45,
      min: 0,
      max: 100,
      comment: "Taux de commission en pourcentage (ex: 0.45 = 0.45%)"
    },
    baseCurrency: {
      type: String,
      required: true,
      default: "USD",
      enum: ["USD", "CDF", "FCFA", "XOF", "EUR"],
      comment: "Devise de référence pour tous les calculs"
    },
    defaultDisplayCurrency: {
      type: String,
      required: true,
      default: "CDF",
      enum: ["USD", "CDF", "FCFA", "XOF", "EUR"],
      comment: "Devise d'affichage par défaut"
    },
    exchangeRates: {
      type: [ExchangeRateSchema],
      required: true,
      default: [
        { currency: "USD", rate: 1, isActive: true },
        { currency: "CDF", rate: 2850, isActive: true },
        { currency: "FCFA", rate: 600, isActive: true },
        { currency: "XOF", rate: 600, isActive: true },
        { currency: "EUR", rate: 0.92, isActive: true }
      ]
    },
    minWithdrawalAmount: {
      type: Number,
      default: 1000,
      comment: "Montant minimum pour un retrait (en devise de base)"
    },
    maxWithdrawalAmount: {
      type: Number,
      default: 1000000,
      comment: "Montant maximum pour un retrait (en devise de base)"
    },
    updatedBy: {
      type: String,
      comment: "ID ou email de la personne qui a modifié"
    }
  },
  {
    timestamps: true
  }
);

// ==================== STATIC METHODS ====================

SettingSchema.static('getDefault', async function getDefault(): Promise<ISetting> {
  let setting = await this.findOne();
  if (!setting) {
    setting = await this.create({
      commissionRate: 0.45,
      baseCurrency: "USD",
      defaultDisplayCurrency: "CDF",
      exchangeRates: [
        { currency: "USD", rate: 1, isActive: true },
        { currency: "CDF", rate: 2850, isActive: true },
        { currency: "FCFA", rate: 600, isActive: true },
        { currency: "XOF", rate: 600, isActive: true },
        { currency: "EUR", rate: 0.92, isActive: true }
      ],
      minWithdrawalAmount: 1000,
      maxWithdrawalAmount: 1000000
    });
  }
  return setting;
});

// ==================== INSTANCE METHODS ====================

/**
 * Met à jour le taux de commission
 */
SettingSchema.method('updateCommission', async function updateCommission(
  this: ISetting,
  newRate: number,
  updatedBy?: string
): Promise<ISetting> {
  this.commissionRate = newRate;
  this.updatedBy = updatedBy || "system";
  return await this.save();
});

/**
 * Met à jour un taux de change
 */
SettingSchema.method('updateExchangeRate', async function updateExchangeRate(
  this: ISetting,
  currency: string,
  rate: number,
  updatedBy?: string
): Promise<ISetting> {
  const currencyUpper = currency.toUpperCase();
  
  // Chercher si la devise existe déjà
  const existingRate = this.exchangeRates.find(
    (r) => r.currency === currencyUpper
  );

  if (existingRate) {
    existingRate.rate = rate;
    existingRate.isActive = true;
  } else {
    this.exchangeRates.push({
      currency: currencyUpper,
      rate,
      isActive: true
    });
  }

  this.updatedBy = updatedBy || "system";
  return await this.save();
});

/**
 * Récupère le taux de change d'une devise
 */
SettingSchema.method('getExchangeRate', function getExchangeRate(
  this: ISetting,
  currency: string
): number {
  const currencyUpper = currency.toUpperCase();
  
  // Si c'est la devise de base, retourner 1
  if (currencyUpper === this.baseCurrency) {
    return 1;
  }

  const rate = this.exchangeRates.find(
    (r) => r.currency === currencyUpper && r.isActive === true
  );

  if (!rate) {
    throw new Error(`Taux de change non trouvé pour la devise: ${currencyUpper}`);
  }

  return rate.rate;
});

/**
 * Convertit un montant vers la devise de base
 */
SettingSchema.method('convertToBase', function convertToBase(
  this: ISetting,
  amount: number,
  fromCurrency: string
): number {
  const rate = this.getExchangeRate(fromCurrency);
  return amount / rate;
});

/**
 * Convertit un montant depuis la devise de base
 */
SettingSchema.method('convertFromBase', function convertFromBase(
  this: ISetting,
  amount: number,
  toCurrency: string
): number {
  const rate = this.getExchangeRate(toCurrency);
  return amount * rate;
});

/**
 * Convertit d'une devise à une autre
 */
SettingSchema.method('convert', function convert(
  this: ISetting,
  amount: number,
  fromCurrency: string,
  toCurrency: string
): number {
  const baseAmount = this.convertToBase(amount, fromCurrency);
  return this.convertFromBase(baseAmount, toCurrency);
});

export const Setting = mongoose.model<ISetting, ISettingModel>("Setting", SettingSchema);