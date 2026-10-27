import { AffiliateSettings } from "../../models/AffiliateSettings";
import { ValidationError } from "../../utils/errors";
export const affiliateSettingsService = {
  async get() {
    const settings = await AffiliateSettings.findById("default").lean();
    const fallback = Number(process.env.AFFILIATE_MIN_WITHDRAWAL_CDF ?? 5000);
    return { currency: "CDF", minWithdrawalAmount: settings?.minWithdrawalAmount ??
      (Number.isFinite(fallback) && fallback >= 1 ? fallback : 5000) };
  },
  async update(amount: unknown, adminId: string) {
    if (typeof amount !== "number" || !Number.isFinite(amount) || amount < 1 || amount > 1e9) {
      throw new ValidationError("Le seuil doit être un montant valide entre 1 et 1 000 000 000 CDF.");
    }
    await AffiliateSettings.findOneAndUpdate({ _id: "default" },
      { $set: { minWithdrawalAmount: amount, updatedBy: adminId } }, { upsert: true, runValidators: true });
    return this.get();
  },
};
