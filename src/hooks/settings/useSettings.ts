// hooks/useSettings.ts
import { useState, useCallback } from 'react';
import { settingService } from '../../services/settingService';

interface IExchangeRate {
  currency: string;
  rate: number;
  isActive: boolean;
}

interface ISettings {
  commissionRate: number;
  baseCurrency: string;
  defaultDisplayCurrency: string;
  exchangeRates: IExchangeRate[];
  minWithdrawalAmount: number;
  maxWithdrawalAmount: number;
  updatedAt: string;
  updatedBy: string;
}

interface IUseSettingsReturn {
  settings: ISettings | null;
  loading: boolean;
  error: string | null;
  getSettings: () => Promise<void>;
  updateCommission: (rate: number) => Promise<void>;
  updateExchangeRate: (currency: string, rate: number) => Promise<void>;
  updateDefaultCurrency: (currency: string) => Promise<void>;
  updateWithdrawalLimits: (minAmount: number, maxAmount: number) => Promise<void>;
  clearError: () => void;
}

export default function useSettings(): IUseSettingsReturn {
  const [settings, setSettings] = useState<ISettings | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const getSettings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await settingService.getSettings();
      setSettings(response.data);
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement des paramètres');
    } finally {
      setLoading(false);
    }
  }, []);

  const updateCommission = useCallback(async (rate: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await settingService.updateCommission(rate);
      setSettings(response.data);
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la mise à jour de la commission');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateExchangeRate = useCallback(async (currency: string, rate: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await settingService.updateExchangeRate(currency, rate);
      setSettings(response.data);
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la mise à jour du taux de change');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateDefaultCurrency = useCallback(async (currency: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await settingService.updateDefaultCurrency(currency);
      setSettings(response.data);
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la mise à jour de la devise');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateWithdrawalLimits = useCallback(async (minAmount: number, maxAmount: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await settingService.updateWithdrawalLimits(minAmount, maxAmount);
      setSettings(response.data);
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la mise à jour des limites');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    settings,
    loading,
    error,
    getSettings,
    updateCommission,
    updateExchangeRate,
    updateDefaultCurrency,
    updateWithdrawalLimits,
    clearError
  };
}