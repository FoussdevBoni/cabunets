// utils/formatPhone.ts

/**
 * Normalise un numéro de téléphone :
 * - supprime tous les caractères non numériques (espaces, +, tirets, parenthèses, points...)
 * - supprime le préfixe "00" s'il est présent
 *
 * @example
 * formatPhone("+243 815 625 169")   // "243815625169"
 * formatPhone("00243 815 625 169")  // "243815625169"
 * formatPhone("+243-815-625-169")   // "243815625169"
 * formatPhone(null)                 // ""
 */
export const formatPhone = (phone?: string | null): string => {
  if (!phone) return "";

  let digits = phone.replace(/\D/g, "");

  if (digits.startsWith("00")) {
    digits = digits.slice(2);
  }

  return digits;
};