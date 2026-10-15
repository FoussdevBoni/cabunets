import express, { Application } from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";

import fileRoutes from "./routes/utilitaires/fileRoutes";
import emailRoutes from "./routes/utilitaires/emailRoutes";
import routes from "./routes";
import { registerAllJobs } from "./jobs";

// Charger variables d'environnement
dotenv.config();

// Créer app Express
const app: Application = express();
const PORT = process.env.PORT || 3000;

/* =====================================================
   🔹 CORS
===================================================== */
app.use(cors());

/* =====================================================
   🔹 BODY PARSERS
   (Express 4.16+ inclut body-parser nativement)
===================================================== */
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

/* =====================================================
   🔹 ROUTES
===================================================== */
app.use("/api", routes);
app.use("/api/files", fileRoutes);
app.use("/api/email", emailRoutes);

/* =====================================================
   🔹 MONGODB + CRON JOBS + SERVER
===================================================== */
mongoose
  .connect(process.env.MONGO_URI as string)
  .then(() => {
    console.log("✅ Connected to MongoDB");

    // Enregistrer les cron jobs APRÈS la connexion DB
    registerAllJobs();

    // Démarrer le serveur APRÈS la connexion DB
    app.listen(PORT, () => {
      console.log(`🚀 Serveur démarré sur le port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("❌ Error connecting to MongoDB:", error);
    process.exit(1);
  });

export default app;