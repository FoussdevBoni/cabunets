// src/types/Referral.ts

import { BackendData } from "./core/BackendData";

export type ReferralType = "client" | "vendeur";
export type ReferralSource = "lien" | "code_manuel" | "admin";


export interface Referral extends BackendData {
  affiliateId: string;
  filleulId: string;
  type: ReferralType;
  codeUtilise: string;
  source: ReferralSource;
  attributedAt: string;
}

// ✅ Version populée : garde l'ID, ajoute l'objet
export interface ReferralWithFilleul extends Referral {
  filleul: {
    _id: string;
    email: string;
    username?: string;
    role: "client" | "vendeur" | "admin";
    isVerified: boolean;
    createdAt: string;
  };
}


// ============================================================
// TYPES
// ============================================================

export interface PaginatedReferrals {
  items: ReferralWithFilleul[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface MySponsorResponse {
  referralId: string;
  codeUtilise: string;
  attributedAt: string;
  parrain: {
    _id: string;
    email: string;
    username?: string;
    codeParrainage?: string;
  };
}

export interface ReferralStats {
  total: number;
  clients: number;
  vendeurs: number;
}