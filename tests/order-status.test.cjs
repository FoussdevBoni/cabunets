const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs"), path = require("node:path"), vm = require("node:vm"), ts = require("typescript");
const React = require("react"), { renderToStaticMarkup } = require("react-dom/server");
function load(file) {
  const exports = {};
  const source = ts.transpileModule(fs.readFileSync(file, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true } }).outputText;
  vm.runInNewContext(source, { exports, require: name => name.startsWith(".") ? load(path.resolve(path.dirname(file), name + ".ts")) : require(name) }, { filename: file });
  return exports;
}
const policy = load("src/utils/orderStatus.ts");
test("order lifecycle labels and eligible actions distinguish all six server statuses", () => {
  const expected = [["PENDING", "En attente", true, true, false], ["COMPLETED", "Payée", false, false, true], ["DELIVERED", "Livrée", false, false, false], ["FAILED", "Échouée", false, true, false], ["CANCELLED", "Annulée", false, false, false], ["REFUNDED", "Remboursée", false, false, false]];
  for (const [status, label, process, cancel, deliver] of expected) {
    assert.equal(policy.getOrderStatusLabel(status.toLowerCase()), label);
    assert.equal(policy.canProcessOrder(status), process);
    assert.equal(policy.canCancelOrder(status), cancel);
    assert.equal(policy.canDeliverOrder(status), deliver);
  }
  assert.equal(policy.getOrderStatusLabel("UNKNOWN"), "Statut inconnu");
  assert.equal(policy.canProcessOrder("UNKNOWN"), false);
  assert.equal(policy.canCancelOrder(undefined), false);
});
test("a refunded order card cannot offer payment processing even with an outdated pending flag", () => {
  const { OrderCard } = load("src/components/features/orders/OrderCard.tsx");
  const html = renderToStaticMarkup(React.createElement(OrderCard, { order: { id: "fake", status: "REFUNDED", price: 100, currency: "CDF", createdAt: "2026-10-28" }, isPending: true, isProcessing: false, onTraitOrder() {}, onViewDetails() {} }));
  assert.match(html, /Remboursée/);
  assert.doesNotMatch(html, /Traiter|Forcer traitement/);
});