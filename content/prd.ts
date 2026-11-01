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
    "Cut Monday portfolio review time from ~90 minutes to under 20.",
    "Surface overspend the same calendar day it happens, using a consistent rule across clients.",
    "Let the lead act in one click (with undo), not copy-paste into four platforms.",
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
      "As an Agency Account Lead, I want a single portfolio table sorted by severity, so that I open one view instead of 20 tabs.",
    acceptance: [
      "Given I land on the brief, when the portfolio loads, then clients appear with status Overspend, Watch, or Healthy and Overspend rows sort first.",
      "Given I search by client name, when I type a partial match, then the table filters without losing status pills or spend columns.",
      "Given a client is Healthy, when I expand nothing, then I still see today spend, MTD pacing, and creative health at a glance.",
    ],
  },
  {
    story:
      "As an Agency Account Lead, I want an Overspend Guard roll-up, so that I know how many accounts broke the daily cap today.",
    acceptance: [
      "Given a client's today spend exceeds 4× its peak single-day spend in the trailing 90 days, when the brief refreshes, then that client is marked Overspend and counted in the guard summary.",
      "Given no clients exceed the threshold, when I view the summary, then the guard shows zero and links to the empty filter state.",
    ],
  },
  {
    story:
      "As an Agency Account Lead, I want a Creative Fatigue roll-up, so that I refresh creative before CTR collapses.",
    acceptance: [
      "Given a creative's 30-day frequency is above 4 and its CTR is at least 15% below the median CTR of sibling creatives on that client, when the brief loads, then it is tagged Fatigued and the client moves to Watch unless already Overspend.",
      "Given the roll-up count, when I click through, then I see which clients have at least one fatigued creative.",
    ],
  },
  {
    story:
      "As an Agency Account Lead, I want to Ask AdsGPT to apply a governed action, so that I pause or cap spend without leaving the brief.",
    acceptance: [
      "Given I select a suggested action for a client, when I confirm, then the UI records the action locally and shows success with what changed.",
      "Given an action requires platform write access, when AdsGPT returns a plan, then I see the target entity and expected outcome before confirming.",
    ],
  },
  {
    story:
      "As an Agency Account Lead, I want to undo my last action, so that a mistaken pause does not sit until someone notices in-platform.",
    acceptance: [
      "Given I applied an action in this session, when I choose Undo, then overrides revert and portfolio status recalculates from baseline demo data plus any remaining session changes.",
      "Given I undo, when the toast clears, then the client row reflects the prior spend or pause state used for status rules.",
    ],
  },
  {
    story:
      "As a Media Planner, I want to filter the portfolio by status, so that I only work the accounts my lead flagged.",
    acceptance: [
      "Given the lead marked two clients Overspend and four Watch, when I filter to Overspend, then only those two rows appear with actions still available.",
      "Given I clear the filter, when I return to All, then counts in the summary cards match the full book again.",
    ],
  },
];

export const prdRequirements: PrdRequirement[] = [
  {
    feature: "Portfolio table",
    priority: "P0",
    rule: "One sortable table: client, status, today spend, MTD pacing bar, creative tags. Default sort: Overspend → Watch → Healthy, then name.",
  },
  {
    feature: "Overspend Guard roll-up",
    priority: "P0",
    rule: "Flag Overspend when today's spend is greater than 4× the peak single-day spend in the trailing 90 days (see overspendThresholdInr / isOverspend in lib/rules.ts).",
  },
  {
    feature: "Creative Fatigue roll-up",
    priority: "P0",
    rule: "Flag fatigue when frequency30d > 4 and ctr30d is below 85% of the median ctr30d among sibling creatives on the same client (see isCreativeFatigued in lib/rules.ts). Client enters Watch when fatigued unless already Overspend.",
  },
  {
    feature: "Ask AdsGPT actions",
    priority: "P1",
    rule: "Surface governed suggestions (e.g. pause campaign, reduce daily cap) from the client drawer; apply as session overrides for the prototype narrative.",
  },
  {
    feature: "Undo",
    priority: "P1",
    rule: "Single-step undo of the last session override; recalculate status using the same overspend and fatigue rules.",
  },
];

export const prdEdgeCases: PrdEdgeCase[] = [
  {
    scenario: "New client with no 90-day history",
    behaviour:
      "Use available history for max daily spend; if fewer than 7 days, show Watch with tooltip \"Insufficient history — guard uses partial baseline\" and exclude from Overspend Guard count until day 8.",
  },
  {
    scenario: "Planned sale-day spike",
    behaviour:
      "Allow a one-day planned spend marker (concept): when set, today's spend is compared against the planned cap instead of the 4× rule for that date only; guard summary notes \"planned spike.\"",
  },
  {
    scenario: "Paused campaign",
    behaviour:
      "Paused entities show zero today spend but remain visible; status derives from account-level roll-up. Actions offer \"Resume\" instead of pause when already paused.",
  },
  {
    scenario: "Currency mismatch",
    behaviour:
      "Normalize to the book's reporting currency (INR in this concept) for thresholds; show original currency in the drawer footnote when source differs.",
  },
  {
    scenario: "Action fails on the platform side",
    behaviour:
      "Keep the UI override only on confirmed success; on failure, show error state, do not change status, and offer retry or copy API error for the planner to handle in-platform.",
  },
];

export const prdOutOfScope: string[] = [
  "Billing, invoicing, and media-fee calculations.",
  "Creative generation, DCO, or asset production workflows.",
  "Cross-agency benchmarks or anonymized peer ranking.",
];
