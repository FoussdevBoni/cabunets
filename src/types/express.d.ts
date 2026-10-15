// src/types/express.d.ts

/**
 * Extension du type Request d'Express pour inclure `req.user`.
 * Ce fichier est chargé automatiquement par TypeScript (déclaration globale).
 */

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        role: "admin" | "client" | "vendeur";
        username: string;
        avatar?: string;
        email?: string;
        profile: any;
        impersonatedBy?: {
          adminId: string;
          adminUsername: string;
          adminEmail?: string;
        };
      };
    }
  }
}

export {};