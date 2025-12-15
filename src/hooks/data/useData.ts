// src/hooks/useData.ts
import { useEffect, useState, useCallback } from "react";
import { QueryFilters } from "../../services/dataService";
import useToken from "../auth/useToken";

export function useData<T>(
  service: {
    getAll: (filters?: QueryFilters, token?: string) => Promise<T[]>;
    delete: (id: string | number, token?: string) => Promise<boolean>;
    update: (
      id: string | number,
      data: Partial<T>,
      token?: string
    ) => Promise<T>;
  },
  filters?: QueryFilters,
) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);
  const {token} = useToken()
  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const res = await service.getAll(filters, token);
      setData(res);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError(err);
      setLoading(false);
    }
  }, [service, token, JSON.stringify(filters)]);

  const deleteItem = async (id: string | number) => {
    try {
      await service.delete(id, token);
      refresh();
    } catch (err) {
      setError(err);
    }
  };

  const updateItem = async (item: Partial<T> & { id?: any; _id?: any }) => {
    const id = item.id || item._id;
    if (!id) {
      console.error("ID manquant pour update");
      return;
    }

    try {
      await service.update(id, item, token);
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
    loading,
    error,
    length: data.length,

    refresh,
    deleteItem,
    updateItem,
  };
}
