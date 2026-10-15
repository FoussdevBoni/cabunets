// src/utils/codeGenerator.ts
import crypto from "crypto";

const CODE_PREFIX = "AFF-";
const CODE_LENGTH = 6;         // partie aléatoire
const MAX_ATTEMPTS = 10;

/**
 * Génère un code aléatoire du type "AFF-XXXXXX".
 * Ne vérifie PAS l'unicité en base — c'est au caller de le faire.
 */
function generateRandomCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // sans I, O, 0, 1 (ambigus)
  let result = "";
  const bytes = crypto.randomBytes(CODE_LENGTH);

  for (let i = 0; i < CODE_LENGTH; i++) {
    result += chars[bytes[i] % chars.length];
  }

  return CODE_PREFIX + result;
}

export const codeGenerator = {
  /**
   * Génère un code unique en vérifiant l'unicité via un callback.
   *
   * @param isTaken - fonction async qui retourne true si le code existe déjà
   * @returns un code unique garanti
   * @throws Error si impossible après MAX_ATTEMPTS essais
   */
  async generateUnique(
    isTaken: (code: string) => Promise<boolean>
  ): Promise<string> {
    for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
      const code = generateRandomCode();
      const taken = await isTaken(code);
      if (!taken) return code;
    }

    throw new Error(
      `Impossible de générer un code unique après ${MAX_ATTEMPTS} tentatives`
    );
  },

  /**
   * Génère un code aléatoire sans vérification d'unicité.
   * Utile pour les tests.
   */
  generateRandom(): string {
    return generateRandomCode();
  },

  /**
   * Vérifie qu'un code a le bon format.
   */
  isValid(code: string): boolean {
    if (!code) return false;
    return /^AFF-[A-Z0-9]{6}$/.test(code);
  },
};