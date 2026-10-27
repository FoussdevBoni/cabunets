const KEY = "cabunets.referral";
const MAX_AGE = 30 * 24 * 60 * 60 * 1000;
export function captureReferral(): string | undefined {
  const candidate = new URLSearchParams(window.location.search).get("ref")?.trim().toUpperCase();
  try {
    const existing = JSON.parse(localStorage.getItem(KEY) || "null");
    if (existing && Date.now() - existing.at < MAX_AGE && /^[A-Z0-9-]{4,20}$/.test(existing.code)) return existing.code;
    if (candidate && /^[A-Z0-9-]{4,20}$/.test(candidate)) {
      localStorage.setItem(KEY, JSON.stringify({ code: candidate, at: Date.now() }));
      return candidate;
    }
    localStorage.removeItem(KEY);
  } catch { return candidate && /^[A-Z0-9-]{4,20}$/.test(candidate) ? candidate : undefined; }
  return undefined;
}
export function clearReferral() { localStorage.removeItem(KEY); }

export function setReferralCode(value: string) {
  const code = value.trim().toUpperCase();
  if (code) localStorage.setItem(KEY, JSON.stringify({ code, at: Date.now() }));
  else clearReferral();
}
