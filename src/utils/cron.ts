// src/utils/cron.ts
import cron from "node-cron";

export interface CronJobOptions {
  name: string;
  schedule: string;      // format cron (ex: "0 * * * *")
  handler: () => Promise<void>;
}

export function registerCronJob(options: CronJobOptions) {
  const { name, schedule, handler } = options;

  cron.schedule(schedule, async () => {
    const startedAt = new Date();
    console.log(`⏰ [${name}] Démarrage à ${startedAt.toISOString()}`);

    try {
      await handler();
      const finishedAt = new Date();
      const duration = finishedAt.getTime() - startedAt.getTime();
      console.log(`✅ [${name}] Terminé en ${duration}ms`);
    } catch (err) {
      console.error(`❌ [${name}] Erreur :`, err);
    }
  });

  console.log(`📅 Job enregistré : ${name} (${schedule})`);
}