export interface PeriodFilter { from?: string; to?: string; }
export interface PageData<T> { items: T[]; total: number; page: number; limit: number; totalPages: number; }
export interface AdminOverview {
  activeAffiliates: number; totalAffiliates: number; referrals: number;
  clients: number; sellers: number; activeClients: number; activeSellers: number;
  pendingCommissions: number; pendingWithdrawals: number; totalCommissions: number; totalWithdrawals: number;
  openIssues: number;
  revenue: { _id: string; amount: number; orders: number }[];
  commissions: { _id: { currency: string; status: string }; amount: number; count: number }[];
  withdrawals: { _id: { currency: string; status: string }; amount: number; count: number }[];
}
export interface AuditRecord {
  _id: string; createdAt: string; action: string; method: string; path: string; status?: number;
  actorId?: { username?: string; email?: string }; payload?: Record<string, unknown>;
}
export interface AffiliateIssue {
  _id: string; orderId?: string; affiliateId?: string; category: string; message: string;
  status: "open" | "resolved"; attempts: number; updatedAt: string; resolution?: string;
}
export interface ReferredSeller {
  _id: string; createdAt: string;
  filleulId?: { _id: string; username?: string; email?: string; isActive?: boolean };
  affiliateId?: { username?: string; codeParrainage?: string };
  seller?: { isApproved: boolean; whatsappNumber: string; approvedAt?: string };
}
export interface ProgramSettings { currency: string; minWithdrawalAmount: number; }
