// src/types/Affiliate.ts

import { BackendData } from "./core/BackendData";

export type AffiliateStatus = "en_attente" | "actif" | "suspendu";

export interface Affiliate extends BackendData {
  telephone: string;
  telephoneVerifie: boolean;
  statut: AffiliateStatus;
}

export interface AffiliateWithUser extends Affiliate {
  code?: string;
  email?: string;
  username?: string;
  user?: {
    _id: string;
    email: string;
    username?: string;
    avatar?: string;
    codeParrainage?: string;
    isActive: boolean;
  };
}

// ✅ Renommé en anglais
export interface BecomeAffiliatePayload {
  telephone: string;
  countryCode?: string;
}


export interface PaginatedAffiliates {
  items: AffiliateWithUser[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface BecomeAffiliateResponse {
  success: boolean;
  code: string;
  statut: AffiliateStatus;
  telephone: string;
}