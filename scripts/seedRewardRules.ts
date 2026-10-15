// scripts/seedRewardRules.ts
import mongoose from "mongoose";
import { RewardRule } from "../src/models/RewardRule";
import dotenv from "dotenv";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/cabunets";

const defaultRules = [
  {
    name: "Affiliation client - par défaut",
    description:
      "Prime versée quand un nouveau client apporté passe sa première commande livrée et payée.",
    program: "affiliation_client" as const,
    mode: "fixe" as const,
    fixedAmount: 500,
    percentage: 0,
    currency: "CDF",
    availabilityDelayDays: 7,
    active: true,
  },
  {
    name: "Affiliation vendeur - par défaut",
    description:
      "Prime versée quand un nouveau vendeur apporté est vérifié et réalise sa première vente admissible.",
    program: "affiliation_vendeur" as const,
    mode: "fixe" as const,
    fixedAmount: 1000,
    percentage: 0,
    currency: "CDF",
    availabilityDelayDays: 7,
    active: true,
  },
  {
    name: "Parrainage client existant - par défaut",
    description:
      "Prime versée quand un nouveau filleul (client existant) passe sa première commande admissible.",
    program: "parrainage_client" as const,
    mode: "fixe" as const,
    fixedAmount: 300,
    percentage: 0,
    currency: "CDF",
    availabilityDelayDays: 7,
    active: true,
  },
];

async function seed() {
  try {
    console.log("🔌 Connexion à MongoDB...");
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connecté");

    for (const rule of defaultRules) {
      const existing = await RewardRule.findOne({
        program: rule.program,
        active: true,
      });

      if (existing) {
        console.log(
          `⏭️  Règle active déjà existante pour "${rule.program}" → ignorée`
        );
        continue;
      }

      const created = await RewardRule.create(rule);
      console.log(
        `✅ Règle créée : ${created.program} (${created.mode}, ${created.fixedAmount} ${created.currency})`
      );
    }

    console.log("\n🎉 Seed terminé");
    process.exit(0);
  } catch (err) {
    console.error("❌ Erreur seed :", err);
    process.exit(1);
  }
}

seed();