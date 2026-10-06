// middlewares/auditLogger.ts
import { Request, Response, NextFunction } from "express";
import { AuditLog } from "../models/AuditLog";

const SENSITIVE_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);
const REDACTED_KEYS = ["password", "token", "authorization", "otp"];

function sanitize(obj: any): any {
  if (!obj || typeof obj !== "object") return obj;
  return Object.fromEntries(
    Object.entries(obj).map(([k, v]) =>
      REDACTED_KEYS.includes(k.toLowerCase()) ? [k, "[REDACTED]"] : [k, v]
    )
  );
}

export const auditLogger = (req: Request, res: Response, next: NextFunction) => {
  if (!SENSITIVE_METHODS.has(req.method)) return next();

  res.on("finish", async () => {
    // On logue seulement si c'est un admin, OU si impersonation en cours
    const isAdminAction = !!req.user?.impersonatedBy;
    if (!isAdminAction) return;

    try {
      await AuditLog.create({
        actorId: req.user!.impersonatedBy!.adminId,
        impersonatedUserId: req.user!.userId,
        action: `${req.method} ${req.baseUrl}${req.path}`,
        method: req.method,
        path: req.originalUrl,
        ip: req.ip,
        userAgent: req.get("user-agent"),
        payload: sanitize(req.body),
        status: res.statusCode,
      });
    } catch (e) {
      console.error("auditLogger error:", e);
    }
  });

  next();
};