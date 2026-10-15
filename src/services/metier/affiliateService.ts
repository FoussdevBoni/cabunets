// src/services/metier/affiliateService.ts
import mongoose from "mongoose";
import User from "../../models/User";
import { Affiliate, AffiliateStatus } from "../../models/Affiliate";
import { Referral } from "../../models/Referral";
import { codeGenerator } from "../../utils/codeGenerator";
import { phone } from "../../utils/phone";
import {
  NotFoundError,
  ValidationError,
  ConflictError,
  ForbiddenError,
} from "../../utils/errors";

export interface DevenirAffiliePayload {
  userId: string;
  telephone: string;
  countryCode?: string; // ex: "CD" par défaut
}

export const affiliateService = {
  // ----------------------------------------------------------
  // DEVENIR AFFILIÉ
  // ----------------------------------------------------------
  async devenirAffilie(payload: DevenirAffiliePayload) {
    const { userId, telephone, countryCode } = payload;

    // 1. Vérifier l'utilisateur
    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError("Utilisateur introuvable");
    }

    if (user.isAffiliate) {
      throw new ConflictError("Cet utilisateur est déjà affilié");
    }

    if (!user.isActive) {
      throw new ForbiddenError("Compte désactivé");
    }

    // 2. Normaliser le téléphone
    const phoneNorm = phone.normalize(telephone, countryCode ?? "CD");
    if (!phoneNorm) {
      throw new ValidationError("Numéro de téléphone invalide");
    }

    // 3. Générer un code unique
    const code = await codeGenerator.generateUnique(async (c) => {
      const exists = await User.findOne({ codeParrainage: c });
      return !!exists;
    });

    // 4. Transaction : User + Affiliate
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // 4a. Mettre à jour User
      user.isAffiliate = true;
      user.codeParrainage = code;
      await user.save({ session });

      // 4b. Créer Affiliate (même _id que User)
      const [affiliate] = await Affiliate.create(
        [
          {
            _id: user._id,
            telephone: phoneNorm,
            telephoneVerifie: false,
            statut: "en_attente",
          },
        ],
        { session }
      );

      await session.commitTransaction();
      session.endSession();

      return {
        success: true,
        code,
        statut: affiliate.statut,
        telephone: phoneNorm,
      };
    } catch (err) {
      await session.abortTransaction();
      session.endSession();
      throw err;
    }
  },

  // ----------------------------------------------------------
  // ACTIVER UN AFFILIÉ (admin)
  // ----------------------------------------------------------
  async activer(userId: string) {
    const affiliate = await Affiliate.findById(userId);
    if (!affiliate) {
      throw new NotFoundError("Affilié introuvable");
    }

    if (affiliate.statut === "actif") {
      return { success: true, statut: "actif", alreadyActive: true };
    }

    affiliate.statut = "actif";
    await affiliate.save();

    return { success: true, statut: "actif", alreadyActive: false };
  },

  // ----------------------------------------------------------
  // SUSPENDRE UN AFFILIÉ (admin)
  // ----------------------------------------------------------
  async suspendre(userId: string, motif?: string) {
    const affiliate = await Affiliate.findById(userId);
    if (!affiliate) {
      throw new NotFoundError("Affilié introuvable");
    }

    if (affiliate.statut === "suspendu") {
      return { success: true, statut: "suspendu", alreadySuspended: true };
    }

    affiliate.statut = "suspendu";
    await affiliate.save();

    return { success: true, statut: "suspendu", motif: motif ?? null };
  },

  // ----------------------------------------------------------
  // RÉACTIVER UN AFFILIÉ (admin)
  // ----------------------------------------------------------
  async reactiver(userId: string) {
    const affiliate = await Affiliate.findById(userId);
    if (!affiliate) {
      throw new NotFoundError("Affilié introuvable");
    }

    affiliate.statut = "actif";
    await affiliate.save();

    return { success: true, statut: "actif" };
  },

  // ----------------------------------------------------------
  // OBTENIR LE PROFIL AFFILIÉ
  // ----------------------------------------------------------
  async getProfil(userId: string) {
    const affiliate = await Affiliate.findById(userId);
    if (!affiliate) {
      throw new NotFoundError("Affilié introuvable");
    }

    const user = await User.findById(userId).select(
      "email username avatar codeParrainage isAffiliate"
    );
    if (!user) {
      throw new NotFoundError("Utilisateur introuvable");
    }

    return {
      id: affiliate._id.toString(),
      email: user.email,
      username: user.username,
      avatar: user.avatar,
      code: user.codeParrainage,
      telephone: affiliate.telephone,
      telephoneVerifie: affiliate.telephoneVerifie,
      statut: affiliate.statut,
      createdAt: affiliate.createdAt,
    };
  },

  // ----------------------------------------------------------
  // LISTER LES AFFILIÉS (admin)
  // ----------------------------------------------------------
  async lister(options: {
    statut?: AffiliateStatus;
    page?: number;
    limit?: number;
  } = {}) {
    const page = options.page ?? 1;
    const limit = options.limit ?? 20;
    const skip = (page - 1) * limit;

    const filter: Record<string, any> = {};
    if (options.statut) filter.statut = options.statut;

    const [items, total] = await Promise.all([
      Affiliate.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("_id", "email username avatar codeParrainage isActive"),
      Affiliate.countDocuments(filter),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  },

  // ----------------------------------------------------------
  // VÉRIFIER LE TÉLÉPHONE
  // ----------------------------------------------------------
  async verifierTelephone(userId: string) {
    const affiliate = await Affiliate.findById(userId);
    if (!affiliate) {
      throw new NotFoundError("Affilié introuvable");
    }

    affiliate.telephoneVerifie = true;
    await affiliate.save();

    return { success: true, telephoneVerifie: true };
  },
};

export type AffiliateService = typeof affiliateService;