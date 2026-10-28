import test from "node:test";
import assert from "node:assert/strict";
import mongoose from "mongoose";
import { MongoMemoryReplSet } from "mongodb-memory-server";
import express from "express";
import cors from "cors";

test("complete affiliation lifecycle on an isolated MongoDB replica set", { timeout: 1800000 }, async t => {
  process.env.NODE_ENV = "test";
  process.env.JWT_SECRET = "integration-secret-for-local-tests-only-12345";
  process.env.AFFILIATE_DESTINATION_KEY = "22".repeat(32);
  process.env.INTERNAL_SHARED_SECRET = "integration-gateway";
  process.env.SUPABASE_URL = "https://example.supabase.co";
  process.env.SUPABASE_SERVICE_ROLE_KEY = "integration-only";
  const repl = await MongoMemoryReplSet.create({ instanceOpts: [{ launchTimeout: 60000 }], replSet: { count: 1, storageEngine: "wiredTiger" } });
  const uri = repl.getUri("cabuaffili_integration");
  assert.match(uri, /^mongodb:\/\/(127\.0\.0\.1|localhost):/);
  process.env.MONGO_URI = uri;
  let server: any;
  try {
    await mongoose.connect(uri);
    const { smtpService } = await import("../src/services/providers/smtpService");
    t.mock.method(smtpService, "send", async () => {});
    const axios = (await import("axios")).default;
    axios.defaults.adapter = async () => { throw new Error("External network disabled in integration tests"); };
    const User = (await import("../src/models/User")).default;
    const { Client } = await import("../src/models/Client");
    const { Vendeur } = await import("../src/models/Vendeur");
    const { Admin } = await import("../src/models/Admin");
    const { Affiliate } = await import("../src/models/Affiliate");
    const { Referral } = await import("../src/models/Referral");
    const { Commission } = await import("../src/models/Commission");
    const { LedgerEntry } = await import("../src/models/LedgerEntry");
    const { RewardRule } = await import("../src/models/RewardRule");
    const { RewardWithdrawal } = await import("../src/models/RewardWithdrawal");
    const { AffiliateIssue } = await import("../src/models/AffiliateIssue");
    const { AffiliateSettings } = await import("../src/models/AffiliateSettings");
    const { AuditLog } = await import("../src/models/AuditLog");
    const { Order } = await import("../src/models/Order");
    const { affiliateLifecycleService } = await import("../src/services/metier/affiliateLifecycleService");
    const { commissionService } = await import("../src/services/metier/commissionService");
    const { ledgerService } = await import("../src/services/metier/ledgerService");
    const app = express();
    app.use(cors());
    app.use(express.json());
    for (const [prefix, module] of [
      ["auth", "authRoutes"], ["affiliates", "affiliateRoutes"], ["referrals", "referralRoutes"],
      ["commissions", "commissionRoutes"], ["reward-rules", "rewardRuleRoutes"],
      ["reward-withdrawals", "rewardWithdrawalRoutes"], ["affiliate-admin", "affiliateAdminRoutes"],
      ["orders", "orderRoutes"],
    ]) app.use("/api/" + prefix, (await import("../src/routes/metier/" + module)).default);
    await Promise.all([User, Client, Vendeur, Admin, Affiliate, Referral, Commission, LedgerEntry,
      RewardRule, RewardWithdrawal, AffiliateIssue, AffiliateSettings, AuditLog, Order].map(model => model.init()));
    server = app.listen(process.env.AFFILIATE_UI_HOLD === "1" ? 3108 : 0, "127.0.0.1");
    await new Promise<void>(resolve => server.on("listening", resolve));
    const base = "http://127.0.0.1:" + server.address().port + "/api";
    async function request(path: string, method = "GET", body?: any, token?: string, expected = 200) {
      const response = await fetch(base + path, {
        method, headers: { "Content-Type": "application/json", ...(token ? { Authorization: "Bearer " + token } : {}) },
        body: body === undefined ? undefined : JSON.stringify(body),
      });
      const data: any = response.headers.get("content-type")?.includes("json") ? await response.json() : await response.text();
      assert.equal(response.status, expected, method + " " + path + ": " + JSON.stringify(data));
      return data;
    }
    const admin = await User.create({ email: "admin@test.invalid", password: "TestPassword123", role: "admin", isActive: true });
    await Admin.create({ _id: admin._id });
    const adminAuth = await request("/auth/login", "POST", { email: admin.email, password: "TestPassword123" });
    const adminToken = adminAuth.token;
    const sponsor = await request("/auth/register", "POST", {
      email: "sponsor@test.invalid", password: "TestPassword123", role: "client",
      username: "Sponsor", telephone: "+243812345678", becomeAffiliate: true,
    }, undefined, 201);
    const sponsorId = sponsor.user.id, token = sponsor.token;
    await request("/auth/me", "GET", undefined, token);
    await request("/affiliates/verifier-telephone", "POST", { userId: sponsorId }, adminToken);
    await request("/affiliates/" + sponsorId + "/activer", "POST", {}, adminToken);
    const profile = (await request("/affiliates/me", "GET", undefined, token)).data;
    const buyer = await request("/auth/register", "POST", {
      email: "buyer@test.invalid", password: "TestPassword123", role: "client", username: "Buyer",
      profileData: { whatsappNumber: "+243822345678" }, referralCode: profile.code,
    }, undefined, 201);
    const seller = await request("/auth/register", "POST", {
      email: "seller@test.invalid", password: "TestPassword123", role: "vendeur", username: "Seller",
      profileData: { whatsappNumber: "+243832345678", paymentAmount: 0, isApproved: true }, referralCode: profile.code,
    }, undefined, 201);
    assert.equal((await Vendeur.findById(seller.user.id))!.isApproved, false, "public registration cannot approve a seller");
    for (const program of ["affiliation_client", "affiliation_vendeur"]) {
      await request("/reward-rules", "POST", {
        name: program, program, mode: "fixe", fixedAmount: program === "affiliation_client" ? 6000 : 3000,
        currency: "CDF", availabilityDelayDays: 0, active: true,
      }, adminToken, 201);
    }
    const order = await Order.create({
      clientId: buyer.user.id, vendeurId: seller.user.id, vendeurName: "Seller", offerId: "test-offer",
      phoneNumber: "+243822345678", units: 100, price: 10000, currency: "CDF", network: "Airtel",
      status: "COMPLETED", depositPaymentStatus: "COMPLETED",
    });

    await t.test("delivery attribution is idempotent and an unapproved seller cannot earn its prime", async () => {
      await request("/orders/deliver-order/" + order._id, "GET", undefined, seller.token);
      await Promise.all([affiliateLifecycleService.syncOrder(String(order._id)), affiliateLifecycleService.syncOrder(String(order._id))]);
      assert.equal(await Commission.countDocuments({ program: "affiliation_client" }), 1);
      assert.equal(await Commission.countDocuments({ program: "affiliation_vendeur" }), 0);
      assert.equal((await ledgerService.getBalance(sponsorId)).availableBalance, 0);
      await request("/affiliate-admin/sellers/" + seller.user.id + "/approve", "POST", {}, adminToken);
      await affiliateLifecycleService.syncOrder(String(order._id));
      assert.equal(await Commission.countDocuments({ program: "affiliation_vendeur" }), 1);
    });

    await t.test("commissions become available exactly once after approval", async () => {
      const commissions = await Commission.find();
      await Promise.all(commissions.map(c => commissionService.validate(String(c._id))));
      await Promise.all(commissions.map(c => commissionService.validate(String(c._id))));
      assert.equal(await LedgerEntry.countDocuments({ type: "commission_credit" }), 2);
      assert.equal((await ledgerService.getBalance(sponsorId)).availableBalance, 9000);
    });

    let withdrawalId: string;
    await t.test("simultaneous withdrawals cannot spend the same balance", async () => {
      const create = () => fetch(base + "/reward-withdrawals", {
        method: "POST", headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
        body: JSON.stringify({ amount: 6000, channel: "airtel_money", destination: "+243812345678" })
      });
      const responses = await Promise.all([create(), create()]);
      assert.deepEqual(responses.map(r => r.status).sort(), [201, 403]);
      const successful: any = await responses.find(r => r.status === 201)!.json();
      withdrawalId = successful.data._id;
      assert.equal((await ledgerService.getBalance(sponsorId)).availableBalance, 3000);
      const detail = await request("/reward-withdrawals/" + withdrawalId, "GET", undefined, adminToken);
      assert.equal(detail.data.destination, "+243812345678");
      const own = await request("/reward-withdrawals/" + withdrawalId, "GET", undefined, token);
      assert.equal(own.data.destination, undefined);
    });

    await t.test("rejecting a withdrawal releases its reservation only once", async () => {
      await Promise.all([
        request("/reward-withdrawals/" + withdrawalId + "/reject", "POST", { reason: "Test de rejet" }, adminToken),
        request("/reward-withdrawals/" + withdrawalId + "/reject", "POST", { reason: "Test de rejet" }, adminToken)
      ]);
      assert.equal(await LedgerEntry.countDocuments({ type: "withdrawal_release" }), 1);
      assert.equal((await ledgerService.getBalance(sponsorId)).availableBalance, 9000);
    });

    await t.test("recording a confirmed manual payout does not debit twice", async () => {
      const created = await request("/reward-withdrawals", "POST",
        { amount: 6000, channel: "airtel_money", destination: "+243812345678" }, token, 201);
      const id = created.data._id;
      await request("/reward-withdrawals/" + id + "/approve", "POST", {}, adminToken);
      await Promise.all([
        request("/reward-withdrawals/" + id + "/paid", "POST", { externalReference: "TEST-PAYOUT-1" }, adminToken),
        request("/reward-withdrawals/" + id + "/paid", "POST", { externalReference: "TEST-PAYOUT-1" }, adminToken)
      ]);
      assert.equal((await ledgerService.getBalance(sponsorId)).availableBalance, 3000);
    });

    await t.test("refund reverses customer and seller commissions, retaining paid history and debt", async () => {
      await request("/affiliate-admin/orders/" + order._id + "/refund", "POST",
        { reason: "Remboursement de test", reference: "TEST-REFUND-1" }, adminToken);
      await affiliateLifecycleService.syncOrder(String(order._id));
      assert.equal(await Commission.countDocuments({ status: "annulee" }), 2);
      assert.equal(await LedgerEntry.countDocuments({ type: "regularisation" }), 2);
      assert.equal((await ledgerService.getBalance(sponsorId)).availableBalance, -6000);
      assert.equal(await RewardWithdrawal.countDocuments({ status: "payee" }), 1);
      await request("/reward-withdrawals", "POST",
        { amount: 5000, channel: "airtel_money", destination: "+243812345678" }, token, 403);
    });

    await t.test("administration shows global metrics, audit, issues, settings and safe CSV exports", async () => {
      await request("/affiliate-admin/issues/scan", "POST", {}, adminToken);
      const issues = (await request("/affiliate-admin/issues", "GET", undefined, adminToken)).data;
      assert.ok(issues.items.some((i: any) => i.category === "negative_balance"));
      const metrics = (await request("/affiliate-admin/overview", "GET", undefined, adminToken)).data;
      assert.equal(metrics.totalAffiliates, 1);
      await request("/affiliate-admin/settings", "PUT", { minWithdrawalAmount: 7000 }, adminToken);
      assert.equal((await request("/commissions/me/balance", "GET", undefined, token)).data.minimumWithdrawalAmount, 7000);
      await request("/affiliate-admin/overview", "GET", undefined, token, 403);
      const csv = await request("/affiliate-admin/exports/commissions", "GET", undefined, adminToken);
      assert.match(csv, /affiliation_client/);
      assert.doesNotMatch(csv, /destinationEncrypted/);
      await new Promise(resolve => setTimeout(resolve, 100));
      const audit = (await request("/affiliate-admin/audit", "GET", undefined, adminToken)).data;
      assert.ok(audit.total > 0);
    });

    const orderData = {
      clientId: buyer.user.id, vendeurId: seller.user.id, vendeurName: "Seller", offerId: "test-offer",
      phoneNumber: "+243822345678", units: 100, price: 10000, currency: "CDF", network: "Airtel",
    };
    await t.test("invalid referral attribution rolls back the entire registration", async () => {
      await request("/auth/register", "POST", { email: "invalid-ref@test.invalid", password: "TestPassword123",
        role: "client", profileData: { whatsappNumber: "+243842345678" }, referralCode: "AFF-INVALID" }, undefined, 400);
      assert.equal(await User.exists({ email: "invalid-ref@test.invalid" }), null);
    });

    await t.test("a simulated payment and delivery use the authenticated buyer and a pending refund never becomes payable", async () => {
      const { cabupayPaymentService } = await import("../src/services/providers/cabupayPaymentService");
      t.mock.method(cabupayPaymentService, "createDeposit", async () => ({
        success: true, data: { depositId: "test-deposit", status: "PENDING" }
      }) as any);
      t.mock.method(cabupayPaymentService, "getDeposit", async () => ({
        data: { data: { status: "COMPLETED" } }
      }) as any);
      const created = await request("/orders", "POST", { ...orderData, clientId: sponsorId,
        paymentPhone: "+243822345678", correspondent: "AIRTEL_COD" }, buyer.token, 201);
      const id = created.order?._id ?? created.data?.order?._id;
      assert.ok(id, "order creation must expose the order reference");
      assert.equal((await Order.findById(id))!.clientId, buyer.user.id);
      await request("/orders/sync-status/" + id);
      await request("/orders/deliver-order/" + id, "GET", undefined, seller.token);
      const commission = await Commission.findOne({ sourceId: id });
      assert.ok(commission);
      assert.equal(commission.status, "en_attente");
      const before = (await ledgerService.getBalance(sponsorId)).availableBalance;
      await request("/affiliate-admin/orders/" + id + "/refund", "POST",
        { reason: "Remboursement avant validation", reference: "TEST-REFUND-PENDING" }, adminToken);
      await assert.rejects(commissionService.validate(String(commission._id)), (error: any) => error.statusCode === 409);
      assert.equal((await ledgerService.getBalance(sponsorId)).availableBalance, before);
    });

    await t.test("a missing rule is recorded and safely retried without duplicate commissions", async () => {
      await RewardRule.updateMany({ program: "affiliation_client" }, { $set: { active: false } });
      const missed = await Order.create({ ...orderData, status: "DELIVERED", deliveredAt: new Date() });
      assert.equal(await affiliateLifecycleService.safelySync(String(missed._id)), false);
      assert.equal((await AffiliateIssue.findById("order:" + missed._id))!.status, "open");
      await RewardRule.updateMany({ program: "affiliation_client" }, { $set: { active: true } });
      await affiliateLifecycleService.reconcile();
      await affiliateLifecycleService.reconcile();
      assert.equal(await Commission.countDocuments({ sourceId: String(missed._id) }), 1);
      assert.equal((await AffiliateIssue.findById("order:" + missed._id))!.status, "resolved");
      const commission = await Commission.findOne({ sourceId: String(missed._id) });
      await commissionService.validate(String(commission!._id));
    });

    await t.test("a documented repayment is idempotent and resolves the negative-balance alert", async () => {
      const before = (await ledgerService.getBalance(sponsorId)).availableBalance;
      const body = { affiliateId: sponsorId, amount: 6000, reason: "Remboursement reçu (test)", reference: "TEST-REPAYMENT-1" };
      await Promise.all([
        request("/affiliate-admin/adjustments", "POST", body, adminToken),
        request("/affiliate-admin/adjustments", "POST", body, adminToken)
      ]);
      assert.equal((await ledgerService.getBalance(sponsorId)).availableBalance, before + 6000);
      await request("/affiliate-admin/issues/scan", "POST", {}, adminToken);
      assert.equal((await AffiliateIssue.findById("negative:" + sponsorId))!.status, "resolved");
    });

    await t.test("concurrent refund and commission validation cannot leave a refunded order payable", async () => {
      for (let i = 0; i < 3; i++) {
        const source = await Order.create({ ...orderData, status: "DELIVERED", deliveredAt: new Date() });
        await affiliateLifecycleService.syncOrder(String(source._id));
        const commission = await Commission.findOne({ sourceId: String(source._id) });
        const before = (await ledgerService.getBalance(sponsorId)).availableBalance;
        await Promise.allSettled([
          commissionService.validate(String(commission!._id)),
          affiliateLifecycleService.reverseOrder(String(source._id), "REFUNDED", "Course concurrente test", "TEST-RACE-" + i)
        ]);
        assert.equal((await Order.findById(source._id))!.status, "REFUNDED");
        assert.equal((await Commission.findById(commission!._id))!.status, "annulee");
        assert.equal((await ledgerService.getBalance(sponsorId)).availableBalance, before);
      }
    });

    if (process.env.AFFILIATE_UI_HOLD === "1") {
      const fs = await import("fs");
      const path = await import("path");
      const os = await import("os");
      const marker = path.join(os.tmpdir(), "cabuaffili-ui-fixture.json");
      fs.writeFileSync(marker, JSON.stringify({ api: base, adminEmail: admin.email, sponsorEmail: "sponsor@test.invalid", password: "TestPassword123" }));
      console.log("Isolated UI fixture ready: " + base);
      await new Promise<void>(resolve => {
        const timer = setInterval(() => { if (!fs.existsSync(marker)) { clearInterval(timer); resolve(); } }, 1000);
        setTimeout(() => { clearInterval(timer); resolve(); }, 900000).unref();
      });
    }

  } finally {
    if (server) await new Promise<void>(resolve => server.close(() => resolve()));
    await mongoose.disconnect();
    await repl.stop();
  }
});
