// hooks/users/useUsers.ts
import { useCallback, useEffect, useState } from "react";
import {
  userService,
  UserListFilters,
  UserStats,
} from "../../services/userService";
import { User } from "../../utils/database";
import useToken from "../auth/useToken";

// ============================================================
// TYPES
// ============================================================

interface UseUsersOptions {
  filters?: UserListFilters;
  /** Charge aussi les stats (par défaut true) */
  withStats?: boolean;
}

// ============================================================
// HOOK
// ============================================================

export default function useUsers({
  filters = {},
  withStats = true,
}: UseUsersOptions = {}) {
  const { token } = useToken();

  const [data, setData] = useState<(User & { id: string })[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 50,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  const filtersKey = JSON.stringify(filters);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const requests: Promise<any>[] = [
        userService.getAllPaginated(filters, token),
      ];
      if (withStats) {
        requests.push(userService.getStats(filters, token));
      }

      const [list, statsRes] = await Promise.all(requests);

      setData(list.data);
      setPagination({
        total: list.total,
        page: list.page,
        limit: list.limit,
        totalPages: list.totalPages,
      });
      if (withStats && statsRes) setStats(statsRes);
    } catch (err) {
      console.error("[useUsers] refresh error:", err);
      setError(err);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, filtersKey, withStats]);

  const deleteItem = async (id: string | number) => {
    try {
      await userService.delete(id, token);
      refresh();
    } catch (err) {
      setError(err);
    }
  };

  const updateItem = async (item: Partial<User> & { id?: any; _id?: any }) => {
    const id = item.id || item._id;
    if (!id) {
      console.error("[useUsers] updateItem: ID manquant");
      return;
    }
    try {
      await userService.update(id, item, token);
      refresh();
    } catch (err) {
      setError(err);
    }
  };

  const verifyUser = async (id: string) => {
    try {
      await userService.verifyUser(id, token);
      refresh();
    } catch (err) {
      setError(err);
    }
  };

  const toggleUserStatus = async (id: string, isActive?: boolean) => {
    try {
      await userService.toggleUserStatus(id, isActive, token);
      refresh();
    } catch (err) {
      setError(err);
    }
  };

  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    data,
    stats,
    pagination,
    loading,
    error,
    length: data.length,
    refresh,
    deleteItem,
    updateItem,
    verifyUser,
    toggleUserStatus,
  };
}