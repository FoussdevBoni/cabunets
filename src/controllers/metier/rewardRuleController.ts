import { Request, Response } from "express";
import mongoose from "mongoose";
import { RewardRule } from "../../models/RewardRule";

const fields = ["name", "description", "program", "mode", "fixedAmount", "percentage", "cap",
  "currency", "availabilityDelayDays", "active", "startDate", "endDate"];

export async function rewardRules(req: Request, res: Response) {
  try {
    const id = req.params.id;
    if (id && !mongoose.isValidObjectId(id)) return res.status(400).json({ message: "Identifiant invalide." });
    if (req.method === "GET") {
      const result = id ? await RewardRule.findById(id) : await RewardRule.find().sort({ createdAt: -1 });
      if (!result) return res.status(404).json({ message: "Règle introuvable." });
      return res.json({ data: result });
    }
    const payload: Record<string, any> = {};
    for (const key of fields) if (Object.prototype.hasOwnProperty.call(req.body, key)) payload[key] = req.body[key];
    if (req.method === "PATCH") {
      if (typeof payload.active !== "boolean") return res.status(400).json({ message: "Statut invalide." });
      for (const key of Object.keys(payload)) if (key !== "active") delete payload[key];
    }
    const rule = id ? await RewardRule.findById(id) : new RewardRule();
    if (!rule) return res.status(404).json({ message: "Règle introuvable." });
    rule.set(payload);
    if (rule.startDate && rule.endDate && rule.startDate > rule.endDate) {
      return res.status(400).json({ message: "La date de fin doit suivre la date de début." });
    }
    if (rule.currency !== "CDF") return res.status(400).json({ message: "Les nouvelles règles utilisent le CDF pour les retraits du programme." });
    if ((rule.mode === "fixe" && !(rule.fixedAmount! > 0)) ||
        (rule.mode === "pourcentage" && !(rule.percentage! > 0)) ||
        (rule.mode === "hybride" && !(rule.fixedAmount! > 0 || rule.percentage! > 0))) {
      return res.status(400).json({ message: "La récompense doit produire un montant strictement positif." });
    }
    await rule.save();
    return res.status(id ? 200 : 201).json({ data: rule });
  } catch (error: any) {
    return res.status(error.name === "ValidationError" ? 400 : 500).json({
      message: error.name === "ValidationError" ? error.message : "Impossible de traiter la règle."
    });
  }
}
