
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const ts = require("typescript");
function setup() {
 const storage = new Map();
 const window = { location: { search: "" } };
 const localStorage = { getItem: key => storage.get(key) ?? null,
   setItem: (key, value) => storage.set(key, value), removeItem: key => storage.delete(key) };
 const exports = {};
 const source = ts.transpileModule(fs.readFileSync("src/utils/referral.ts", "utf8"),
  { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
 vm.runInNewContext(source, { exports, window, localStorage, URLSearchParams, Date, JSON });
 return { ...exports, window, storage };
}
test("incoming referral survives navigation and retains the first code", () => {
 const state = setup();
 state.window.location.search = "?ref=aff-1234";
 assert.equal(state.captureReferral(), "AFF-1234");
 state.window.location.search = "";
 assert.equal(state.captureReferral(), "AFF-1234");
 state.window.location.search = "?ref=AFF-5678";
 assert.equal(state.captureReferral(), "AFF-1234");
 state.clearReferral();
 assert.equal(state.captureReferral(), "AFF-5678");
});
test("expired or invalid referral codes are not attributed", () => {
 const state = setup();
 state.window.location.search = "?ref=<invalid>";
 assert.equal(state.captureReferral(), undefined);
 state.storage.set("cabunets.referral", JSON.stringify({ code: "AFF-1234", at: Date.now() - 31 * 86400000 }));
 state.window.location.search = "";
 assert.equal(state.captureReferral(), undefined);
});
