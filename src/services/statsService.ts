// services/statsService.ts
import mongoose from "mongoose";
import User from "../models/User";
import { Vendeur } from "../models/Vendeur";
import { Client } from "../models/Client";
import { Order } from "../models/Order";
import { Offre } from "../models/Offre";

// ============================================================
// TYPES
// ============================================================

export interface AdminOverview {
  users: { client: number; vendeur: number; admin: number; total: number };
  totalOffres: number;
  totalVendeurs: number;
  orders: {
    total: number;
    completed: number;
    delivered: number;
    failed: number;
    pending: number;
    revenue: number;
  };
  networks: {
    mostSold: { network: string; count: number; percentage: number } | null;
    top3: { network: string; count: number; percentage: number }[];
  };
  monthly: {
    last: { year: number; month: number; revenue: number } | null;
    previous: { year: number; month: number; revenue: number } | null;
    variation: number;
    history: { year: number; month: number; revenue: number }[];
  };
  dailyRevenue: {
    today: number;
    yesterday: number;
    variation: number;
    history: { date: string; revenue: number }[];
  };
  dailySignups: {
    today: number;
    yesterday: number;
    variation: number;
    history: { date: string; count: number }[];
  };
  registrations: {
    last7Days: { date: string; count: number }[];
    last30Days: { date: string; count: number }[];
  };
  topUsers: {
    vendeurs: TopUser[];
    clients: TopUser[];
  };
}

export interface TopUser {
  _id: string;
  username?: string;
  email: string;
  avatar?: string;
  actionsCount: number;
  loginCount: number;
  lastLoginAt?: Date;
}

export interface VendeurOverview {
  orders: {
    total: number;
    pending: number;
    completed: number;
    delivered: number;
    failed: number;
    revenue: number;
  };
  offres: {
    total: number;
    byNetwork: { network: string; count: number }[];
  };
}

// ============================================================
// SERVICE
// ============================================================

class StatsService {
  // ============================================================
  // ADMIN OVERVIEW
  // ============================================================
  async getAdminOverview(): Promise<AdminOverview> {
    const now = new Date();

    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);

    const startOfYesterday = new Date(startOfToday);
    startOfYesterday.setDate(startOfYesterday.getDate() - 1);

    const start7DaysAgo = new Date(startOfToday);
    start7DaysAgo.setDate(start7DaysAgo.getDate() - 6);

    const start30DaysAgo = new Date(startOfToday);
    start30DaysAgo.setDate(start30DaysAgo.getDate() - 29);

    const [
      usersByRole,
      totalOffres,
      totalVendeurs,
      orderStats,
      networksAgg,
      monthlyAgg,
      dailyRevenueAgg,
      dailySignupsAgg,
      signups30Agg,
      topVendeurs,
      topClients,
    ] = await Promise.all([
      User.aggregate([{ $group: { _id: "$role", count: { $sum: 1 } } }]),

      Offre.countDocuments(),

      Vendeur.countDocuments(),

      Order.aggregate([
        {
          $group: {
            _id: null,
            totalOrders: { $sum: 1 },
            completed: {
              $sum: { $cond: [{ $eq: ["$status", "COMPLETED"] }, 1, 0] },
            },
            delivered: {
              $sum: { $cond: [{ $eq: ["$status", "DELIVERED"] }, 1, 0] },
            },
            failed: {
              $sum: { $cond: [{ $eq: ["$status", "FAILED"] }, 1, 0] },
            },
            revenue: {
              $sum: {
                $cond: [
                  { $in: ["$status", ["COMPLETED", "DELIVERED"]] },
                  { $toDouble: "$price" },
                  0,
                ],
              },
            },
          },
        },
      ]),

      Order.aggregate([
        { $match: { network: { $nin: [null, ""] } } },
        { $group: { _id: "$network", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),

      Order.aggregate([
        { $match: { status: { $in: ["COMPLETED", "DELIVERED"] } } },
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" },
            },
            revenue: { $sum: { $toDouble: "$price" } },
          },
        },
        { $sort: { "_id.year": -1, "_id.month": -1 } },
        { $limit: 6 },
      ]),

      Order.aggregate([
        {
          $match: {
            status: { $in: ["COMPLETED", "DELIVERED"] },
            createdAt: { $gte: start7DaysAgo },
          },
        },
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" },
              day: { $dayOfMonth: "$createdAt" },
            },
            revenue: { $sum: { $toDouble: "$price" } },
          },
        },
        { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
      ]),

