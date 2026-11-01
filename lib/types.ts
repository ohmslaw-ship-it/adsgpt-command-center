export type Creative = {
  id: string;
  name: string;
  platform: string;
  ctr30d: number;
  cpa30dInr: number;
  frequency30d: number;
  fatigued: boolean;
};

export type Client = {
  id: string;
  name: string;
  platforms: string[];
  monthlyBudgetInr: number;
  spendToDateInr: number;
  maxDailySpend90dInr: number;
  todaySpendInr: number;
  overspendBreach: boolean;
  creatives: Creative[];
};

export type ClientStatus = "Overspend" | "Watch" | "Healthy";

export type EnrichedClient = Client & {
  status: ClientStatus;
  pacingPercent: number;
  overspendThresholdInr: number;
  fatiguedCreativeCount: number;
};
