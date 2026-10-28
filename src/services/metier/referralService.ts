// src/services/metier/referralService.ts
import { ClientSession } from "mongoose";
import { ValidationError } from "../../utils/errors";
import User from "../../models/User";
import { Affiliate } from "../../models/Affiliate";
import { Referral, ReferralType, ReferralSource } from "../../models/Referral";
import {
  NotFoundError,
  ForbiddenError,
} from "../../utils/errors";

export const referralService = {
  // ----------------------------------------------------------
  // ATTRIBUER UN PARRAIN À UN FILLEUL
  // ----------------------------------------------------------
  async attribuerParrain(
    filleulId: string,
    code: string | undefined,
    source: ReferralSource = "lien",
    session?: ClientSession
  ) {
    if (code === undefined || code === null || code === "") return null;
    if (typeof code !== "string") throw new ValidationError("Code de parrainage invalide.");
    const codeNorm = code.trim().toUpperCase();
    if (!/^[A-Z0-9-]{4,20}$/.test(codeNorm)) throw new ValidationError("Code de parrainage invalide.");

    // 2. Trouver le parrain via son code
    const parrain = await User.findOne({
      codeParrainage: codeNorm,
      isAffiliate: true,
      isActive: { $ne: false },
    }).session(session ?? null);

    if (!parrain) {
      throw new ValidationError("Code de parrainage invalide ou inactif.");
    }

    // 3. Vérifier que l'affilié est actif
    const affiliateDoc = await Affiliate.findById(parrain._id).session(session ?? null);
    if (!affiliateDoc || affiliateDoc.statut !== "actif") {
      throw new ValidationError("Ce parrain n’est pas actif. Corrigez ou retirez le code pour continuer.");
    }

    // 4. Anti auto-parrainage
    if (parrain._id.toString() === filleulId.toString()) {
      throw new ForbiddenError("Auto-parrainage interdit");
    }

    // 5. Le filleul a-t-il déjà un parrain ?
    const dejaParraine = await Referral.findOne({ filleulId }).session(session ?? null);
    if (dejaParraine) {
      return dejaParraine;
    }

    // 6. Récupérer le filleul
    const filleul = await User.findById(filleulId).session(session ?? null);
    if (!filleul) {
      throw new NotFoundError("Filleul introuvable");
    }

    // 7. Déterminer le type
    const type: ReferralType =
      filleul.role === "vendeur" ? "vendeur" : "client";

    // 8. Créer le Referral
    const [referral] = await Referral.create([{
      affiliateId: parrain._id,
      filleulId: filleul._id,
      type,
      codeUtilise: codeNorm,
      source,
      attributedAt: new Date(),
    }], { session });

    return referral;
  },

  // ----------------------------------------------------------
  // LISTER LES FILLEULS D'UN AFFILIÉ
  // ----------------------------------------------------------
  async getFilleuls(
    affiliateId: string,
    options: { page?: number; limit?: number; type?: ReferralType } = {}
  ) {
    const page = options.page ?? 1;
    const limit = options.limit ?? 20;
    const skip = (page - 1) * limit;

    const filter: Record<string, any> = { affiliateId };
    if (options.type) filter.type = options.type;

    const [items, total] = await Promise.all([
      Referral.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("filleulId", "email username role isVerified createdAt"),
      Referral.countDocuments(filter),
    ]);

    return {
      items: items.map(item => {
        const value = item.toObject();
        const child: any = value.filleulId;
        return { ...value, filleulId: child?._id ?? value.filleulId,
          filleul: child ?? { username: "Compte indisponible", email: "", isVerified: false } };
      }),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  },

  // ----------------------------------------------------------
  // COMPTER LES FILLEULS PAR TYPE
  // ----------------------------------------------------------
  async compterFilleuls(affiliateId: string) {
    const [total, clients, vendeurs] = await Promise.all([
      Referral.countDocuments({ affiliateId }),
      Referral.countDocuments({ affiliateId, type: "client" }),
      Referral.countDocuments({ affiliateId, type: "vendeur" }),
    ]);

    return { total, clients, vendeurs };
  },

  // ----------------------------------------------------------
  // RÉCUPÉRER LE PARRAIN D'UN FILLEUL
  // ----------------------------------------------------------
  async getParrain(filleulId: string) {
    const referral = await Referral.findOne({ filleulId })
      .populate("affiliateId", "email username codeParrainage");

    if (!referral) return null;

    return {
      referralId: referral._id.toString(),
      codeUtilise: referral.codeUtilise,
      attributedAt: referral.attributedAt,
      parrain: referral.affiliateId,
    };
  },

  // ----------------------------------------------------------
  // RÉCUPÉRER UN REFERRAL PAR ID
  // ----------------------------------------------------------
  async getById(referralId: string) {
    const referral = await Referral.findById(referralId)
      .populate("affiliateId", "email username codeParrainage")
      .populate("filleulId", "email username role");

    if (!referral) {
      throw new NotFoundError("Referral introuvable");
    }

    return referral;
  },
};

export type ReferralService = typeof referralService;