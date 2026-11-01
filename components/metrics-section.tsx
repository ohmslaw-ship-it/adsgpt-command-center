"use client";

import { Container } from "@/components/container";
import { Reveal, RevealGroup } from "@/components/reveal";
import {
  metricsFootnote,
  metricsMeta,
  metricsNorthStar,
  metricsSupporting,
  metricsTestStrip,
  type MetricsSupportingMetric,
} from "@/content/metrics";

const panelShadow = "shadow-panel-depth";

function SupportingMetricIcon({ icon }: { icon: MetricsSupportingMetric["icon"] }) {
  const className = "h-5 w-5";
  switch (icon) {
    case "overspend":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
          <path
            d="M12 3L4 7v6c0 5 3.5 8.5 8 10 4.5-1.5 8-5 8-10V7l-8-4z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <path
            d="M9 12l2 2 4-4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "acceptance":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
          <path
            d="M7 11l3 3 7-7"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <rect
            x="4"
            y="4"
            width="16"
            height="16"
            rx="3"
            stroke="currentColor"
            strokeWidth="1.5"
          />
        </svg>
      );
    case "false-alarm":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
          <path
            d="M12 8v5M12 16h.01"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path
            d="M10.3 4.5 2.6 18a1.5 1.5 0 0 0 1.3 2.2h16.2a1.5 1.5 0 0 0 1.3-2.2L13.7 4.5a1.5 1.5 0 0 0-2.6 0z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "weekly-active":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
          <circle cx="9" cy="8" r="3" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="17" cy="9" r="2.5" stroke="currentColor" strokeWidth="1.5" />
          <path
            d="M3 20c0-3 2.5-5 6-5s6 2 6 5M14 20c0-2 1.5-3.5 4-3.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      );
  }
}

export function MetricsSection() {
  return (
    <Container>
      <Reveal>
        <header className="mb-14 max-w-[820px]">
          <p className="text-label">{metricsMeta.label}</p>
          <h2 className="mt-3 text-h2">{metricsMeta.title}</h2>
          <p className="mt-3 text-subline">{metricsMeta.subtitle}</p>
        </header>
      </Reveal>

      <Reveal className="mb-8">
        <article
          className={`hover-card-primary rounded-3xl bg-white p-10 ${panelShadow}`}
        >
          <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:justify-between lg:gap-12">
              <div className="min-w-0 max-w-xl">
                <p className="text-label">{metricsNorthStar.label}</p>
                <h3 className="mt-3 text-h3">{metricsNorthStar.title}</h3>
                <p className="mt-3 text-body">{metricsNorthStar.rationale}</p>
              </div>
              <div className="shrink-0 text-left lg:text-right">
                <p
                  className="text-[64px] font-bold leading-none tracking-[-0.02em] text-navy tabular-nums"
                  aria-label={`From ${metricsNorthStar.baseline} to ${metricsNorthStar.target}`}
                >
                  {metricsNorthStar.baseline}
                  <svg
                    viewBox="0 0 32 32"
                    fill="none"
                    aria-hidden
                    className="mx-3 inline-block h-8 w-8 shrink-0 align-middle text-[#6B5BD6]"
                  >
                    <path
                      d="M6 16h18M18 10l6 6-6 6"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  {metricsNorthStar.target}
                </p>
                <p className="mt-2 text-[14px] font-medium uppercase tracking-[0.08em] text-fg-muted">
                  {metricsNorthStar.targetCaption}
                </p>
              </div>
            </div>

            <div className="mt-10">
              <div className="flex justify-between text-[13px] font-semibold uppercase tracking-[0.06em] text-fg-muted">
                <span>Baseline · {metricsNorthStar.baseline}</span>
                <span>Target · {metricsNorthStar.target}</span>
              </div>
              <div
                className="relative mt-3 h-2 overflow-hidden rounded-full bg-[#E8EBFC]"
                role="img"
                aria-label="Progress from baseline prep time to target"
              >
                <div className="absolute inset-y-0 left-0 w-full rounded-full brand-gradient opacity-70" />
                <span
                  className="absolute left-0 top-1/2 h-3 w-3 -translate-y-1/2 rounded-full border-2 border-white bg-navy shadow-sm"
                  aria-hidden
                />
                <span
                  className="absolute right-0 top-1/2 h-3 w-3 -translate-y-1/2 rounded-full border-2 border-white bg-lavender-dark shadow-sm"
                  aria-hidden
                />
            </div>
          </div>
        </article>
      </Reveal>

      <RevealGroup className="mb-12 grid items-stretch gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {metricsSupporting.map((metric) => (
          <div
            key={metric.name}
            className="hover-card-secondary flex h-full flex-col rounded-3xl bg-[#F3F4FE] p-8"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-lavender-dark shadow-[0_1px_2px_rgba(16,24,64,0.06)]">
              <SupportingMetricIcon icon={metric.icon} />
            </div>
            <p className="mt-5 text-[17px] font-semibold leading-snug text-navy">
              {metric.name}
            </p>
            <div className="min-h-0 flex-1" aria-hidden />
            <p className="text-stat">{metric.target}</p>
            <p className="mt-auto pt-2 text-muted">{metric.definition}</p>
          </div>
        ))}
      </RevealGroup>

      <Reveal>
        <div className="hover-card-secondary overflow-hidden rounded-3xl bg-white sm:p-10 lg:p-12">
          <h3 className="text-h3">{metricsTestStrip.heading}</h3>
          <ol className="relative mt-10 grid gap-10 md:grid-cols-3 md:gap-6">
            <div
              className="pointer-events-none absolute top-5 z-0 hidden h-px bg-[#D8CCFA] md:block md:left-[calc(100%/6)] md:w-[calc(100%*2/3)]"
              aria-hidden
            />
            {metricsTestStrip.steps.map((step) => (
              <li
                key={step.step}
                className="relative z-[1] flex flex-col items-start md:items-center md:text-center"
              >
                <span
                  className="relative z-[1] flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#EEEAFE] text-[16px] font-bold tabular-nums text-lavender-dark ring-4 ring-white"
                  aria-hidden
                >
                  {step.step}
                </span>
                <p className="mt-4 text-[18px] font-semibold text-navy">{step.title}</p>
                <p className="mt-2 text-body">
                  {step.lines[0]}
                  <br />
                  {step.lines[1]}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </Reveal>

      <Reveal>
        <p className="mt-8 text-center text-[14px] leading-relaxed text-fg-muted">
          {metricsFootnote}
        </p>
      </Reveal>
    </Container>
  );
}
