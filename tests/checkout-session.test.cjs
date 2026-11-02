const test = require("node:test"), assert = require("node:assert/strict");
const fs = require("node:fs"), vm = require("node:vm"), ts = require("typescript");
const { webcrypto } = require("node:crypto");
function sessionModule(storage) {
  const exports = {};
  vm.runInNewContext(ts.transpileModule(fs.readFileSync("src/utils/checkoutSession.ts", "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText,
    { exports, crypto: webcrypto, Uint8Array, sessionStorage: { getItem: k => storage.get(k) || null, setItem: (k, v) => storage.set(k, v), removeItem: k => storage.delete(k) } });
  return exports;
}
function setup() {
  const storage = new Map(), session = sessionModule(storage);
  session.writeCheckoutDraft({ offerId: "test-offer", form: { rechargePhone: "0822345678", paymentPhone: "0822345678", correspondent: "AIRTEL_COD" }, currency: "CDF" });
  const state = [], refs = []; let index = 0, refIndex = 0;
  let token = "old-token", user = { id: "buyer" }, handler, calls = [], routes = [];
  const react = { useState(initial) { const i = index++; if (!(i in state)) state[i] = typeof initial === "function" ? initial() : initial; return [state[i], value => { state[i] = typeof value === "function" ? value(state[i]) : value; }]; },
    useRef(initial) { const i = refIndex++; return refs[i] || (refs[i] = { current: initial }); }, useEffect() {} };
  const exports = {};
  const mocks = {
    react, "react-router-dom": { useNavigate: () => route => routes.push(route), useSearchParams: () => [new URLSearchParams("offer=test-offer")] },
    "../../utils/checkoutSession": session,
    "../../hooks/auth/useAuth": { useAuth: () => ({ user, setUser: v => user = v, error: null }) },
    "../../hooks/auth/useToken": { default: () => ({ token, deleteToken: () => token = undefined }), __esModule: true },
    "../../hooks/offres/useOffre": { useOffre: () => ({ offre: { units: 100, priceFC: 10000, priceUSD: 4, network: "Airtel", vendeurId: "seller", vendeurName: "Test" }, offreLoading: false }) },
    "../../hooks/vendeurs/useVendeur": { useVendeur: () => ({ vendeur: { whatsappNumber: "+243812345678" }, vendeurLoading: false }) },
    "../../services/orderService": { orderService: { create: (...args) => { calls.push(args); return handler(...args); } } },
    "../../helpers/alertError": { alertError() {} },
    "../../utils/formatRDCPhone": { formatToRDCPhone: s => s.replace(/^0/, "243") },
  };
  const code = ts.transpileModule(fs.readFileSync("src/pages/public/CheckoutPage.tsx", "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX } }).outputText;
  vm.runInNewContext(code, { exports, require: name => mocks[name] || require(name), console: { log() {}, error() {} }, URLSearchParams });
  const render = () => { index = 0; refIndex = 0; return exports.default(); };
  function button(node, label) {
    if (!node || typeof node !== "object") return null;
    if (node.type === "button" && text(node.props.children) === label) return node;
    for (const child of [node.props?.children].flat(Infinity)) { const match = button(child, label); if (match) return match; }
    return null;
  }
  function text(node) { if (node == null || typeof node === "boolean") return ""; if (typeof node !== "object") return String(node); if (Array.isArray(node)) return node.map(text).join(""); return text(node.props?.children); }
  function click(label) { const node = button(render(), label); assert.ok(node, "Button absent: " + label); return node.props.onClick({ preventDefault() {} }); }
  return { session, storage, calls, routes, render, click, setHandler: h => handler = h, getToken: () => token, text, action: label => button(render(), label).props.onClick };
}
test("a 401 preserves the form, removes the invalid token, and never silently retries as a guest", async () => {
  const app = setup();
  app.setHandler(async () => { throw { response: { status: 401, data: { message: "Session invalide. Veuillez vous reconnecter." } } }; });
  app.click("Continuer"); await app.click("Confirmer");
  assert.equal(app.getToken(), undefined);
  assert.equal(app.calls.length, 1);
  assert.match(app.text(app.render()), /Session invalide/);
  const draft = app.session.readCheckoutDraft("test-offer");
  assert.equal(draft.form.paymentPhone, "0822345678");
  assert.equal(draft.sessionNeeded, true);
  app.click("Continuer comme invité");
  assert.equal(app.calls.length, 1);
  app.setHandler(async () => ({ success: true, order: { _id: "existing-order" } }));
  app.click("Continuer"); await app.click("Confirmer");
  assert.equal(app.calls[1][1], undefined);
  assert.equal(app.calls[1][0].clientId, undefined);
  assert.equal(app.routes.at(-1), "/order-pending?orderId=existing-order");
});
test("reconnection retains the checkout and uses only a local return destination", async () => {
  const app = setup();
  app.setHandler(async () => { throw { response: { status: 401, data: { message: "Session invalide" } } }; });
  app.click("Continuer"); await app.click("Confirmer"); app.click("Me reconnecter");
  assert.equal(app.routes.at(-1), "/login?returnTo=%2Fcheckout%3Foffer%3Dtest-offer");
  assert.equal(app.session.readCheckoutDraft("test-offer").form.rechargePhone, "0822345678");
  assert.equal(app.session.safeCheckoutReturn("https://evil.invalid"), null);
  assert.equal(app.session.safeCheckoutReturn("//evil.invalid"), null);
});
test("double confirmation sends once and a lost response reuses its idempotency key", async () => {
  const app = setup(); let reject;
  app.setHandler(() => new Promise((_, no) => reject = no));
  app.click("Continuer");
  const confirm = app.action("Confirmer");
  const first = confirm(), second = confirm();
  assert.equal(app.calls.length, 1);
  reject(new Error("Network unavailable")); await Promise.all([first, second]);
  const firstKey = app.calls[0][2]; assert.ok(firstKey.length >= 16);
  app.setHandler(async () => ({ success: true, order: { _id: "recovered-order" } }));
  await app.click("Confirmer");
  assert.equal(app.calls[1][2], firstKey);
  assert.equal(app.routes.at(-1), "/order-pending?orderId=recovered-order");
});
test("a known order in an error response goes to tracking instead of starting another payment", async () => {
  const app = setup();
  app.setHandler(async () => { throw { response: { status: 400, data: { error: "Paiement rejeté", order: { _id: "known-order" } } } }; });
  app.click("Continuer"); await app.click("Confirmer");
  assert.equal(app.calls.length, 1); assert.equal(app.routes.at(-1), "/order-pending?orderId=known-order");
});
