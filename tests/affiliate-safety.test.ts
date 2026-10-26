
import test from "node:test";
import assert from "node:assert/strict";
import mongoose from "mongoose";
import { accountOwner } from "../src/middlewares/accountOwner";
import { authService } from "../src/services/metier/authService";
import { orderService } from "../src/services/metier/orderService";
import { Order } from "../src/models/Order";
import { LedgerEntry } from "../src/models/LedgerEntry";
import { Commission } from "../src/models/Commission";
import { ledgerService } from "../src/services/metier/ledgerService";
import { encryptDestination, decryptDestination } from "../src/utils/paymentDestination";
import { affiliateTransaction } from "../src/services/metier/affiliateTransaction";
import { Affiliate } from "../src/models/Affiliate";

test("public registration rejects administrator before accessing the database", async () => {
  await assert.rejects(authService.register({ email: "test@example.com", password: "secret123", role: "admin" }),
    (e: any) => e.statusCode === 400);
});
test("account modifications require authentication and ownership", () => {
  for (const [user, expected] of [[undefined, 401], [{ userId: "other", role: "client" }, 403]] as const) {
    let status = 0, next = false;
    const res: any = { status(code: number) { status = code; return this; }, json() { return this; } };
    accountOwner({ user, params: { id: "owner" } } as any, res, () => { next = true; });
    assert.equal(status, expected); assert.equal(next, false);
  }
  let called = false;
  accountOwner({ user: { userId: "owner", role: "client" }, params: { id: "owner" } } as any,
    {} as any, () => { called = true; });
  assert.equal(called, true);
});
test("a client or unrelated seller cannot mark another seller's order delivered", async t => {
  t.mock.method(Order, "findById", async () => ({ vendeurId: "seller" }) as any);
  for (const actor of [{ userId: "client", role: "client" }, { userId: "other", role: "vendeur" }]) {
    await assert.rejects(orderService.deliverOrder("order", actor), (e: any) => e.statusCode === 403);
  }
});
test("legacy pending credits and cancelled credits cannot fund withdrawals; currencies stay separate", async t => {
  const entries = [
    { type: "commission_credit", commissionId: "pending", signedAmount: 9000, currency: "CDF" },
    { type: "commission_credit", commissionId: "available", signedAmount: 7000, currency: "CDF" },
    { type: "commission_credit", commissionId: "cancelled", signedAmount: 3000, currency: "CDF" },
    { type: "regularisation", commissionId: "cancelled", signedAmount: -3000, currency: "CDF" },
    { type: "withdrawal_reserve", signedAmount: -5000, currency: "CDF" },
    { type: "withdrawal_release", signedAmount: 1000, currency: "CDF" },
    { type: "commission_credit", commissionId: "usd", signedAmount: 100, currency: "USD" }
  ];
  const commissions = [
    { _id: "pending", status: "en_attente", amount: 9000, currency: "CDF" },
    { _id: "available", status: "disponible", amount: 7000, currency: "CDF" },
    { _id: "cancelled", status: "annulee", amount: 3000, currency: "CDF" },
    { _id: "usd", status: "disponible", amount: 100, currency: "USD" }
  ];
  const query = (data: any[]) => ({ session() { return { lean: async () => data }; } });
  t.mock.method(LedgerEntry, "find", (filter: any) => query(entries.filter(e => e.currency === filter.currency)) as any);
  t.mock.method(Commission, "find", (filter: any) => query(commissions.filter(e => e.currency === filter.currency)) as any);
  const balance = await ledgerService.getBalance("affiliate");
  assert.equal(balance.availableBalance, 3000);
  assert.equal(balance.pendingBalance, 9000);
  assert.equal((await ledgerService.getBalance("affiliate", "USD")).availableBalance, 100);
});
test("financial transaction obtains the shared affiliate lock before its callback and closes the session", async t => {
  const events: string[] = [];
  const session = { withTransaction: async (action: any) => { events.push("transaction"); await action(); },
    endSession: async () => { events.push("end"); } };
  t.mock.method(mongoose, "startSession", async () => session as any);
  t.mock.method(Affiliate, "findOneAndUpdate", async (filter: any, update: any, options: any) => {
    assert.equal(filter.statut, "actif"); assert.equal(update.$inc.ledgerVersion, 1);
    assert.equal(options.session, session); events.push("lock"); return {} as any;
  });
  await assert.rejects(affiliateTransaction("affiliate", async passed => {
    assert.equal(passed, session); events.push("action"); throw new Error("failure");
  }, true), /failure/);
  assert.deepEqual(events, ["transaction", "lock", "action", "end"]);
});
test("payment destinations use authenticated encryption and reject tampering", () => {
  const oldKey = process.env.AFFILIATE_DESTINATION_KEY;
  process.env.AFFILIATE_DESTINATION_KEY = "11".repeat(32);
  try {
    const encrypted = encryptDestination("+243812345678");
    assert.equal(encrypted.includes("243812345678"), false);
    assert.equal(decryptDestination(encrypted), "+243812345678");
    const pieces = encrypted.split(".");
    const bytes = Buffer.from(pieces[2], "base64"); bytes[0] ^= 1; pieces[2] = bytes.toString("base64");
    assert.throws(() => decryptDestination(pieces.join(".")));
  } finally {
    if (oldKey === undefined) delete process.env.AFFILIATE_DESTINATION_KEY;
    else process.env.AFFILIATE_DESTINATION_KEY = oldKey;
  }
});

