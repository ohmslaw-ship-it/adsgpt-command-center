import type { EnrichedClient } from "@/lib/types";
import { formatInrCompact, formatInrTable, formatPercent } from "@/lib/format";
import {
  compareClientsByStatus,
  countClientsByStatus,
  isCreativeFatigued,
  isOverspend,
  monthToDatePacingPercent,
} from "@/lib/rules";
import type { SessionOverrides } from "@/lib/clients";

export type AssistantIntent =
  | "attention"
  | "fatigue"
  | "overspend"
  | "weekly"
  | "fallback";

export type AssistantAction = {
  id: string;
  label: string;
  kind: "cap_spend" | "pause_fatigued";
  clientId: string;
  capAmountInr?: number;
  creativeIds?: string[];
};

export type AssistantReply = {
  intent: AssistantIntent;
  text: string;
  actions: AssistantAction[];
};

const INTENT_KEYWORDS: Record<
  Exclude<AssistantIntent, "fallback">,
  string[]
> = {
  attention: [
    "attention",
    "today",
    "priority",
    "priorities",
    "need",
    "first",
    "clients",
    "morning",
    "brief",
  ],
  fatigue: [
    "fatigue",
    "fatigued",
    "creative",
    "creatives",
    "ads",
    "ctr",
    "frequency",
  ],
  overspend: [
    "overspend",
    "overspending",
    "over spend",
    "spend",
    "spending",
    "budget",
    "cap",
    "breach",
  ],
  weekly: ["week", "weekly", "summary", "summarise", "summarize", "portfolio"],
};

export function matchAssistantIntent(message: string): AssistantIntent {
  const normalized = message.toLowerCase().trim();
  if (!normalized) return "fallback";

  let best: AssistantIntent = "fallback";
  let bestScore = 0;

  for (const [intent, keywords] of Object.entries(INTENT_KEYWORDS) as [
    Exclude<AssistantIntent, "fallback">,
    string[],
  ][]) {
    let score = 0;
    for (const keyword of keywords) {
      if (normalized.includes(keyword)) score += 1;
    }
    if (score > bestScore) {
      bestScore = score;
      best = intent;
    }
  }

  return bestScore > 0 ? best : "fallback";
}

function activeCreatives(
  client: EnrichedClient,
  overrides: SessionOverrides,
) {
  const paused = new Set(overrides.pausedCreativeIds[client.id] ?? []);
  return client.creatives.filter((c) => !paused.has(c.id));
}

function fatiguedActiveCreatives(
  client: EnrichedClient,
  overrides: SessionOverrides,
) {
  const siblings = activeCreatives(client, overrides);
  return siblings.filter((c) => isCreativeFatigued(c, siblings));
}

