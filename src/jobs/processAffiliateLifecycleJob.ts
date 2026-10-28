import { affiliateAdminService } from "../services/metier/affiliateAdminService";
import { registerCronJob } from "../utils/cron";
import { affiliateLifecycleService } from "../services/metier/affiliateLifecycleService";
let running = false;
export function registerAffiliateLifecycleJob() {
  registerCronJob({ name: "affiliate-reconciliation", schedule: "*/5 * * * *", handler: async () => {
    if (running) return;
    running = true;
    try { await affiliateLifecycleService.reconcile(); await affiliateAdminService.scan(); } finally { running = false; }
  } });
}
