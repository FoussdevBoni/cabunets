// src/hooks/orders/useOrders.ts
import { useCallback, useEffect, useState } from "react";
import {
  orderService,
  OrdersListFilters,
  OrdersStats,
} from "../../services/orderService";
import { Order } from "../../utils/database";
import useToken from "../auth/useToken";

// ============================================================
// TYPES
// ============================================================

interface UseOrdersOptions {
  /** Filtres pour la liste (page, limit, status, search, dates…) */
  filters?: OrdersListFilters;

  /**
   * Filtres pour les stats. Si non fourni, on utilise `filters`.
   * Utile pour ignorer certains filtres (ex : status) dans les compteurs.
   */
  statsFilters?: OrdersListFilters;

  /** Charge aussi les stats (par défaut true) */
  withStats?: boolean;
}

// ============================================================
// HOOK
// ============================================================

export default function useOrders({
  filters = {},
  statsFilters,
  withStats = true,
}: UseOrdersOptions = {}) {
  const { token } = useToken();

  const [data, setData] = useState<(Order & { id: string })[]>([]);
  const [stats, setStats] = useState<OrdersStats | null>(null);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 50,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  // Clés stables pour éviter les boucles infinies
  const filtersKey = JSON.stringify(filters);
  const statsFiltersKey = JSON.stringify(statsFilters ?? null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const requests: Promise<any>[] = [
        orderService.getAllPaginated(filters, token),
      ];

      if (withStats) {
        // utilise statsFilters s'il est fourni, sinon filters
        const sf = statsFilters ?? filters;
        requests.push(orderService.getStats(sf, token));
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
      console.error("[useOrders] refresh error:", err);
      setError(err);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, filtersKey, statsFiltersKey, withStats]);

  const deleteItem = async (id: string | number) => {
    try {
      await orderService.delete(id, token);
      refresh();
    } catch (err) {
      setError(err);
    }
  };

  const updateItem = async (item: Partial<Order> & { id?: any; _id?: any }) => {
    const id = item.id || item._id;
    if (!id) {
      console.error("[useOrders] updateItem: ID manquant");
      return;
    }
    try {
      await orderService.update(id, item, token);
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
  };
}