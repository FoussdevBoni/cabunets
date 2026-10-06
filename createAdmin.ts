// createAdmin.ts (racine du projet)
import "dotenv/config";
import mongoose from "mongoose";
import User from "./src/models/User";
import { Admin } from "./src/models/Admin";

const MONGO_URI = process.env.MONGO_URI;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;

async function createAdminProfile() {
  if (!MONGO_URI) throw new Error("MONGO_URI manquant dans .env");
  if (!ADMIN_EMAIL) throw new Error("ADMIN_EMAIL manquant dans .env");

  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connecté à MongoDB");

    // 1) Récupère le User admin existant
    const user = await User.findOne({ email: ADMIN_EMAIL, role: "admin" });

    if (!user) {
      console.error(`❌ Aucun User admin avec l'email ${ADMIN_EMAIL}`);
      process.exit(1);
    }

    console.log("✅ User admin trouvé :", user._id);

    // 2) Crée le doc Admin s'il n'existe pas
    const existingAdmin = await Admin.findById(user._id);

    if (existingAdmin) {
      console.log("ℹ️ Doc Admin déjà existant :", existingAdmin._id);
      process.exit(0);
    }

    const adminDoc = await Admin.create({ _id: user._id });
    console.log("🎉 Doc Admin créé :", adminDoc._id);
    console.log("➡️ _id :", adminDoc._id.toString());
    console.log("➡️ Lié au User :", ADMIN_EMAIL);

    process.exit(0);
  } catch (error) {
    console.error("❌ Erreur :", error);
    process.exit(1);
  }
}

createAdminProfile();