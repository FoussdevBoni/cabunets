import express, { Application } from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import cors from "cors";
import path from "path";

import fileRoutes from "./routes/fileRoutes";
import emailRoutes from "./routes/emailRoutes";
import routes from "./routes";

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
   🔹 BODY PARSERS (APRES webhook)
===================================================== */
app.use(bodyParser.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "10mb" }));

/* =====================================================
   🔹 MONGODB
===================================================== */
mongoose
  .connect(process.env.MONGO_URI as string)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((error) =>
    console.error("❌ Error connecting to MongoDB:", error)
  );

/* =====================================================
   🔹 STATIC FILES
===================================================== */
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

/* =====================================================
   🔹 ROUTES
===================================================== */
app.use("/api", routes); // routes générales
app.use("/api/files", fileRoutes);
app.use("/api/email", emailRoutes);

/* =====================================================
   🔹 SERVER
===================================================== */
app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur le port ${PORT}`);
});

export default app;
