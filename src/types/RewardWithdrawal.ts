// src/types/RewardWithdrawal.ts

import { BackendData } from "./core/BackendData";

export type RewardWithdrawalStatus =
  | "en_attente"
  | "approuvee"
  | "rejetee"
  | "payee";

export type RewardWithdrawalChannel =
  | "airtel_money"
  | "vodacom_mpesa"
  | "orange_money"
  | "africell_money"
  | "manuel";

export interface RewardWithdrawal extends BackendData {
  affiliateId: string;
  amount: number;
  currency: string;
  channel: RewardWithdrawalChannel;
  maskedDestination: string;
  destination?: string;
  status: RewardWithdrawalStatus;
  reason?: string;
  externalReference?: string;
  paymentProof?: string;
  processedBy?: string;
  processedAt?: string;
}

// ✅ Version populée : garde l'ID, ajoute les objets
export interface RewardWithdrawalPopulated
  extends Omit<RewardWithdrawal, "affiliateId" | "processedBy"> {
  affiliateId: {
    _id: string;
    email: string;
    username?: string;
    codeParrainage?: string;
  };
  processedBy?: {
    _id: string;
    email: string;
    username?: string;
  };
}

// ------------------------------------------------------------
// Payloads
// ------------------------------------------------------------

export interface CreateWithdrawalPayload {
  amount: number;
  channel: RewardWithdrawalChannel;
  destination: string;
  countryCode?: string;
}

export interface ApproveWithdrawalPayload {
  withdrawalId: string;
}

export interface RejectWithdrawalPayload {
  withdrawalId: string;
  reason: string;
}

export interface MarkAsPaidPayload {
  withdrawalId: string;
  externalReference: string;
  paymentProof?: string;
}

// ------------------------------------------------------------
// Types de réponse API
// ------------------------------------------------------------

export interface PaginatedWithdrawals {
  items: RewardWithdrawal[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedWithdrawalsPopulated {
  items: RewardWithdrawalPopulated[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}