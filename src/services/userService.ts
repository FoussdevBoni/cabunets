// services/userService.ts
import  User  from "../models/User";
import { Vendeur } from "../models/Vendeur";
import { Client } from "../models/Client";

// ============================================================
// TYPES
// ============================================================

export interface UserFilters {
  role?: "client" | "vendeur" | "admin";
  isActive?: boolean;
  isVerified?: boolean;
  search?: string;
  day?: boolean;
  week?: boolean;
  month?: boolean;
  year?: boolean;
  startDate?: string;
  endDate?: string;
}

export interface UserListParams extends UserFilters {
  page?: number;
  limit?: number;
}

export interface UserStats {
  total: number;
  clients: number;
  vendeurs: number;
  admins: number;
  verified: number;
  active: number;
  inactive: number;
}

// ============================================================
// HELPERS
// ============================================================

function buildUserQuery(filters: UserFilters): any {
  const query: any = {};

  if (filters.role) query.role = filters.role;
  if (filters.isActive !== undefined) query.isActive = filters.isActive;
  if (filters.isVerified !== undefined) query.isVerified = filters.isVerified;

  if (filters.search) {
    const s = filters.search.trim();
    query.$or = [
      { username: { $regex: s, $options: "i" } },
      { email: { $regex: s, $options: "i" } },
    ];
  }

  const now = new Date();
  let start: Date | null = null;
  let end: Date | null = null;

  if (filters.startDate || filters.endDate) {
    if (filters.startDate) {
      start = new Date(filters.startDate);
      start.setHours(0, 0, 0, 0);
    }
    if (filters.endDate) {
      end = new Date(filters.endDate);
      end.setHours(23, 59, 59, 999);
    }
  } else if (filters.day) {
    start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  } else if (filters.week) {
    const d = now.getDay();
    start = new Date(now);
    start.setDate(now.getDate() - d);
    start.setHours(0, 0, 0, 0);
    end = new Date(start);
    end.setDate(start.getDate() + 7);
  } else if (filters.month) {
    start = new Date(now.getFullYear(), now.getMonth(), 1);
    end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  } else if (filters.year) {
    start = new Date(now.getFullYear(), 0, 1);
    end = new Date(now.getFullYear() + 1, 0, 1);
  }

  if (start || end) {
    query.createdAt = {};
    if (start) query.createdAt.$gte = start;
    if (end) query.createdAt.$lte = end;
  }

  return query;
}

// Hydrate un user avec son profil (client ou vendeur)
async function hydrateUser(user: any) {
  let profile = null;
  if (user.role === "vendeur") {
    profile = await Vendeur.findOne({ _id: user._id }).lean();
  } else if (user.role === "client") {
    profile = await Client.findOne({ _id: user._id }).lean();
  }

  return {
    _id: user._id,
    email: user.email,
    role: user.role,
    username: user.username,
    avatar: user.avatar,
    isVerified: user.isVerified,
    isActive: user.isActive,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    lastLoginAt: user.lastLoginAt ?? null,
    loginCount: user.loginCount ?? 0,
    actionsCount: user.actionsCount ?? 0,
    profile,
  };
}

// ============================================================
// SERVICE
// ============================================================

class UserService {
  // ----------------------------------------------------------
  // LIST (pagination + filtres + profils)
  // ----------------------------------------------------------
  async getUsers(params: UserListParams) {
    const { page = 1, limit = 50, ...filters } = params;
    const query = buildUserQuery(filters);

    const pageNum = Math.max(1, page);
    const limitNum = Math.min(200, Math.max(1, limit));
    const skip = (pageNum - 1) * limitNum;

    const [users, total] = await Promise.all([
      User.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum).lean(),
      User.countDocuments(query),
    ]);

    const data = await Promise.all(users.map((u: any) => hydrateUser(u)));

