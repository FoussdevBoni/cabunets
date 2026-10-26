// src/types/RewardRule.ts

import type { ProgramType } from "./Commission";
import { BackendData } from "./core/BackendData";

export type RewardMode = "fixe" | "pourcentage" | "hybride";

export interface RewardRule extends BackendData {
  name: string;
  description?: string;
  program: ProgramType;
  mode: RewardMode;
  fixedAmount?: number;
  percentage?: number;
  cap?: number;
  currency: string;
  availabilityDelayDays: number;
  active: boolean;
  startDate?: string;
  endDate?: string;

}

export interface CreateRewardRulePayload {
  name: string;
  description?: string;
  program: ProgramType;
  mode: RewardMode;
  fixedAmount?: number;
  percentage?: number;
  cap?: number;
  currency?: string;
  availabilityDelayDays?: number;
  active?: boolean;
  startDate?: string;
  endDate?: string;
}

export type UpdateRewardRulePayload = Partial<CreateRewardRulePayload>;