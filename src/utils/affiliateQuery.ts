import { ValidationError } from "./errors";
export function pagination(query: any) {
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.max(1, Math.min(100, Number(query.limit) || 20));
  if (!Number.isInteger(page) || !Number.isInteger(limit)) throw new ValidationError("Pagination invalide.");
  return { page, limit, skip: (page - 1) * limit };
}
export function period(query: any, field = "createdAt") {
  const bounds: Record<string, Date> = {};
  for (const [key, operator] of [["from", "$gte"], ["to", "$lte"]]) {
    if (!query[key]) continue;
    const date = new Date(String(query[key]) + (/^\d{4}-\d{2}-\d{2}$/.test(String(query[key])) ?
      (key === "to" ? "T23:59:59.999Z" : "T00:00:00.000Z") : ""));
    if (!Number.isFinite(date.getTime())) throw new ValidationError("Période invalide.");
    bounds[operator] = date;
  }
  if (bounds.$gte && bounds.$lte && bounds.$gte > bounds.$lte) throw new ValidationError("Période inversée.");
  return Object.keys(bounds).length ? { [field]: bounds } : {};
}
export function csvCell(value: unknown): string {
  let text = value instanceof Date ? value.toISOString() : String(value ?? "");
  if (typeof value !== "number" && /^[=+\-@\t\r]/.test(text)) text = "'" + text;
  return '"' + text.replace(/"/g, '""') + '"';
}
