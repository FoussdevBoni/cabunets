// src/jobs/processDueCommissionsJob.ts
import { commissionService } from "../services/metier/commissionService";
import { registerCronJob } from "../utils/cron";

export function registerProcessDueCommissionsJob() {
  registerCronJob({
    name: "process-due-commissions",
    schedule: "0 * * * *", // toutes les heures, à la minute 0
    handler: async () => {
      const result = await commissionService.processDueCommissions();

      console.log(
        `💸 ${result.modifiedCount} commission(s) passée(s) à "disponible"`
      );
    },
  });
}