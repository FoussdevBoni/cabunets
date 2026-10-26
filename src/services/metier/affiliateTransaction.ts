import mongoose, { ClientSession } from "mongoose";
import { Affiliate } from "../../models/Affiliate";
import { ForbiddenError } from "../../utils/errors";

// Shared write serializes all financial operations for one affiliate.
// withTransaction retries MongoDB write conflicts before recomputing the balance.
export async function affiliateTransaction<T>(
  affiliateId: string, action: (session: ClientSession) => Promise<T>, requireActive = false
): Promise<T> {
  const session = await mongoose.startSession();
  try {
    let result!: T;
    await session.withTransaction(async () => {
      const affiliate = await Affiliate.findOneAndUpdate(
        { _id: affiliateId, ...(requireActive ? { statut: "actif" } : {}) },
        { $inc: { ledgerVersion: 1 } }, { new: true, session }
      );
      if (!affiliate) throw new ForbiddenError("Profil affilié actif requis.");
      result = await action(session);
    });
    return result;
  } finally { await session.endSession(); }
}