    return {
      data,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    };
  }

  // ----------------------------------------------------------
  // STATS (mêmes filtres que la liste)
  // ----------------------------------------------------------
  async getUserStats(filters: UserFilters): Promise<UserStats> {
    const query = buildUserQuery(filters);

    const [agg] = await User.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          clients: { $sum: { $cond: [{ $eq: ["$role", "client"] }, 1, 0] } },
          vendeurs: { $sum: { $cond: [{ $eq: ["$role", "vendeur"] }, 1, 0] } },
          admins: { $sum: { $cond: [{ $eq: ["$role", "admin"] }, 1, 0] } },
          verified: { $sum: { $cond: ["$isVerified", 1, 0] } },
          active: { $sum: { $cond: [{ $ne: ["$isActive", false] }, 1, 0] } },
          inactive: { $sum: { $cond: [{ $eq: ["$isActive", false] }, 1, 0] } },
        },
      },
    ]);

    return (
      agg ?? {
        total: 0,
        clients: 0,
        vendeurs: 0,
        admins: 0,
        verified: 0,
        active: 0,
        inactive: 0,
      }
    );
  }

  // ----------------------------------------------------------
  // GET ONE
  // ----------------------------------------------------------
  async getUserById(id: string) {
    const user = await User.findById(id).lean();
    if (!user) {
      const err: any = new Error("User introuvable.");
      err.statusCode = 404;
      throw err;
    }
    return await hydrateUser(user);
  }

  // ----------------------------------------------------------
  // UPDATE
  // ----------------------------------------------------------
  async updateUser(id: string, body: any) {
    const { username, avatar, profileData } = body;

    const user = await User.findById(id);
    if (!user) {
      const err: any = new Error("Utilisateur introuvable.");
      err.statusCode = 404;
      throw err;
    }

    if (username !== undefined) user.username = username;
    if (avatar !== undefined) user.avatar = avatar;
    await user.save();

    let profile = null;

    if (user.role === "vendeur" && profileData) {
      profile = await Vendeur.findByIdAndUpdate(
        user._id,
        { $set: profileData },
        { new: true }
      );
    }

    if (user.role === "client" && profileData) {
      profile = await Client.findByIdAndUpdate(
        user._id,
        { $set: profileData },
        { new: true }
      );
    }

    return {
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        avatar: user.avatar,
        role: user.role,
      },
      profile,
    };
  }

  // ----------------------------------------------------------
  // DELETE
  // ----------------------------------------------------------
  async deleteUser(id: string) {
    const user = await User.findByIdAndDelete(id);
    if (!user) {
      const err: any = new Error("User non trouvé");
      err.statusCode = 404;
      throw err;
    }
    return user;
  }

  // ----------------------------------------------------------
  // VERIFY
  // ----------------------------------------------------------
  async verifyUser(id: string) {
    const user = await User.findById(id);
    if (!user) {
      const err: any = new Error("Utilisateur introuvable.");
      err.statusCode = 404;
      throw err;
    }
    if (user.isVerified) {
      const err: any = new Error("Cet utilisateur est déjà vérifié.");
      err.statusCode = 400;
      throw err;
    }

    user.isVerified = true;
    await user.save();

    let profile = null;
    if (user.role === "vendeur") {
      profile = await Vendeur.findOne({ _id: user._id });
    } else if (user.role === "client") {
      profile = await Client.findOne({ _id: user._id });
    }

    return {
      _id: user._id,
      email: user.email,
      role: user.role,
      username: user.username,
      avatar: user.avatar,
      isVerified: user.isVerified,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      lastLoginAt: user.lastLoginAt ?? null,
      loginCount: user.loginCount ?? 0,
      actionsCount: user.actionsCount ?? 0,
      profile,
    };
  }

  // ----------------------------------------------------------
  // TOGGLE STATUS
  // ----------------------------------------------------------
  async toggleUserStatus(id: string, isActive: boolean | undefined, currentUserId?: string) {
    const user = await User.findById(id);
    if (!user) {
      const err: any = new Error("Utilisateur introuvable.");
      err.statusCode = 404;
      throw err;
    }

    if (currentUserId && id === currentUserId) {
      const err: any = new Error("Vous ne pouvez pas désactiver votre propre compte.");
      err.statusCode = 400;
      throw err;
    }

    user.isActive = isActive !== undefined ? isActive : !user.isActive;
    await user.save();

    let profile = null;
    if (user.role === "vendeur") {
      profile = await Vendeur.findOne({ _id: user._id });
    } else if (user.role === "client") {
      profile = await Client.findOne({ _id: user._id });
    }

    return {
      isActive: user.isActive,
      statusText: user.isActive ? "activé" : "désactivé",
      user: {
        _id: user._id,
        email: user.email,
        role: user.role,
        username: user.username,
        avatar: user.avatar,
        isVerified: user.isVerified,
        isActive: user.isActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        lastLoginAt: user.lastLoginAt ?? null,
        loginCount: user.loginCount ?? 0,
        actionsCount: user.actionsCount ?? 0,
        profile,
      },
    };
  }

  // ----------------------------------------------------------
  // GET PROFILE (auth / impersonation-safe)
  // ----------------------------------------------------------
  async getProfile(userId: string) {
    const user = await User.findById(userId).select("-password");
    if (!user) {
      const err: any = new Error("Utilisateur non trouvé");
      err.statusCode = 404;
      throw err;
    }

    let profile = null;
    if (user.role === "vendeur") {
      profile = await Vendeur.findOne({ _id: user._id });
    } else if (user.role === "client") {
      profile = await Client.findOne({ _id: user._id });
    }

    return {
      _id: user._id,
      email: user.email,
      role: user.role,
      username: user.username,
      avatar: user.avatar,
      isVerified: user.isVerified,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      lastLoginAt: user.lastLoginAt ?? null,
      loginCount: user.loginCount ?? 0,
      actionsCount: user.actionsCount ?? 0,
      profile,
    };
  }
}

export const userService = new UserService();