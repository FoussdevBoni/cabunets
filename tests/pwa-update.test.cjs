const test = require("node:test"), assert = require("node:assert/strict");
const fs = require("node:fs"), vm = require("node:vm"), ts = require("typescript");
test("a PWA update never reloads a checkout automatically and requires a click elsewhere", async () => {
  let pathname = "/checkout", reloads = 0;
  const exports = {};
  const code = ts.transpileModule(fs.readFileSync("src/components/pwa/PwaUpdateNotice.tsx", "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX }
  }).outputText;
  const mocks = {
    react: { useState: value => [value, () => {}], useEffect() {} },
    "react-router-dom": { useLocation: () => ({ pathname }) },
    "virtual:pwa-register": { registerSW(options) { options.onNeedRefresh(); return async () => { reloads++; }; } }
  };
  vm.runInNewContext(code, { exports, require: name => mocks[name] || require(name) });
  const button = node => {
    if (!node || typeof node !== "object") return;
    if (node.type === "button") return node;
    for (const child of [node.props?.children].flat(Infinity)) { const result = button(child); if (result) return result; }
  };
  assert.equal(button(exports.default()).props.disabled, true); assert.equal(reloads, 0);
  pathname = "/order-pending"; assert.equal(button(exports.default()).props.disabled, true);
  pathname = "/client/orders";
  const ready = button(exports.default()); assert.equal(ready.props.disabled, false);
  assert.equal(reloads, 0); await ready.props.onClick(); assert.equal(reloads, 1);
});