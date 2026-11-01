import clientsData from "@/data/clients.json";
import {
  compareClientsByStatus,
  countClientsByStatus,
  isCreativeFatigued,
  monthToDatePacingPercent,
  overspendThresholdInr,
  resolveClientStatus,
} from "@/lib/rules";
import type { Client, EnrichedClient } from "@/lib/types";

const clients = clientsData.clients as Client[];

export type SessionOverrides = {
  todaySpendOverride: Record<string, number>;
  pausedCreativeIds: Record<string, string[]>;
};

export const EMPTY_SESSION_OVERRIDES: SessionOverrides = {
  todaySpendOverride: {},
  pausedCreativeIds: {},
};

function pausedIdsFor(clientId: string, overrides: SessionOverrides): Set<string> {
  return new Set(overrides.pausedCreativeIds[clientId] ?? []);
}

function withOverridesApplied(
  client: Client,
  overrides: SessionOverrides,
): Client {
  const todaySpendInr =
    overrides.todaySpendOverride[client.id] ?? client.todaySpendInr;
  return { ...client, todaySpendInr };
}

function enrichOne(
  client: Client,
  overrides: SessionOverrides = EMPTY_SESSION_OVERRIDES,
): EnrichedClient {
  const effective = withOverridesApplied(client, overrides);
  const paused = pausedIdsFor(client.id, overrides);
  const activeCreatives = client.creatives.filter((c) => !paused.has(c.id));

  const fatiguedCreativeCount = activeCreatives.filter((c) =>
    isCreativeFatigued(c, activeCreatives),
  ).length;

  const statusClient: Client = {
    ...effective,
    creatives: activeCreatives,
  };

  return {
    ...effective,
    creatives: client.creatives,
    status: resolveClientStatus(statusClient),
    pacingPercent: monthToDatePacingPercent(
      effective.spendToDateInr,
      effective.monthlyBudgetInr,
    ),
    overspendThresholdInr: overspendThresholdInr(
      effective.maxDailySpend90dInr,
    ),
    fatiguedCreativeCount,
  };
}

export function getEnrichedClientsWithOverrides(
  overrides: SessionOverrides = EMPTY_SESSION_OVERRIDES,
): EnrichedClient[] {
  return clients
    .map((client) => enrichOne(client, overrides))
    .sort(compareClientsByStatus);
}

export function getEnrichedClients(): EnrichedClient[] {
  return getEnrichedClientsWithOverrides(EMPTY_SESSION_OVERRIDES);
}

export function getPortfolioSummary(enriched: EnrichedClient[]) {
  const statusCounts = countClientsByStatus(enriched);

  return {
    totalSpendToDateInr: enriched.reduce(
      (sum, c) => sum + c.spendToDateInr,
      0,
    ),
    accountsOnTrack: statusCounts.Healthy,
    overspendAlerts: statusCounts.Overspend,
    fatiguedCreatives: enriched.reduce(
      (sum, c) => sum + c.fatiguedCreativeCount,
      0,
    ),
    statusCounts,
  };
}

export { clients };
