// src/services/metier/referralService.ts
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
    source: ReferralSource = "lien"
  ) {
    // 1. Pas de code → pas d'attribution
    if (!code || code.trim().length === 0) {
      return null;
    }

    const codeNorm = code.trim().toUpperCase();

    // 2. Trouver le parrain via son code
    const parrain = await User.findOne({
      codeParrainage: codeNorm,
      isAffiliate: true,
      isActive: true,
    });

    if (!parrain) {
      // Code invalide → on ignore silencieusement
      return null;
    }

    // 3. Vérifier que l'affilié est actif
    const affiliateDoc = await Affiliate.findById(parrain._id);
    if (!affiliateDoc || affiliateDoc.statut !== "actif") {
      return null;
    }

    // 4. Anti auto-parrainage
    if (parrain._id.toString() === filleulId.toString()) {
      throw new ForbiddenError("Auto-parrainage interdit");
    }

    // 5. Le filleul a-t-il déjà un parrain ?
    const dejaParraine = await Referral.findOne({ filleulId });
    if (dejaParraine) {
      return dejaParraine;
    }

    // 6. Récupérer le filleul
    const filleul = await User.findById(filleulId);
    if (!filleul) {
      throw new NotFoundError("Filleul introuvable");
    }

    // 7. Déterminer le type
    const type: ReferralType =
      filleul.role === "vendeur" ? "vendeur" : "client";

    // 8. Créer le Referral
    const referral = await Referral.create({
      affiliateId: parrain._id,
      filleulId: filleul._id,
      type,
      codeUtilise: codeNorm,
      source,
      attributedAt: new Date(),
    });

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