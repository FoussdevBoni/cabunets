export const CHECKOUT_DRAFT_KEY = "cabunets.checkout.v1";
export function readCheckoutDraft(offerId: string | null): any {
  try { const value = JSON.parse(sessionStorage.getItem(CHECKOUT_DRAFT_KEY) || "null");
    return value?.offerId === offerId ? value : null; } catch { return null; }
}
export function writeCheckoutDraft(value: any) {
  try { sessionStorage.setItem(CHECKOUT_DRAFT_KEY, JSON.stringify(value)); } catch {}
}
export function clearCheckoutDraft() { try { sessionStorage.removeItem(CHECKOUT_DRAFT_KEY); } catch {} }
export function createCheckoutKey() {
  const bytes = crypto.getRandomValues(new Uint8Array(24));
  return Array.from(bytes, byte => byte.toString(16).padStart(2, "0")).join("");
}
export function apiErrorMessage(error: any, fallback: string) {
  const body = error?.response?.data;
  return (typeof body?.message === "string" && body.message) ||
    (typeof body?.error === "string" && body.error) || fallback;
}
export function safeCheckoutReturn(value: string | null) {
  return value?.startsWith("/checkout?") && !value.includes("\\") ? value : null;
}
