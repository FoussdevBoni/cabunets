// scripts/createAdmin.ts
import mongoose from "mongoose";
import User from "./src/models/User";

const MONGO_URI="mongodb+srv://Fouss2025:Boni2004@cluster0.lmvpdxc.mongodb.net/sasatro?retryWrites=true&w=majority&appName=Cluster0"

async function createAdmin() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connecté à MongoDB");

    // Vérifie si admin existe déjà
    const existingAdmin = await User.findOne({ email: "admin@gmail.com" });
    if (existingAdmin) {
      console.log("⚠️ Un admin existe déjà, aucune action effectuée.");
      process.exit(0);
    }

    const admin = new User({
      email: "admin@gmail.com",
      password: "Boni2004@",   // sera hashé automatiquement
      role: "admin",
      isVerified: true
    });

    await admin.save();

    console.log("🎉 Admin créé avec succès !");
    console.log("➡️ Email : admin@gmail.com");
    console.log("➡️ Role  : admin");

    process.exit(0);
  } catch (error) {
    console.error("❌ Erreur lors de la création de l'admin :", error);
    process.exit(1);
  }
}

createAdmin();
