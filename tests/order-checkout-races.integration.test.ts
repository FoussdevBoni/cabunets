import test from "node:test";
import assert from "node:assert/strict";
import mongoose from "mongoose";
import { MongoMemoryReplSet } from "mongodb-memory-server";
import express from "express";
import jwt from "jsonwebtoken";

test("checkout races and notification deduplication on an isolated database", { timeout: 600000 }, async t => {
  process.env.NODE_ENV = "test";
  process.env.JWT_SECRET = "new-checkout-regression-secret-not-production";
  process.env.INTERNAL_SHARED_SECRET = "gateway-regression-only";
  const repl = await MongoMemoryReplSet.create({ instanceOpts: [{ launchTimeout: 60000 }],
    replSet: { count: 1, storageEngine: "wiredTiger" } });
  const uri = repl.getUri("checkout_regression");
  assert.match(uri, /^mongodb:\/\/127\.0\.0\.1:/);
  let server: any;
  try {
    await mongoose.connect(uri);
    const axios = (await import("axios")).default;
    axios.defaults.adapter = async () => { throw Error("External network blocked"); };
    const { Order } = await import("../src/models/Order");
    const { Client } = await import("../src/models/Client");
    const User = (await import("../src/models/User")).default;
    const { cabupayPaymentService: payment } = await import("../src/services/providers/cabupayPaymentService");
    const { cabupayWhatsappService: whatsapp } = await import("../src/services/providers/cabupayWhatsappService");
    const { orderService } = await import("../src/services/metier/orderService");
    const { OrderNotificationService } = await import("../src/services/metier/orderNotificationService");
    const app = express(); app.use(express.json());
    app.use("/api/orders", (await import("../src/routes/metier/orderRoutes")).default);
    app.use("/api/payments", (await import("../src/routes/metier/paymentRoutes")).default);
    await Promise.all([Order.init(), User.init(), Client.init()]);
    server = app.listen(0, "127.0.0.1");
    await new Promise<void>(resolve => server.on("listening", resolve));
    const base = "http://127.0.0.1:" + server.address().port + "/api";
    const user = await User.create({ email: "buyer@regression.invalid", password: "TestPassword123", role: "client" });
    await Client.create({ _id: user._id, whatsappNumber: "+243822345678" });
    const token = jwt.sign({ id: String(user._id), role: "client" }, process.env.JWT_SECRET!);
    const oldToken = jwt.sign({ id: String(user._id), role: "client" }, "old-key-no-longer-valid");
    let gatewayCalls = 0, outgoing = 0;
    let initialize: (dto: any) => Promise<any> = async () => ({ success: true, data: { depositId: "fake-deposit", status: "PENDING" } });
    let notify: () => Promise<boolean> = async () => true;
    t.mock.method(payment, "createDeposit", async dto => { gatewayCalls++; return initialize(dto); });
    t.mock.method(payment, "getDeposit", async () => ({ data: { data: { status: "COMPLETED" } } }) as any);
    t.mock.method(whatsapp, "notifyNewOrder", async () => { outgoing++; return notify(); });
    const payload = { phoneNumber: "+243822345678", paymentPhone: "+243822345678", units: 100, price: 100,
      currency: "CDF", network: "Airtel", offerId: "test-offer", vendeurId: "test-seller",
      vendeurName: "Fictif", vendeurPhone: "+243812345678", correspondent: "AIRTEL_COD" };
    async function request(path: string, body: any, headers: any = {}) {
      const response = await fetch(base + path, { method: "POST", headers: { "Content-Type": "application/json", ...headers },
        body: JSON.stringify(body) });
      return { status: response.status, body: await response.json() as any };
    }
    const checkout = (key: string, auth?: string, fields: any = {}) => request("/orders",
      { ...payload, ...fields }, { "Idempotency-Key": key, ...(auth ? { Authorization: "Bearer " + auth } : {}) });
    const callback = (id: string, status = "COMPLETED") => request("/payments/cabupay-callback",
      { clientReference: id, depositId: "fake-deposit", status }, { "x-gateway-signature": "gateway-regression-only" });

    await t.test("old sessions get 401 before any payment; guest and authenticated checkout remain separate", async () => {
      const before = gatewayCalls;
      const denied = await checkout("regression-old-session-001", oldToken);
      assert.equal(denied.status, 401);
      assert.match(denied.body.message, /Session invalide/);
      assert.equal(gatewayCalls, before);
      const guest = await checkout("regression-guest-session-001", undefined, { clientId: String(user._id) });
      assert.equal(guest.status, 201); assert.ok(!guest.body.order.clientId);
      const buyer = await checkout("regression-valid-session-001", token, { clientId: "forged" });
      assert.equal(buyer.body.order.clientId, String(user._id));
    });
    await t.test("simultaneous and later retries share one order and one payment initiation", async () => {
      const before = gatewayCalls;
      const results = await Promise.all(Array.from({ length: 8 }, () => checkout("regression-simultaneous-001", token)));
      assert.ok(results.every(result => result.status === 201));
      assert.equal(new Set(results.map(result => result.body.order._id)).size, 1);
      assert.equal(gatewayCalls - before, 1);
      assert.equal((await checkout("regression-simultaneous-001", token)).body.order._id, results[0].body.order._id);
      const conflict = await checkout("regression-simultaneous-001", token, { price: 999 });
      assert.equal(conflict.status, 409); assert.equal(gatewayCalls - before, 1);
    });
    await t.test("a callback arriving before initiation returns cannot fail or overwrite a paid order", async () => {
      initialize = async dto => {
        assert.equal((await callback(dto.clientReference)).status, 200);
        return { success: true, data: { depositId: "fake-deposit", status: "PENDING" } };
      };
      const result = await checkout("regression-fast-callback-001", token);
      assert.equal(result.status, 201); assert.equal(result.body.order.status, "COMPLETED");
      assert.equal((await Order.findById(result.body.order._id))!.whatsappSent, true);
      initialize = async () => ({ success: true, data: { depositId: "fake-deposit", status: "PENDING" } });
    });
    await t.test("an uncertain initiation returns a tracking reference and is never initiated again on retry", async () => {
      const before = gatewayCalls;
      initialize = async () => { throw Error("Simulated timeout after request transmission"); };
      const result = await checkout("regression-lost-response-001", token);
      assert.equal(result.status, 201); assert.ok(result.body.order._id);
      assert.equal(result.body.order.paymentInitiationState, "unknown");
      const repeated = await checkout("regression-lost-response-001", token);
      assert.equal(repeated.body.order._id, result.body.order._id);
      assert.equal(gatewayCalls - before, 1);
      assert.equal((await callback(result.body.order._id)).status, 200);
      initialize = async () => ({ success: true, data: { depositId: "fake-deposit", status: "PENDING" } });
    });
    await t.test("concurrent webhook, polling and manual processing send exactly one WhatsApp", async () => {
      const created = await checkout("regression-notification-race-001", token);
      const id = created.body.order._id, before = outgoing;
      notify = async () => { await new Promise(resolve => setTimeout(resolve, 30)); return true; };
      await Promise.all([
        ...Array.from({ length: 6 }, () => callback(id)),
        ...Array.from({ length: 4 }, () => orderService.syncOrderStatus(id)),
        ...Array.from({ length: 3 }, () => orderService.traitOrder(id)),
      ]);
      assert.equal(outgoing - before, 1);
      const stored = (await Order.findById(id))!;
      assert.equal(stored.whatsappSent, true); assert.equal(stored.status, "COMPLETED");
      await callback(id); assert.equal(outgoing - before, 1);
      notify = async () => true;
    });
    await t.test("a definite WhatsApp rejection is not recorded as sent and can be retried", async () => {
      const created = await checkout("regression-wa-rejected-001", token), id = created.body.order._id;
      notify = async () => false;
      await callback(id);
      let stored = (await Order.findById(id))!;
      assert.equal(stored.whatsappSent, false); assert.equal(stored.whatsappProcessing, false);
      notify = async () => true;
      await OrderNotificationService.sendWhatsAppNotification(stored, "manuel");
      stored = (await Order.findById(id))!;
      assert.equal(stored.whatsappSent, true);
    });
    await t.test("an ambiguous WhatsApp timeout stays blocked for review, preventing blind duplicate sends", async () => {
      const created = await checkout("regression-wa-unknown-001", token), id = created.body.order._id, before = outgoing;
      notify = async () => { throw Error("Simulated delivery outcome unknown"); };
      await callback(id);
      await Promise.all([callback(id), callback(id), OrderNotificationService.sendAllPendingWhatsAppMessages()]);
      const stored = (await Order.findById(id))!;
      assert.equal(outgoing - before, 1);
      assert.equal(stored.whatsappSent, false); assert.equal(stored.whatsappProcessing, true);
      assert.ok(stored.whatsappProcessingStuckAt);
      notify = async () => true;
    });
    await t.test("failure to save a successful send never releases the send claim", async child => {
      const created = await checkout("regression-wa-save-failure-001", token), id = created.body.order._id, before = outgoing;
      const original = Order.updateOne.bind(Order);
      child.mock.method(Order, "updateOne", ((filter: any, update: any, ...rest: any[]) => {
        if (String(filter._id) === id && update.$set?.whatsappSent === true) throw Error("Simulated database outage after sending");
        return (original as any)(filter, update, ...rest);
      }) as any);
      await callback(id); await callback(id);
      assert.equal(outgoing - before, 1);
      assert.equal((await Order.findById(id))!.whatsappProcessing, true);
    });
    await t.test("late callbacks cannot regress delivered, cancelled or refunded orders", async () => {
      for (const status of ["DELIVERED", "CANCELLED", "REFUNDED"] as const) {
        const created = await checkout("regression-terminal-" + status, token);
        await Order.updateOne({ _id: created.body.order._id }, { $set: { status } });
        await callback(created.body.order._id, "FAILED");
        assert.equal((await Order.findById(created.body.order._id))!.status, status);
      }
    });
  } finally {
    if (server) await new Promise<void>(resolve => { server.closeAllConnections?.(); server.close(resolve); });
    await mongoose.disconnect(); await repl.stop();
  }
});
