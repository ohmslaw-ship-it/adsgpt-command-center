export type MetricsSupportingMetric = {
  name: string;
  target: string;
  definition: string;
  icon: "overspend" | "acceptance" | "false-alarm" | "weekly-active";
};

export type MetricsTestStep = {
  step: number;
  title: string;
  lines: [string, string];
};

export const metricsMeta = {
  label: "METRICS",
  title: "How we'd know it's working",
  subtitle:
    "One number that matters, a few that keep it honest, and a plan to prove it before rollout.",
} as const;

export const metricsNorthStar = {
  label: "NORTH STAR",
  title: "Monday review prep time per account lead",
  rationale:
    "If prep time drops without missed overspends, the brief is earning its place in the Monday routine — not adding another tab to ignore.",
  baseline: "3h",
  target: "20m",
  targetCaption: "target",
} as const;

export const metricsSupporting: MetricsSupportingMetric[] = [
  {
    name: "Overspend caught the same day",
    target: "≥ 95%",
    definition: "Overspends flagged before the day ends.",
    icon: "overspend",
  },
  {
    name: "Action acceptance rate",
    target: "≥ 60%",
    definition: "AI suggestions applied without edits.",
    icon: "acceptance",
  },
  {
    name: "False alarm rate",
    target: "≤ 10%",
    definition: "Flags the account lead dismisses as wrong.",
    icon: "false-alarm",
  },
  {
    name: "Weekly active account leads",
    target: "80%",
    definition: "Team members who open the brief every week.",
    icon: "weekly-active",
  },
];

export const metricsTestStrip = {
  heading: "How we'd test it",
  steps: [
    {
      step: 1,
      title: "Pilot",
      lines: [
        "5 account leads and 40 clients for 2 weeks,",
        "compared with manual prep.",
      ],
    },
    {
      step: 2,
      title: "Guardrails",
      lines: [
        "No auto-applied budget changes, and every action",
        "logged and reversible.",
      ],
    },
    {
      step: 3,
      title: "Rollout",
      lines: [
        "Expand when the North Star and false alarm targets",
        "hold for 2 straight weeks.",
      ],
    },
  ] satisfies MetricsTestStep[],
};

export const metricsFootnote =
  "All targets are illustrative assumptions for this concept, not Venxr data.";