export function buildAssistantReply(
  message: string,
  clients: EnrichedClient[],
  overrides: SessionOverrides,
): AssistantReply {
  const intent = matchAssistantIntent(message);

  if (intent === "fallback") {
    return {
      intent,
      text: "I can help with overspend, fatigue, pacing or a weekly summary.",
      actions: [],
    };
  }

  const sorted = [...clients].sort(compareClientsByStatus);

  if (intent === "attention") {
    const needsAction = sorted.filter(
      (c) => c.status === "Overspend" || c.status === "Watch",
    );
    if (needsAction.length === 0) {
      return {
        intent,
        text: "All 20 accounts look stable right now — no overspend or watch flags on sample data.",
        actions: [],
      };
    }

    const lines = needsAction.slice(0, 5).map((client) => {
      if (client.status === "Overspend") {
        return `${client.name} — overspend at ${formatInrTable(client.todaySpendInr)} today (cap ${formatInrTable(client.overspendThresholdInr)}).`;
      }
      const reasons: string[] = [];
      if (client.pacingPercent > 110) {
        reasons.push(`${formatPercent(client.pacingPercent, 0)} MTD pacing`);
      }
      if (client.fatiguedCreativeCount > 0) {
        reasons.push(
          `${client.fatiguedCreativeCount} fatigued ad${client.fatiguedCreativeCount === 1 ? "" : "s"}`,
        );
      }
      return `${client.name} — watch${reasons.length ? `: ${reasons.join(", ")}` : ""}.`;
    });

    const actions: AssistantAction[] = [];
    for (const client of needsAction) {
      if (client.status === "Overspend") {
        actions.push(makeCapSpendAction(client));
      }
      const fatigued = fatiguedActiveCreatives(client, overrides);
      if (fatigued.length > 0) {
        const pauseAction = makePauseFatiguedAction(client, fatigued);
        if (pauseAction) actions.push(pauseAction);
      }
    }

    const more =
      needsAction.length > 5
        ? ` (+${needsAction.length - 5} more in the table)`
        : "";

    return {
      intent,
      text: `${needsAction.length} client${needsAction.length === 1 ? "" : "s"} need attention today${more}:\n${lines.join("\n")}`,
      actions: actions.slice(0, 4),
    };
  }

  if (intent === "fatigue") {
    const withFatigue = sorted.filter((c) => c.fatiguedCreativeCount > 0);
    const totalFatigued = withFatigue.reduce(
      (sum, c) => sum + c.fatiguedCreativeCount,
      0,
    );

    if (totalFatigued === 0) {
      return {
        intent,
        text: "No fatigued creatives on sample data — frequency and CTR look within guardrails.",
        actions: [],
      };
    }

    const lines = withFatigue.slice(0, 4).map(
      (client) =>
        `${client.name} — ${client.fatiguedCreativeCount} fatigued (${formatInrTable(client.spendToDateInr)} MTD).`,
    );

    const actions = withFatigue
      .slice(0, 3)
      .map((client) =>
        makePauseFatiguedAction(
          client,
          fatiguedActiveCreatives(client, overrides),
        ),
      )
      .filter((a): a is AssistantAction => Boolean(a));

    return {
      intent,
      text: `${totalFatigued} fatigued ads across ${withFatigue.length} clients:\n${lines.join("\n")}`,
      actions,
    };
  }

  if (intent === "overspend") {
    const overspending = sorted.filter((c) =>
      isOverspend(c.todaySpendInr, c.maxDailySpend90dInr),
    );

    if (overspending.length === 0) {
      return {
        intent,
        text: "No accounts are above the 4× daily max rule today on this sample set.",
        actions: [],
      };
    }

    const lines = overspending.map((client) => {
      const overBy = client.todaySpendInr - client.overspendThresholdInr;
      return `${client.name} — ${formatInrTable(client.todaySpendInr)} today (${formatInrTable(overBy)} over ${formatInrTable(client.overspendThresholdInr)} threshold).`;
    });

    return {
      intent,
      text: `${overspending.length} overspend alert${overspending.length === 1 ? "" : "s"}:\n${lines.join("\n")}`,
      actions: overspending.map((c) => makeCapSpendAction(c)),
    };
  }

  const statusCounts = countClientsByStatus(clients);
  const totalMtd = clients.reduce((sum, c) => sum + c.spendToDateInr, 0);
  const totalBudget = clients.reduce((sum, c) => sum + c.monthlyBudgetInr, 0);
  const portfolioPacing = monthToDatePacingPercent(totalMtd, totalBudget);
  const fatiguedTotal = clients.reduce(
    (sum, c) => sum + c.fatiguedCreativeCount,
    0,
  );

  const topOverspend = sorted.find((c) => c.status === "Overspend");

  const text = [
    `Week-to-date on sample data (day 20 of 30): ${formatInrCompact(totalMtd)} spent of ${formatInrCompact(totalBudget)} budget — ${formatPercent(portfolioPacing, 0)} portfolio pacing.`,
    `${statusCounts.Healthy} healthy · ${statusCounts.Watch} watch · ${statusCounts.Overspend} overspend · ${fatiguedTotal} fatigued ads.`,
    topOverspend
      ? `Largest fire: ${topOverspend.name} at ${formatInrTable(topOverspend.todaySpendInr)} today.`
      : "No overspend breaches flagged this morning.",
  ].join("\n");

  const actions: AssistantAction[] = [];
  if (topOverspend) {
    actions.push(makeCapSpendAction(topOverspend));
  }
  const topFatigue = sorted.find((c) => c.fatiguedCreativeCount > 0);
  if (topFatigue) {
    const fatigued = fatiguedActiveCreatives(topFatigue, overrides);
    if (fatigued.length > 0) {
      const pauseAction = makePauseFatiguedAction(topFatigue, fatigued);
      if (pauseAction) actions.push(pauseAction);
    }
  }

  return { intent, text, actions };
}

