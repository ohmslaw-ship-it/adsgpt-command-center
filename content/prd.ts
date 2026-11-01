export type PrdTocItem = {
  id: string;
  label: string;
};

export type PrdPersona = {
  role: string;
  goal: string;
  pain: string;
  quote: string;
};

export type PrdUserStory = {
  story: string;
  acceptance: string[];
};

export type PrdRequirement = {
  feature: string;
  priority: "P0" | "P1" | "P2";
  rule: string;
};

export type PrdEdgeCase = {
  scenario: string;
  behaviour: string;
};

export const prdMeta = {
  label: "PRD",
  title: "Portfolio Command Center: product spec",
  subtitle: "v0.1 · Concept by Om Raje · Not an official Venxr document",
} as const;

export const prdToc: PrdTocItem[] = [
  { id: "prd-problem", label: "Problem" },
  { id: "prd-users", label: "Users" },
  { id: "prd-goals", label: "Goals" },
  { id: "prd-user-stories", label: "User stories" },
  { id: "prd-requirements", label: "Requirements" },
  { id: "prd-edge-cases", label: "Edge cases" },
  { id: "prd-out-of-scope", label: "Out of scope" },
];

export const prdProblem = {
  title: "Problem",
  body: "Agency leads managing 20+ accounts across Google, Meta, DV360, and Amazon spend their Monday piecing together platform tabs and pacing sheets. Overspend and fatigued creatives surface too late — often after budget is already blown or CTR has been sliding for days.",
};

export const prdUsers = {
  primary: {
    title: "Primary — Agency Account Lead",
    persona: {
      role: "Owns delivery and client trust for a book of 15–30 brands.",
      goal: "Start the week knowing which accounts need action before the first stand-up.",
      pain: "Context lives in four ad UIs, two spreadsheets, and Slack; nothing rolls up to portfolio severity.",
      quote: "I don't need another dashboard — I need one screen that tells me where to look first.",
    } satisfies PrdPersona,
  },
  secondary: {
    title: "Secondary — Media Planner",
    persona: {
      role: "Executes day-to-day changes and reporting for assigned clients.",
      goal: "Act on the lead's priorities without re-auditing every account from scratch.",
      pain: "Handoffs are verbal or buried in threads; easy to miss a paused campaign or pacing miss.",
      quote: "If the lead already flagged overspend, I just want the one-click fix and a paper trail.",
    } satisfies PrdPersona,
  },
};

export const prdGoals = {
  goals: [
    "Cut Monday portfolio review from ~3 hours to under 20 minutes per account manager.",
    "Catch overspend the same day it happens, not at the next weekly review.",
    "Let the lead act in one click, with undo, instead of logging into four ad platforms.",
  ],
  nonGoals: [
    "Replacing Google, Meta, DV360, or Amazon as the system of record.",
    "Building new bidding, budget optimization, or ML models.",
    "Automated client reporting or invoice reconciliation.",
  ],
};

export const prdUserStories: PrdUserStory[] = [
  {
    story:
      "As an Agency Account Lead, I want one portfolio table sorted by severity, so I can review every brand without opening ten platform tabs.",
    acceptance: [
      "Given I open the brief, when the portfolio loads, then every client shows as Overspend, Watch or Healthy, with Overspend first.",
      "Given I type part of a client's name, when the search runs, then the table filters and keeps its status pills and spend columns.",
    ],
  },
  {
    story:
      "As an Agency Account Lead, I want overspend flagged automatically, so I know which accounts broke their normal spend today.",
    acceptance: [
      "Given a client's spend today is more than 4× its highest daily spend in the last 90 days, when the brief refreshes, then the client is marked Overspend and counted in the summary.",
      "Given no client crosses that line, when I view the summary, then the Overspend count shows zero.",
    ],
  },
  {
    story:
      "As an Agency Account Lead, I want tired creatives called out, so I can refresh them before results drop.",
    acceptance: [
      "Given a creative's frequency is above 4 and its CTR is at least 15% below the median of the client's other creatives, when the brief loads, then it is flagged Fatigued and the client moves to Watch, unless it is already Overspend.",
      "Given a client is on Watch for fatigue, when I expand its row, then I see which of its creatives are fatigued.",
    ],
  },
  {
    story:
      "As an Agency Account Lead, I want to apply a suggested action from AdsGPT, so I can act without leaving the brief.",
    acceptance: [
      "Given AdsGPT suggests an action, when I review it, then I see what it will change and the expected result before I confirm.",
      "Given I confirm the action, when it is applied, then the row updates and a short success message appears (demo only, no real platform changes).",
    ],
  },
  {
    story:
      "As an Agency Account Lead, I want to undo my last action, so a mistake never sits unnoticed in a live account.",
    acceptance: [
      "Given I applied an action this session, when I click Undo, then the change reverts and the client's status is recalculated.",
    ],
  },
  {
    story:
      "As a Media Planner, I want to filter the portfolio by status, so I only work on the accounts that need attention.",
    acceptance: [
      "Given some clients are Overspend, when I filter to Overspend, then only those clients appear, with their actions still available.",
      "Given I clear the filter, when I return to All, then the summary counts match the full portfolio.",
    ],
  },
];

export const prdRequirements: PrdRequirement[] = [
  {
    feature: "Portfolio table",
    priority: "P0",
    rule: "One sortable table with client, status, today's spend, month-to-date pacing and creative health. Sorted Overspend first, then Watch, then Healthy, then by name.",
  },
  {
    feature: "Client status",
    priority: "P0",
    rule: "Overspend when today's spend is more than 4× the highest daily spend in the last 90 days. Otherwise Watch when month-to-date pacing is above 110% or any creative is fatigued. Otherwise Healthy.",
  },
  {
    feature: "Overspend summary",
    priority: "P0",
    rule: "Counts every client currently marked Overspend, so the lead sees today's risk in one number.",
  },
  {
    feature: "Creative fatigue",
    priority: "P0",
    rule: "Flag a creative when its 30-day frequency is above 4 and its CTR is at least 15% below the median of the client's other creatives.",
  },
  {
    feature: "Ask AdsGPT actions",
    priority: "P1",
    rule: "Suggest safe, reviewable actions, such as pausing a campaign or lowering a daily cap, from the chat or a client's row. In this prototype they apply to the session only.",
  },
  {
    feature: "Undo",
    priority: "P1",
    rule: "One-step undo of the last action, after which the client's status is recalculated with the same rules.",
  },
];

export const prdEdgeCases: PrdEdgeCase[] = [
  {
    scenario: "New client with partial 90-day history",
    behaviour:
      "Use the highest daily spend available so far as the baseline. The 4× overspend rule still applies, and pacing above 110% can still move the client to Watch.",
  },
  {
    scenario: "Paused campaign",
    behaviour:
      "Paused campaigns stay visible with zero spend today. The client's status rolls up from its other campaigns, and the action offers Resume instead of Pause.",
  },
  {
    scenario: "Currency mismatch",
    behaviour:
      "Convert everything to the agency's reporting currency (INR in this concept) before checking thresholds, and show the original currency in a footnote.",
  },
  {
    scenario: "Action fails on the platform side",
    behaviour:
      "Only update the row after the platform confirms the change. On failure, show an error, keep the status unchanged, and offer Retry or a copyable error for the planner.",
  },
];

export const prdOutOfScope: string[] = [
  "Billing, invoicing, and media-fee calculations.",
  "Creative generation, DCO, or asset production workflows.",
  "Cross-agency benchmarks or anonymized peer ranking.",
];
