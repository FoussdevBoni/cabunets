const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { createRequire } = require("node:module");
const ts = require("typescript");

test("Cabunets frontend contracts against the actual shared backend, with isolated data and simulated providers", { timeout: process.env.CABUNETS_UI_HOLD === "1" ? 1800000 : 600000 }, async t => {
  const backend = path.resolve(process.env.CABUNETS_BACKEND_DIR || "../backend");
  assert.ok(fs.existsSync(path.join(backend, "src/models/Order.ts")), "Set CABUNETS_BACKEND_DIR to the backend checkout");
  const backendRequire = createRequire(path.join(backend, "package.json"));
  process.env.NODE_ENV = "test";
  process.env.JWT_SECRET = "cabunets-contract-test-secret-not-for-production";
  process.env.INTERNAL_SHARED_SECRET = "cabunets-contract-gateway-test";
  process.env.AFFILIATE_DESTINATION_KEY = "33".repeat(32);
  process.env.SUPABASE_URL = "https://example.supabase.co";
  process.env.SUPABASE_SERVICE_ROLE_KEY = "isolated-contract-test";
  backendRequire("ts-node").register({ transpileOnly: true, project: path.join(backend, "tsconfig.json"), compilerOptions: { module: "CommonJS", moduleResolution: "node" } });
  const { MongoMemoryReplSet } = backendRequire("mongodb-memory-server");
  const mongoose = backendRequire("mongoose");
  const repl = await MongoMemoryReplSet.create({ instanceOpts: [{ launchTimeout: 60000 }], replSet: { count: 1, storageEngine: "wiredTiger" } });
  const uri = repl.getUri("cabunets_frontend_contracts");
  assert.match(uri, /^mongodb:\/\/127\.0\.0\.1:/);
  process.env.MONGO_URI = uri;
  let server;
  try {
    await mongoose.connect(uri);
    const get = file => backendRequire(path.join(backend, "src", file));
    const providerAxios = backendRequire("axios");
    providerAxios.defaults.adapter = async () => { throw new Error("External network forbidden in compatibility tests"); };
    t.mock.method(get("services/providers/smtpService.ts").smtpService, "send", async () => {});
    t.mock.method(get("services/providers/cabupayWhatsappService.ts").cabupayWhatsappService, "notifyNewOrder", async () => {});
    const payment = get("services/providers/cabupayPaymentService.ts").cabupayPaymentService;
    let sequence = 0;
    t.mock.method(payment, "createDeposit", async () => ({ success: true, data: { depositId: "simulated-" + (++sequence), status: "PENDING" } }));
    t.mock.method(payment, "getDeposit", async () => ({ data: { data: { status: "COMPLETED" } } }));
    const express = backendRequire("express");
    const app = express(); app.use(backendRequire("cors")()); app.use(express.json());
    for (const name of ["auth", "orders", "settings", "affiliateAdmin", "payment", "offre", "vendeur"]) {
      const prefix = { affiliateAdmin: "affiliate-admin", payment: "payments", offre: "offres", vendeur: "vendeurs" }[name] || name;
      app.use("/api/" + prefix, get("routes/metier/" + (name === "orders" ? "order" : name) + "Routes.ts").default);
    }
    const User = get("models/User.ts").default;
    const { Admin } = get("models/Admin.ts");
    const { Order } = get("models/Order.ts");
    const { Setting } = get("models/Setting.ts");
    for (const model of Object.values(mongoose.models)) await model.init();
    server = app.listen(process.env.CABUNETS_UI_HOLD === "1" ? 3109 : 0, "127.0.0.1");
    await new Promise(resolve => server.on("listening", resolve));
    const base = "http://127.0.0.1:" + server.address().port + "/api";

    // Execute the real frontend services. Only the API origin and external UI alerts are substituted.
    const cache = new Map();
    const axios = require("axios").create({ maxRedirects: 0 });
    axios.interceptors.request.use(config => {
      assert.ok(config.url.startsWith(base + "/"), "Frontend request must stay on the isolated API");
      return config;
    });
    const localStorage = { getItem: () => null };
    function load(relative) {
      const file = path.resolve(relative);
      if (cache.has(file)) return cache.get(file);
      const exports = {};
      const compiled = ts.transpileModule(fs.readFileSync(file, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true } }).outputText;
      const requireLocal = name => {
        if (name === "axios") return axios;
        if (name.endsWith("/utils/api")) return { API_URL: base };
        if (name.endsWith("/helpers/alertError")) return { alertError: () => {} };
        if (name === "./dataService") return load("src/services/dataService.ts");
        throw new Error("Unexpected dependency: " + name);
      };
      vm.runInNewContext(compiled, { exports, require: requireLocal, console, localStorage, URLSearchParams }, { filename: file });
      cache.set(file, exports); return exports;
    }
    const orderService = load("src/services/orderService.ts").orderService;
    const settingService = load("src/services/settingService.ts").settingService;
    const policy = load("src/utils/orderStatus.ts");
    async function api(route, method = "GET", body, token, signature) {
      const response = await fetch(base + route, { method, headers: { "Content-Type": "application/json", ...(token ? { Authorization: "Bearer " + token } : {}), ...(signature ? { "x-gateway-signature": signature } : {}) }, body: body === undefined ? undefined : JSON.stringify(body) });
      return { status: response.status, data: await response.json() };
    }
    const admin = await User.create({ email: "admin@compat.invalid", password: "ContractTest123", role: "admin" });
    await Admin.create({ _id: admin._id });
    const adminToken = (await api("/auth/login", "POST", { email: admin.email, password: "ContractTest123" })).data.token;
    async function signup(role, suffix) {
      const response = await api("/auth/register", "POST", { email: suffix + "@compat.invalid", password: "ContractTest123", role, username: suffix, profileData: { whatsappNumber: "+243812345678", paymentAmount: 0 } });
      assert.equal(response.status, 201, JSON.stringify(response.data)); return response.data;
    }
    const buyer = await signup("client", "buyer");
    const seller = await signup("vendeur", "seller");
    const unrelated = await signup("vendeur", "other-seller");
    const { Offre } = get("models/Offre.ts");
    const offer = await Offre.create({ vendeurId: seller.user.id, vendeurName: "Vendeur fictif", units: 100, network: "Airtel", priceFC: 10000, priceUSD: 4 });
    const payload = { vendeurId: seller.user.id, vendeurName: "Vendeur fictif", vendeurPhone: "+243812345678", offerId: "fixture-offer", phoneNumber: "+243822345678", paymentPhone: "+243822345678", units: 100, price: 10000, currency: "CDF", network: "Airtel", correspondent: "AIRTEL_COD" };
    let orderId;
    await t.test("authenticated checkout is linked to its buyer and ignores forged client identifiers", async () => {
      const created = await orderService.create({ ...payload, clientId: unrelated.user.id }, buyer.token);
      assert.equal(created.success, true);
      orderId = created.order._id;
      assert.equal((await Order.findById(orderId)).clientId, buyer.user.id);
      const listing = await orderService.getAllPaginated({ clientId: buyer.user.id }, buyer.token);
      assert.ok(listing.data.some(order => order._id === orderId));
    });
    await t.test("guest checkout still works without attributing a forged account", async () => {
      const created = await orderService.create({ ...payload, clientId: buyer.user.id });
      assert.equal(created.success, true);
      assert.ok(!(await Order.findById(created.order._id)).clientId);
    });
    await t.test("Cabupay unsigned or incorrect callbacks leave payment pending; a correct callback confirms it", async () => {
      const body = { clientReference: orderId, depositId: (await Order.findById(orderId)).depositId, status: "COMPLETED" };
      assert.equal((await api("/payments/cabupay-callback", "POST", body)).status, 401);
      assert.equal((await api("/payments/cabupay-callback", "POST", body, undefined, "wrong")).status, 401);
      assert.equal((await Order.findById(orderId)).status, "PENDING");
      assert.equal((await api("/payments/cabupay-callback", "POST", body, undefined, process.env.INTERNAL_SHARED_SECRET)).status, 200);
      assert.equal((await orderService.syncOrderStatus(orderId)).order.status, "COMPLETED");
    });
    await t.test("only the actual seller can deliver; a late callback cannot undo delivery", async () => {
      await assert.rejects(orderService.deliverOrder(unrelated.token, orderId), error => error.response.status === 403);
      const delivered = await orderService.deliverOrder(seller.token, orderId);
      assert.equal(delivered.order.status, "DELIVERED");
      await api("/payments/cabupay-callback", "POST", { clientReference: orderId, status: "FAILED" }, undefined, process.env.INTERNAL_SHARED_SECRET);
      assert.equal((await orderService.syncOrderStatus(orderId)).order.status, "DELIVERED");
    });
    await t.test("admin settings send authentication and preserve server role checks", async () => {
      await assert.rejects(settingService.updateCommission(4), /connecter/);
      await assert.rejects(settingService.updateCommission(4, buyer.token), error => /administrateur|réservé|interdit|autoris/i.test(error.message || error.error || ""));
      await settingService.updateCommission(4, adminToken);
      await settingService.updateExchangeRate("USD", 1, adminToken);
      await settingService.updateDefaultCurrency("CDF", adminToken);
      await settingService.updateWithdrawalLimits(5000, 500000, adminToken);
      const current = await settingService.getSettings();
      assert.equal(current.data.commissionRate, 4);
      assert.equal(current.data.minWithdrawalAmount, 5000);
    });
    await t.test("cancellation retains history and paid sales require the refund path", async () => {
      const created = await orderService.create(payload, buyer.token);
      assert.equal(policy.canCancelOrder(created.order.status), true);
      await orderService.delete(created.order._id, adminToken);
      const cancelled = await orderService.syncOrderStatus(created.order._id);
      assert.equal(cancelled.order.status, "CANCELLED");
      assert.equal(policy.getOrderStatusLabel(cancelled.order.status), "Annulée");
      assert.equal(policy.canProcessOrder(cancelled.order.status), false);
      assert.equal(policy.canDeliverOrder(cancelled.order.status), false);
      assert.equal(policy.canCancelOrder("DELIVERED"), false);
      assert.equal((await Order.findById(orderId)).status, "DELIVERED");
      const refunded = await api("/affiliate-admin/orders/" + orderId + "/refund", "POST", { reason: "Remboursement simulé", reference: "SIMULATED-REFUND-ONLY" }, adminToken);
      assert.equal(refunded.status, 200, JSON.stringify(refunded.data));
      const result = await orderService.syncOrderStatus(orderId);
      assert.equal(result.order.status, "REFUNDED");
      assert.equal(policy.getOrderStatusLabel(result.order.status), "Remboursée");
      assert.equal(policy.canProcessOrder(result.order.status), false);
      assert.equal(policy.canDeliverOrder(result.order.status), false);
    });
    if (process.env.CABUNETS_UI_HOLD === "1") {
      const marker = path.join(require("node:os").tmpdir(), "cabunets-compat-ui.json");
      fs.writeFileSync(marker, JSON.stringify({ api: base, email: admin.email, password: "ContractTest123", buyer: buyer.user.email, seller: seller.user.email, offerId: String(offer._id), refundedOrderId: orderId }));
      console.log("Isolated UI fixture ready on port 3109; remove its temporary marker to stop.");
      const deadline = Date.now() + 900000;
      while (fs.existsSync(marker) && Date.now() < deadline) await new Promise(resolve => setTimeout(resolve, 1000));
      if (fs.existsSync(marker)) fs.unlinkSync(marker);
    }
  } finally {
    if (server) await new Promise(resolve => { server.closeAllConnections?.(); server.close(resolve); });
    await mongoose.disconnect();
    await repl.stop();
  }
});
