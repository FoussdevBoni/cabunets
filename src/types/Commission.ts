// src/types/Commission.ts

import { BackendData } from "./core/BackendData";

export type CommissionStatus =
  | "detectee"
  | "en_attente"
  | "disponible"
  | "reservee"
  | "payee"
  | "rejetee"
  | "annulee";

export type CommissionSourceType = "order" | "seller_activation";

export type ProgramType =
  | "affiliation_client"
  | "affiliation_vendeur"
  | "parrainage_client";

export interface CommissionRuleSnapshot {
  ruleId: string;
  mode: "fixe" | "pourcentage" | "hybride";
  fixedAmount?: number;
  percentage?: number;
  cap?: number;
  availabilityDelayDays: number;
}

export interface Commission extends BackendData {
  affiliateId: string;
  referralId: string;
  sourceType: CommissionSourceType;
  sourceId: string;
  eventId: string;
  program: ProgramType;
  amount: number;
  currency: string;
  status: CommissionStatus;
  ruleSnapshot: CommissionRuleSnapshot;
  availableAt?: string;
  validatedAt?: string;
  paidAt?: string;
  reason?: string;
}

export interface CommissionPopulated extends Omit<Commission, "affiliateId"> {
  affiliateId: {
    _id: string;
    email: string;
    username?: string;
    codeParrainage?: string;
  };
}

// ------------------------------------------------------------
// Ledger / Balance
// ------------------------------------------------------------

export type LedgerType =
  | "commission_credit"
  | "withdrawal_reserve"
  | "withdrawal_release"
  | "regularisation";

export interface LedgerEntry extends BackendData {
  affiliateId: string;
  commissionId?: string;
  rewardWithdrawalId?: string;
  type: LedgerType;
  signedAmount: number;
  currency: string;
  description: string;
}

export interface Balance {
  totalCredit: number;
  totalDebit: number;
  availableBalance: number;
  pendingBalance: number;
  minimumWithdrawalAmount: number;
  currency: string;
}

// ------------------------------------------------------------
// Types de réponse API
// ------------------------------------------------------------

export interface PaginatedCommissions {
  items: Commission[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedCommissionsPopulated {
  items: CommissionPopulated[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedLedger {
  items: LedgerEntry[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}