/** Scripted reply for “What should I do about [Client] today?” */
export function buildClientDayReply(
  client: EnrichedClient,
  overrides: SessionOverrides,
): AssistantReply {
  const actions: AssistantAction[] = [];
  const lines: string[] = [`Here’s what matters for ${client.name} today:`];

  if (isOverspend(client.todaySpendInr, client.maxDailySpend90dInr)) {
    lines.push(
      `Overspend at ${formatInrTable(client.todaySpendInr)} today — cap is ${formatInrTable(client.overspendThresholdInr)} (4× 90d max).`,
    );
    actions.push(makeCapSpendAction(client));
  } else if (client.status === "Watch") {
    const reasons: string[] = [];
    if (client.pacingPercent > 110) {
      reasons.push(`${formatPercent(client.pacingPercent, 0)} MTD pacing`);
    }
    if (client.fatiguedCreativeCount > 0) {
      reasons.push(
        `${client.fatiguedCreativeCount} fatigued ad${client.fatiguedCreativeCount === 1 ? "" : "s"}`,
      );
    }
    lines.push(
      reasons.length
        ? `Watch status: ${reasons.join(", ")}.`
        : "Watch status.",
    );
  } else {
    lines.push(
      `On track — ${formatPercent(client.pacingPercent, 0)} MTD pacing, no overspend breach.`,
    );
  }

  const fatigued = fatiguedActiveCreatives(client, overrides);
  if (fatigued.length > 0) {
    const pauseAction = makePauseFatiguedAction(client, fatigued);
    if (pauseAction) actions.push(pauseAction);
  }

  lines.push(
    `Spend ${formatInrTable(client.spendToDateInr)} of ${formatInrTable(client.monthlyBudgetInr)} budget MTD · today ${formatInrTable(client.todaySpendInr)}.`,
  );

  return {
    intent: "attention",
    text: lines.join("\n"),
    actions: actions.slice(0, 3),
  };
}

function makeCapSpendAction(client: EnrichedClient): AssistantAction {
  const capAmountInr = client.maxDailySpend90dInr;
  return {
    id: `cap-${client.id}`,
    label: `Cap daily spend at ${formatInrTable(capAmountInr)}`,
    kind: "cap_spend",
    clientId: client.id,
    capAmountInr,
  };
}

function makePauseFatiguedAction(
  client: EnrichedClient,
  fatigued: { id: string }[],
): AssistantAction | null {
  if (fatigued.length === 0) return null;
  return {
    id: `pause-${client.id}-${fatigued.map((c) => c.id).join("-")}`,
    label: `Pause ${fatigued.length} fatigued ad${fatigued.length === 1 ? "" : "s"}`,
    kind: "pause_fatigued",
    clientId: client.id,
    creativeIds: fatigued.map((c) => c.id),
  };
}

export type ActionResult = {
  overrides: SessionOverrides;
  confirmationText: string;
  previousOverrides: SessionOverrides;
};

export function applyAssistantAction(
  action: AssistantAction,
  clients: EnrichedClient[],
  overrides: SessionOverrides,
): ActionResult {
  const previousOverrides: SessionOverrides = {
    todaySpendOverride: { ...overrides.todaySpendOverride },
    pausedCreativeIds: Object.fromEntries(
      Object.entries(overrides.pausedCreativeIds).map(([id, ids]) => [
        id,
        [...ids],
      ]),
    ),
  };

  const client = clients.find((c) => c.id === action.clientId);
  const clientName = client?.name ?? "Client";

  const next: SessionOverrides = {
    todaySpendOverride: { ...overrides.todaySpendOverride },
    pausedCreativeIds: { ...overrides.pausedCreativeIds },
  };

  if (action.kind === "cap_spend" && action.capAmountInr != null) {
    next.todaySpendOverride[action.clientId] = action.capAmountInr;
    return {
      overrides: next,
      previousOverrides,
      confirmationText: `Capped daily spend at ${formatInrTable(action.capAmountInr)} for ${clientName}.`,
    };
  }

  if (action.kind === "pause_fatigued" && action.creativeIds?.length) {
    const existing = new Set(next.pausedCreativeIds[action.clientId] ?? []);
    for (const id of action.creativeIds) existing.add(id);
    next.pausedCreativeIds[action.clientId] = [...existing];
    const count = action.creativeIds.length;
    return {
      overrides: next,
      previousOverrides,
      confirmationText: `Paused ${count} creative${count === 1 ? "" : "s"} for ${clientName}.`,
    };
  }

  return { overrides, previousOverrides, confirmationText: "Action applied." };
}

export const SUGGESTION_CHIPS = [
  "Which clients need attention today?",
  "Show fatigued creatives",
  "Who's overspending?",
  "Summarise my week",
] as const;
