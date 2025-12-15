import axios from "axios";
import { API_URL } from "../utils/api";

export interface QueryFilters { day?: boolean; week?: boolean; month?: boolean; year?: boolean; [key: string]: any; }

export const dataService = <T extends { id?: string }>(endpoint: string) => ({
  async create(data: T, token?: string): Promise<T & { id: string }> {
    try {
      const res = await axios.post(`${API_URL}/${endpoint}`, data, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      const doc = res.data;
      return { ...doc, id: doc._id }; // transforme _id en id
    } catch (err) {
      console.error(`Erreur création dans ${endpoint} :`, err);
      throw err;
    }
  },

  async getById(id: string | number, token?: string): Promise<(T & { id: string }) | null> {
    try {
      const res = await axios.get(`${API_URL}/${endpoint}/${id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      const doc = res.data;
      return { ...doc, id: doc._id };
    } catch (err) {
      console.error(`Erreur getById dans ${endpoint} (${id}) :`, err);
      return null;
    }
  },

  async getAll(filters: QueryFilters = {}, token?: string): Promise<(T & { id: string })[]> {
    try {
      const res = await axios.get(`${API_URL}/${endpoint}`, {
        params: filters,
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      const docs = res.data;
      return docs.map((doc: any) => ({ ...doc, id: doc._id })); // map pour transformer _id en id
    } catch (err) {
      console.error(`Erreur getAll dans ${endpoint} :`, err);
      return [];
    }
  },

  async update(id: string | number, updatedData: Partial<T>, token?: string): Promise<T & { id: string }> {
    try {
      const res = await axios.put(`${API_URL}/${endpoint}/${id}`, updatedData, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      const doc = res.data;
      return { ...doc, id: doc._id };
    } catch (err) {
      console.error(`Erreur update dans ${endpoint} (${id}) :`, err);
      throw err;
    }
  },

  async updateMany(items: T[], newData: Partial<T>, token?: string): Promise<(T & { id: string })[]> {
    try {
      const updated = await Promise.all(
        items.map((item: any) => this.update(item._id as string | number, newData, token))
      );
      return updated;
    } catch (err) {
      console.error(`Erreur updateMany dans ${endpoint} :`, err);
      throw err;
    }
  },

  async delete(id: string | number, token?: string): Promise<boolean> {
    try {
      await axios.delete(`${API_URL}/${endpoint}/${id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      return true;
    } catch (err) {
      console.error(`Erreur delete dans ${endpoint} (${id}) :`, err);
      throw err;
    }
  },
});