      User.aggregate([
        { $match: { createdAt: { $gte: start7DaysAgo } } },
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" },
              day: { $dayOfMonth: "$createdAt" },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
      ]),

      User.aggregate([
        { $match: { createdAt: { $gte: start30DaysAgo } } },
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" },
              day: { $dayOfMonth: "$createdAt" },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
      ]),

      User.find({ role: "vendeur", isActive: true })
        .sort({ actionsCount: -1, loginCount: -1 })
        .limit(10)
        .select("_id username email avatar actionsCount loginCount lastLoginAt")
        .lean(),

      User.find({ role: "client", isActive: true })
        .sort({ actionsCount: -1, loginCount: -1 })
        .limit(10)
        .select("_id username email avatar actionsCount loginCount lastLoginAt")
        .lean(),
    ]);

    // ===== Users =====
    const users = { client: 0, vendeur: 0, admin: 0, total: 0 };
    usersByRole.forEach(
      (r: { _id: "client" | "vendeur" | "admin"; count: number }) => {
        users[r._id] = r.count;
        users.total += r.count;
      }
    );

    // ===== Orders =====
    const os = orderStats[0] ?? {
      totalOrders: 0,
      completed: 0,
      delivered: 0,
      failed: 0,
      revenue: 0,
    };
    const pendingOrders =
      os.totalOrders - os.completed - os.delivered - os.failed;

    // ===== Networks =====
    const totalOrdersForNetwork = networksAgg.reduce((s, n) => s + n.count, 0);
    const top3 = networksAgg.slice(0, 3).map((n) => ({
      network: n._id as string,
      count: n.count as number,
      percentage:
        totalOrdersForNetwork > 0
          ? Math.round((n.count / totalOrdersForNetwork) * 100)
          : 0,
    }));
    const mostSold = top3[0] ?? null;

    // ===== Monthly =====
    const history = monthlyAgg.map((m) => ({
      year: m._id.year as number,
      month: m._id.month as number,
      revenue: m.revenue as number,
    }));
    const last = history[0] ?? null;
    const previous = history[1] ?? null;
    const variation =
      previous && previous.revenue > 0
        ? ((last!.revenue - previous.revenue) / previous.revenue) * 100
        : 0;

    // ===== Date helper =====
    const formatDate = (y: number, m: number, d: number) =>
      `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

    // ===== Daily revenue =====
    const dailyRevMap = new Map<string, number>();
    dailyRevenueAgg.forEach((r) => {
      dailyRevMap.set(formatDate(r._id.year, r._id.month, r._id.day), r.revenue);
    });

    const dailyRevHistory: { date: string; revenue: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(startOfToday);
      d.setDate(d.getDate() - i);
      const key = formatDate(d.getFullYear(), d.getMonth() + 1, d.getDate());
      dailyRevHistory.push({ date: key, revenue: dailyRevMap.get(key) ?? 0 });
    }

    const todayKey = formatDate(
      startOfToday.getFullYear(),
      startOfToday.getMonth() + 1,
      startOfToday.getDate()
    );
    const yesterdayKey = formatDate(
      startOfYesterday.getFullYear(),
      startOfYesterday.getMonth() + 1,
      startOfYesterday.getDate()
    );

    const todayRevenue = dailyRevMap.get(todayKey) ?? 0;
    const yesterdayRevenue = dailyRevMap.get(yesterdayKey) ?? 0;
    const revenueDayVariation =
      yesterdayRevenue > 0
        ? ((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100
        : 0;

    // ===== Daily signups =====
    const dailySignupMap = new Map<string, number>();
    dailySignupsAgg.forEach((r) => {
      dailySignupMap.set(formatDate(r._id.year, r._id.month, r._id.day), r.count);
    });

    const dailySignupHistory: { date: string; count: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(startOfToday);
      d.setDate(d.getDate() - i);
      const key = formatDate(d.getFullYear(), d.getMonth() + 1, d.getDate());
      dailySignupHistory.push({
        date: key,
        count: dailySignupMap.get(key) ?? 0,
      });
    }

    const todaySignups = dailySignupMap.get(todayKey) ?? 0;
    const yesterdaySignups = dailySignupMap.get(yesterdayKey) ?? 0;
    const signupDayVariation =
      yesterdaySignups > 0
        ? ((todaySignups - yesterdaySignups) / yesterdaySignups) * 100
        : 0;

    // ===== Signups 30 jours =====
    const signup30Map = new Map<string, number>();
    signups30Agg.forEach((r) => {
      signup30Map.set(formatDate(r._id.year, r._id.month, r._id.day), r.count);
    });

    const signup30History: { date: string; count: number }[] = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(startOfToday);
      d.setDate(d.getDate() - i);
      const key = formatDate(d.getFullYear(), d.getMonth() + 1, d.getDate());
      signup30History.push({ date: key, count: signup30Map.get(key) ?? 0 });
    }

    return {
      users,
      totalOffres,
      totalVendeurs,
      orders: {
        total: os.totalOrders,
        completed: os.completed,
        delivered: os.delivered,
        failed: os.failed,
        pending: pendingOrders,
        revenue: os.revenue,
      },
      networks: { mostSold, top3 },
      monthly: { last, previous, variation, history },
      dailyRevenue: {
        today: todayRevenue,
        yesterday: yesterdayRevenue,
        variation: revenueDayVariation,
        history: dailyRevHistory,
      },
      dailySignups: {
        today: todaySignups,
        yesterday: yesterdaySignups,
        variation: signupDayVariation,
        history: dailySignupHistory,
      },
      registrations: {
        last7Days: dailySignupHistory,
        last30Days: signup30History,
      },
      topUsers: {
        vendeurs: topVendeurs as TopUser[],
        clients: topClients as TopUser[],
      },
    };
  }

  // ============================================================
  // VENDEUR OVERVIEW
  // ============================================================
async getVendeurOverview(vendeurId: string): Promise<VendeurOverview> {
  const oid = new mongoose.Types.ObjectId(vendeurId);
  const matchAny = { $or: [{ vendeurId }, { vendeurId: oid }] };

  const [orderStats, totalOffres, networkAgg] = await Promise.all([
    Order.aggregate([
      { $match: matchAny },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          completed: { $sum: { $cond: [{ $eq: ["$status", "COMPLETED"] }, 1, 0] } },
          delivered: { $sum: { $cond: [{ $eq: ["$status", "DELIVERED"] }, 1, 0] } },
          failed: { $sum: { $cond: [{ $eq: ["$status", "FAILED"] }, 1, 0] } },
          revenue: {
            $sum: {
              $cond: [
                { $eq: ["$status", "COMPLETED"] },
                { $toDouble: "$price" },
                0,
              ],
            },
          },
        },
      },
    ]),

    // countDocuments accepte $or direct (pas d'agrégation)
    Offre.countDocuments(matchAny),

    Offre.aggregate([
      { $match: matchAny },
      { $group: { _id: "$network", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),
  ]);

  const os = orderStats[0] ?? {
    total: 0, completed: 0, delivered: 0, failed: 0, revenue: 0,
  };

  const pending = os.total - os.completed - os.delivered - os.failed;

  return {
    orders: {
      total: os.total,
      pending,
      completed: os.completed,
      delivered: os.delivered,
      failed: os.failed,
      revenue: os.revenue,
    },
    offres: {
      total: totalOffres,
      byNetwork: networkAgg.map((n) => ({
        network: (n._id as string) || "Inconnu",
        count: n.count as number,
      })),
    },
  };
}
}

export const statsService = new StatsService();