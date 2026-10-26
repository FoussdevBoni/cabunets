// src/services/rewardRuleService.ts

import api from "../utils/api";
import {
  CreateRewardRulePayload,
  RewardRule,
  UpdateRewardRulePayload,
} from "../types/RewardRule";

export const rewardRuleService = {
  async list() {
    const { data } = await api.get<{ data: RewardRule[] }>("/reward-rules");
    return data.data;
  },

  async getById(id: string) {
    const { data } = await api.get<{ data: RewardRule }>(
      `/reward-rules/${id}`
    );
    return data.data;
  },

  async create(payload: CreateRewardRulePayload) {
    const { data } = await api.post<{ data: RewardRule }>(
      "/reward-rules",
      payload
    );
    return data.data;
  },

  async update(id: string, payload: UpdateRewardRulePayload) {
    const { data } = await api.put<{ data: RewardRule }>(
      `/reward-rules/${id}`,
      payload
    );
    return data.data;
  },

  async toggleActive(id: string, active: boolean) {
    const { data } = await api.patch<{ data: RewardRule }>(
      `/reward-rules/${id}/active`,
      { active }
    );
    return data.data;
  },
};

export type RewardRuleService = typeof rewardRuleService;