test("validation credits exactly once inside the financial transaction, including old credits", async t => {
  const session = { withTransaction: async (action: any) => action(), endSession: async () => {} };
  const id = new mongoose.Types.ObjectId();
  const affiliateId = new mongoose.Types.ObjectId();
  const commission: any = { _id: id, affiliateId, amount: 6000, currency: "CDF", status: "en_attente",
    sourceType: "order", sourceId: "order", availableAt: new Date(0),
    save: async (options: any) => { assert.equal(options.session, session); } };
  const query = (value: any): any => ({ session: async () => value, then: (resolve: any, reject: any) => Promise.resolve(value).then(resolve, reject) });
  t.mock.method(mongoose, "startSession", async () => session as any);
  t.mock.method(Affiliate, "findOneAndUpdate", async () => ({} as any));
  t.mock.method(Commission, "findById", () => query(commission));
  t.mock.method(Order, "findById", () => query({ status: "DELIVERED" }));
  let credit: any = null, writes = 0;
  t.mock.method(LedgerEntry, "findOne", () => query(credit));
  t.mock.method(LedgerEntry, "create", async (entries: any, options: any) => {
    assert.equal(options.session, session); writes++; credit = entries[0]; return [credit] as any;
  });
  const { commissionService } = await import("../src/services/metier/commissionService");
  await commissionService.validate(String(id));
  assert.equal(writes, 1);
  assert.equal(commission.status, "disponible");
  await commissionService.validate(String(id));
  assert.equal(writes, 1);
  commission.status = "en_attente";
  await commissionService.validate(String(id));
  assert.equal(writes, 1, "an old pending credit must not be credited twice");
});
test("validation cannot bypass the availability delay", async t => {
  const session = { withTransaction: async (action: any) => action(), endSession: async () => {} };
  const commission: any = { affiliateId: "affiliate", status: "en_attente", availableAt: new Date(Date.now() + 86400000) };
  t.mock.method(mongoose, "startSession", async () => session as any);
  t.mock.method(Affiliate, "findOneAndUpdate", async () => ({} as any));
  t.mock.method(Commission, "findById", () => ({
    session: async () => commission,
    then: (resolve: any, reject: any) => Promise.resolve(commission).then(resolve, reject)
  }) as any);
  const { commissionService } = await import("../src/services/metier/commissionService");
  await assert.rejects(commissionService.validate("commission"), (e: any) => e.statusCode === 409);
});

test("ledger rejects document modification, replacement and deletion before database access", async () => {
  const entry = new LedgerEntry({
    affiliateId: new mongoose.Types.ObjectId(), type: "commission_credit",
    signedAmount: 100, currency: "CDF", description: "test"
  });
  entry.isNew = false;
  await assert.rejects(entry.save(), /immuable/);
  await assert.rejects(LedgerEntry.findOneAndDelete({ _id: entry._id }), /immuable/);
  await assert.rejects(LedgerEntry.replaceOne({ _id: entry._id }, entry.toObject()), /immuable/);
});

test("legacy accounts without isActive or a commerce profile can load their identity", async t => {
  const jwt = (await import("jsonwebtoken")).default;
  const User = (await import("../src/models/User")).default;
  const { authMiddleware } = await import("../src/middlewares/authMiddleware");
  const { profileService } = await import("../src/services/metier/profileService");
  t.mock.method(jwt, "verify", () => ({ id: "legacy-client", role: "client" }) as any);
  t.mock.method(User, "findById", () => ({
    select: () => ({ lean: async () => ({ role: "client", username: "Client" }) })
  }) as any);
  t.mock.method(profileService, "getProfileByRole", async () => { throw new Error("Commerce profile must not gate identity"); });
  const req: any = { headers: { authorization: "Bearer test-token" }, baseUrl: "/api/auth", path: "/me" };
  let next = false;
  await authMiddleware(req, {
    status: () => { throw new Error("Identity should be accepted"); }
  } as any, () => { next = true; });
  assert.equal(next, true);
  assert.equal(req.user.userId, "legacy-client");
  next = false;
  req.baseUrl = "/api/affiliates";
  await authMiddleware(req, {} as any, () => { next = true; });
  assert.equal(next, true, "affiliation must not require a commerce profile either");
});
test("an explicitly deactivated account remains rejected when loading its identity", async t => {
  const jwt = (await import("jsonwebtoken")).default;
  const User = (await import("../src/models/User")).default;
  const { authMiddleware } = await import("../src/middlewares/authMiddleware");
  t.mock.method(jwt, "verify", () => ({ id: "disabled", role: "client" }) as any);
  t.mock.method(User, "findById", () => ({
    select: () => ({ lean: async () => ({ role: "client", isActive: false }) })
  }) as any);
  let status = 0, next = false;
  const res: any = { status(value: number) { status = value; return this; }, json() { return this; } };
  await authMiddleware({
    headers: { authorization: "Bearer test-token" }, baseUrl: "/api/auth", path: "/me"
  } as any, res, () => { next = true; });
  assert.equal(status, 401);
  assert.equal(next, false);
});
