import api from "../utils/api";
import { PeriodFilter } from "../types/AffiliateAdmin";
export const affiliateAdminService = {
  async get<T>(path: string, params?: object): Promise<T> {
    const { data } = await api.get<{ data: T }>("/affiliate-admin/" + path, { params });
    return data.data;
  },
  async action<T = unknown>(path: string, body: object = {}): Promise<T> {
    const { data } = await api.post<{ data: T }>("/affiliate-admin/" + path, body);
    return data.data;
  },
  async settings(amount: number) {
    const { data } = await api.put("/affiliate-admin/settings", { minWithdrawalAmount: amount });
    return data.data;
  },
  async export(kind: string, params: PeriodFilter) {
    const { data } = await api.get("/affiliate-admin/exports/" + kind, { params, responseType: "blob" });
    const url = URL.createObjectURL(data);
    const link = document.createElement("a");
    link.href = url; link.download = kind + ".csv"; document.body.appendChild(link); link.click(); link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  },
};
