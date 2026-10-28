import { Router, Request, Response } from "express";
import { once } from "events";
import { authMiddleware } from "../../middlewares/authMiddleware";
import { auditLogger } from "../../middlewares/auditLogger";
import { affiliateAdminService } from "../../services/metier/affiliateAdminService";
import { affiliateSettingsService } from "../../services/metier/affiliateSettingsService";
import { affiliateLifecycleService } from "../../services/metier/affiliateLifecycleService";
import { Commission } from "../../models/Commission";
import { RewardWithdrawal } from "../../models/RewardWithdrawal";
import { Referral } from "../../models/Referral";
import { period, csvCell } from "../../utils/affiliateQuery";

const router = Router();
router.use(authMiddleware, (req, res, next) => {
  if (req.user?.role !== "admin") return res.status(403).json({ message: "Accès réservé aux administrateurs." });
  next();
}, auditLogger);

const handle = (action: (req: Request) => Promise<any>) => async (req: Request, res: Response) => {
  try { res.json({ data: await action(req) }); }
  catch (error: any) { res.status(error.statusCode ?? (error.name === "CastError" ? 400 : 500))
    .json({ message: error.statusCode ? error.message : "Impossible de traiter la demande." }); }
};
router.get("/overview", handle(req => affiliateAdminService.overview(req.query)));
router.get("/audit", handle(req => affiliateAdminService.audit(req.query)));
router.get("/issues", handle(req => affiliateAdminService.issues(req.query)));
router.post("/issues/scan", handle(() => affiliateAdminService.scan()));
router.post("/issues/:id/resolve", handle(req => affiliateAdminService.resolveIssue(req.params.id, req.body.reason, req.user!.userId)));
router.post("/reconcile", handle(async () => ({
  ...await affiliateLifecycleService.reconcile(), ...await affiliateAdminService.scan()
})));
router.post("/adjustments", handle(req => affiliateAdminService.adjustment(req.body)));
router.get("/settings", handle(() => affiliateSettingsService.get()));
router.put("/settings", handle(req => affiliateSettingsService.update(req.body.minWithdrawalAmount, req.user!.userId)));
router.get("/sellers", handle(req => affiliateAdminService.sellers(req.query)));
router.post("/sellers/:id/approve", handle(req => affiliateLifecycleService.approveSeller(req.params.id, req.user!.userId)));
router.post("/orders/:id/cancel", handle(req => affiliateLifecycleService.reverseOrder(req.params.id, "CANCELLED", req.body.reason)));
router.post("/orders/:id/refund", handle(req => affiliateLifecycleService.reverseOrder(req.params.id, "REFUNDED", req.body.reason, req.body.reference)));

router.get("/exports/:kind", async (req, res) => {
  try {
    const fields: Record<string, string[]> = {
      commissions: ["_id", "affiliateId", "referralId", "program", "sourceId", "qualifyingOrderId", "amount", "currency", "status", "createdAt"],
      withdrawals: ["_id", "affiliateId", "amount", "currency", "status", "channel", "maskedDestination", "externalReference", "createdAt"],
      referrals: ["_id", "affiliateId", "filleulId", "type", "codeUtilise", "attributedAt"],
    };
    const columns = fields[req.params.kind];
    if (!columns) return res.status(400).json({ message: "Type d'export invalide." });
    const filter = period(req.query, req.params.kind === "referrals" ? "attributedAt" : "createdAt");
    const models: Record<string, any> = { commissions: Commission, withdrawals: RewardWithdrawal, referrals: Referral };
    const cursor = models[req.params.kind].find(filter).select(columns.join(" ")).sort({ _id: 1 }).lean().cursor();
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", 'attachment; filename="' + req.params.kind + '.csv"');
    res.write("\uFEFF" + columns.map(csvCell).join(";") + "\r\n");
    for await (const record of cursor) {
      if (res.destroyed) break;
      if (!res.write(columns.map(key => csvCell(record[key])).join(";") + "\r\n")) await once(res, "drain");
    }
    res.end();
  } catch {
    if (!res.headersSent) res.status(500).json({ message: "Export impossible." });
    else res.end();
  }
});
export default router;
