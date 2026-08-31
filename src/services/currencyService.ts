// services/CurrencyService.ts
import { Setting, ISetting } from "../models/Setting";

export interface IConvertedAmount {
  originalAmount: number;
  originalCurrency: string;
  baseAmount: number;
  convertedAmount: number;
  targetCurrency: string;
  rate: number;
}

export class CurrencyService {
  private settingCache: ISetting | null = null;
  private lastCacheUpdate: Date | null = null;
  private CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  /**
   * Récupère le setting avec cache
   */
  async getSetting(): Promise<ISetting> {
    const now = new Date();
    if (
      this.settingCache &&
      this.lastCacheUpdate &&
      now.getTime() - this.lastCacheUpdate.getTime() < this.CACHE_DURATION
    ) {
      return this.settingCache;
    }

    this.settingCache = await Setting.getDefault();
    this.lastCacheUpdate = now;
    return this.settingCache;
  }

  /**
   * Récupère la devise de base
   */
  async getBaseCurrency(): Promise<string> {
    const setting = await this.getSetting();
    return setting.baseCurrency;
  }

  /**
   * Récupère la devise d'affichage par défaut
   */
  async getDefaultDisplayCurrency(): Promise<string> {
    const setting = await this.getSetting();
    return setting.defaultDisplayCurrency;
  }

  /**
   * Récupère le taux de change d'une devise
   */
  async getExchangeRate(currency: string): Promise<number> {
    const setting = await this.getSetting();
    return setting.getExchangeRate(currency);
  }

  /**
   * Convertit vers la devise de base
   */
  async toBase(amount: number, fromCurrency: string): Promise<number> {
    const setting = await this.getSetting();
    return setting.convertToBase(amount, fromCurrency);
  }

  /**
   * Convertit depuis la devise de base
   */
  async fromBase(amount: number, toCurrency: string): Promise<number> {
    const setting = await this.getSetting();
    return setting.convertFromBase(amount, toCurrency);
  }

  /**
   * Convertit d'une devise à une autre
   */
  async convert(
    amount: number,
    fromCurrency: string,
    toCurrency: string
  ): Promise<IConvertedAmount> {
    const setting = await this.getSetting();
    const baseAmount = setting.convertToBase(amount, fromCurrency);
    const convertedAmount = setting.convertFromBase(baseAmount, toCurrency);
    const rate = setting.getExchangeRate(fromCurrency);

    return {
      originalAmount: amount,
      originalCurrency: fromCurrency,
      baseAmount,
      convertedAmount,
      targetCurrency: toCurrency,
      rate
    };
  }

  /**
   * Met à jour un taux de change
   */
  async updateExchangeRate(
    currency: string,
    rate: number,
    updatedBy?: string
  ): Promise<ISetting> {
    const setting = await this.getSetting();
    const result = await setting.updateExchangeRate(currency, rate, updatedBy);
    
    // Invalider le cache
    this.settingCache = null;
    this.lastCacheUpdate = null;
    
    return result;
  }

  /**
   * Met à jour la devise de base
   */
  async updateBaseCurrency(currency: string, updatedBy?: string): Promise<ISetting> {
    const setting = await this.getSetting();
    setting.baseCurrency = currency.toUpperCase();
    setting.updatedBy = updatedBy || "system";
    await setting.save();
    
    // Invalider le cache
    this.settingCache = null;
    this.lastCacheUpdate = null;
    
    return setting;
  }

  /**
   * Met à jour la devise d'affichage par défaut
   */
  async updateDefaultDisplayCurrency(currency: string, updatedBy?: string): Promise<ISetting> {
    const setting = await this.getSetting();
    setting.defaultDisplayCurrency = currency.toUpperCase();
    setting.updatedBy = updatedBy || "system";
    await setting.save();
    
    // Invalider le cache
    this.settingCache = null;
    this.lastCacheUpdate = null;
    
    return setting;
  }

  /**
   * Vide le cache
   */
  invalidateCache(): void {
    this.settingCache = null;
    this.lastCacheUpdate = null;
  }
}