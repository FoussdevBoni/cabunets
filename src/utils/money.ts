// src/utils/money.ts

export const DEFAULT_CURRENCY = "CDF";

/**
 * Arrondit un montant à N décimales.
 */
export function round(amount: number, decimals: number = 2): number {
  const factor = Math.pow(10, decimals);
  return Math.round(amount * factor) / factor;
}

/**
 * Applique un pourcentage à un montant.
 */
export function applyPercentage(amount: number, percentage: number): number {
  return round((amount * percentage) / 100);
}

/**
 * Calcule une commission hybride (fixe + pourcentage).
 */
export function applyHybrid(
  amount: number,
  fixedPart: number,
  percentage: number
): number {
  return round(fixedPart + applyPercentage(amount, percentage));
}

/**
 * Plafonne un montant.
 */
export function applyCap(amount: number, cap?: number): number {
  if (cap === undefined || cap === null) return amount;
  return amount > cap ? cap : amount;
}

/**
 * Formate un montant pour l'affichage.
 * Ex: 1500 → "1 500 CDF"
 */
export function format(
  amount: number,
  currency: string = DEFAULT_CURRENCY
): string {
  const formatted = new Intl.NumberFormat("fr-FR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
  return `${formatted} ${currency}`;
}

export const money = {
  round,
  applyPercentage,
  applyHybrid,
  applyCap,
  format,
  DEFAULT_CURRENCY,
};