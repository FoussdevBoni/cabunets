// src/utils/otp.ts
import crypto from "crypto";

const OTP_LENGTH = 6;
const OTP_TTL_MINUTES = 30;

export const otp = {
  /**
   * Génère un code OTP à 6 chiffres.
   */
  generate(): string {
    const min = Math.pow(10, OTP_LENGTH - 1);
    const max = Math.pow(10, OTP_LENGTH) - 1;
    return Math.floor(min + Math.random() * (max - min + 1)).toString();
  },

  /**
   * Hache un OTP avec SHA-256.
   * On ne stocke JAMAIS l'OTP en clair en base.
   */
  hash(value: string): string {
    return crypto.createHash("sha256").update(value).digest("hex");
  },

  /**
   * Vérifie qu'un OTP correspond à son hash.
   */
  verify(value: string, hash: string): boolean {
    return this.hash(value) === hash;
  },

  /**
   * Retourne une date d'expiration dans X minutes.
   */
  expiryFromNow(minutes: number = OTP_TTL_MINUTES): Date {
    return new Date(Date.now() + minutes * 60 * 1000);
  },

  /**
   * TTL par défaut en minutes.
   */
  getDefaultTtl(): number {
    return OTP_TTL_MINUTES;
  },
};