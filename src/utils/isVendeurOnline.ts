// utils/isVendeurOnline.ts
/**
 * Détermine si un vendeur est en ligne selon ses horaires.
 * Le calcul se fait dans le fuseau du Bénin (Africa/Porto-Novo).
 */
export function computeIsOnline(
  openingTime?: string,
  closingTime?: string,
  timezone = "Africa/Porto-Novo"
): boolean {
  if (!openingTime || !closingTime) return false;

  // Récupère l'heure locale dans le fuseau choisi, peu importe le serveur
  const fmt = new Intl.DateTimeFormat("fr-FR", {
    timeZone: timezone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const parts = fmt.formatToParts(new Date());
  const nowMin =
    Number(parts.find((p) => p.type === "hour")?.value ?? "0") * 60 +
    Number(parts.find((p) => p.type === "minute")?.value ?? "0");

  const [openH, openM] = openingTime.split(":").map(Number);
  const [closeH, closeM] = closingTime.split(":").map(Number);
  const openMin = openH * 60 + openM;
  const closeMin = closeH * 60 + closeM;

  // Plage normale : 06:00 → 20:00
  if (openMin < closeMin) return nowMin >= openMin && nowMin < closeMin;

  // Plage qui traverse minuit : 22:00 → 06:00
  if (openMin > closeMin) return nowMin >= openMin || nowMin < closeMin;

  // Ouvert 24h (open === close)
  return true;
}