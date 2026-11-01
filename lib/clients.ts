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

export function getEnrichedClients(): EnrichedClient[] {
  return clients
    .map((client) => ({
      ...client,
      status: resolveClientStatus(client),
      pacingPercent: monthToDatePacingPercent(
        client.spendToDateInr,
        client.monthlyBudgetInr,
      ),
      overspendThresholdInr: overspendThresholdInr(
        client.maxDailySpend90dInr,
      ),
      fatiguedCreativeCount: client.creatives.filter((c) =>
        isCreativeFatigued(c, client.creatives),
      ).length,
    }))
    .sort(compareClientsByStatus);
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
