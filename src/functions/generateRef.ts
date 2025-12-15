export function generateOrderRef(id: string , date: string): string {
  const datePart = date.slice(0, 10).replace(/-/g, ""); // YYYYMMDD
  const idPart = id.slice(-6).toUpperCase(); // Derniers caractères significatifs
  return `${datePart}-${idPart}`;
}
