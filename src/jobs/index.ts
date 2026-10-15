// src/jobs/index.ts
import { registerProcessDueCommissionsJob } from "./processDueCommissionsJob";

/**
 * Enregistre tous les cron jobs de l'application.
 * À appeler UNE SEULE FOIS au démarrage du serveur.
 */
export function registerAllJobs() {
  console.log("🕐 Enregistrement des cron jobs...");

  registerProcessDueCommissionsJob();

  console.log("✅ Tous les cron jobs sont enregistrés");
}