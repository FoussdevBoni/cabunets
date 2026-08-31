// hooks/useWallet.ts
import React, { useState, useEffect, useCallback } from 'react';
import { walletService } from '../../services/walletService';

interface IWalletInfo {
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
  details: {
    currency: string;
    ca: number;
    commission: number;
    net: number;
  }[];
  totalInBase: {
    currency: string;
    ca: number;
    commission: number;
    net: number;
    retraits: number;
    wallet: number;
  };
  totalInDisplay: {
    currency: string;
    ca: number;
    commission: number;
    net: number;
    retraits: number;
    wallet: number;
  };
}

interface IUseWalletReturn {
  wallet: IWalletInfo | null;
  wallets: IWalletInfo[];
  loading: boolean;
  error: string | null;
  getWallet: (vendeurId: string) => Promise<void>;
  getAllWallets: () => Promise<void>;
  verifierRetrait: (vendeurId: string, amount: number, currency?: string) => Promise<any>;
  getCAEvolution: (vendeurId: string, periode?: "day" | "week" | "month") => Promise<any>;
  getHistoriqueRetraits: (vendeurId: string, limit?: number) => Promise<any>;
  clearError: () => void;
}

export default function useWallet(): IUseWalletReturn {
  const [wallet, setWallet] = useState<IWalletInfo | null>(null);
  const [wallets, setWallets] = useState<IWalletInfo[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const getWallet = useCallback(async (vendeurId: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await walletService.getWallet(vendeurId);
      setWallet(response.data);
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement du wallet');
    } finally {
      setLoading(false);
    }
  }, []);

  const getAllWallets = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await walletService.getAllWallets();
      setWallets(response.data);
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement des wallets');
    } finally {
      setLoading(false);
    }
  }, []);

  const verifierRetrait = useCallback(async (vendeurId: string, amount: number, currency: string = "CDF") => {
    setLoading(true);
    setError(null);
    try {
      const response = await walletService.verifierRetrait(vendeurId, amount, currency);
      return response.data;
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la vérification du retrait');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getCAEvolution = useCallback(async (vendeurId: string, periode: "day" | "week" | "month" = "month") => {
    setLoading(true);
    setError(null);
    try {
      const response = await walletService.getCAEvolution(vendeurId, periode);
      return response.data;
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement de l\'évolution');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getHistoriqueRetraits = useCallback(async (vendeurId: string, limit: number = 50) => {
    setLoading(true);
    setError(null);
    try {
      const response = await walletService.getHistoriqueRetraits(vendeurId, limit);
      return response.data;
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement de l\'historique');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    wallet,
    wallets,
    loading,
    error,
    getWallet,
    getAllWallets,
    verifierRetrait,
    getCAEvolution,
    getHistoriqueRetraits,
    clearError
  };
}