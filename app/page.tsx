import Link from "next/link";
import { FadeIn, FadeInGroup } from "@/components/fade-in";
import { PrototypeSection } from "@/components/prototype-section";
import { SectionLink } from "@/components/section-link";
import { getEnrichedClients, getPortfolioSummary } from "@/lib/clients";

const navLinks = [
  { sectionId: "problem", label: "Problem" },
  { sectionId: "prototype", label: "Prototype" },
  { sectionId: "prd", label: "PRD" },
  { sectionId: "metrics", label: "Metrics" },
] as const;

/* Illustrative stats for the case-study narrative — not live data */
const problemStats = [
  { value: "23", line: "Active ad accounts before the first coffee" },
  { value: "₹1.8 Cr", line: "Monthly media under one lead's watch" },
  { value: "90 min", line: "Average daily time in dashboards and sheets" },
] as const;

function PillButton({
  sectionId,
  variant,
  children,
}: {
  sectionId: string;
  variant: "solid" | "outline";
  children: React.ReactNode;
}) {
  const base =
    "inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold transition-colors";
  const styles =
    variant === "solid"
      ? "bg-ink text-white hover:bg-navy"
      : "border border-line bg-white text-ink hover:border-muted/40";

  return (
    <SectionLink sectionId={sectionId} className={`${base} ${styles}`}>
      {children}
    </SectionLink>
  );
}

export default function Home() {
  const enrichedClients = getEnrichedClients();
  const portfolioSummary = getPortfolioSummary(enrichedClients);

  return (
    <div className="flex flex-col flex-1">
      <header className="sticky top-0 z-50 border-b border-line bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-6 lg:px-8">
          <Link
            href="/"
            className="shrink-0 text-sm font-semibold tracking-tight text-navy sm:text-base"
          >
            AdsGPT Command Center
          </Link>
          <nav
            className="hidden flex-1 justify-center gap-8 md:flex"
            aria-label="Primary"
          >
            {navLinks.map((link) => (
              <SectionLink
                key={link.sectionId}
                sectionId={link.sectionId}
                className="text-sm font-medium text-muted transition-colors hover:text-navy"
              >
                {link.label}
              </SectionLink>
            ))}
          </nav>
          <div className="ml-auto shrink-0">
            <PillButton sectionId="prototype" variant="solid">
              Open prototype
            </PillButton>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="relative overflow-hidden bg-linear-to-b from-hero-wash to-white">
          <div
            aria-hidden
            className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-lavender opacity-40 blur-3xl"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -right-16 top-32 h-80 w-80 rounded-full bg-coral opacity-40 blur-3xl"
          />

          <div className="relative mx-auto max-w-6xl px-6 pb-24 pt-16 lg:px-8 lg:pb-28 lg:pt-20">
            <FadeIn>
              <p className="mb-8 inline-flex items-center rounded-full border border-line bg-white px-4 py-1.5 text-xs font-medium text-muted shadow-[0_0_24px_rgba(184,169,254,0.45)]">
                Concept · Not affiliated with Venxr
              </p>
            </FadeIn>

            <FadeIn className="max-w-3xl">
              <h1 className="text-[40px] font-semibold leading-[1.1] tracking-tight text-navy sm:text-[52px] lg:text-[60px]">
                Every client. Every rupee. One morning brief.
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted">
                A portfolio command center for agency leads running 20+ ad
                accounts, built on AdsGPT&apos;s Govern and Analyze pillars.
              </p>
              <div className="mt-10 flex flex-wrap gap-4">
                <PillButton sectionId="prototype" variant="solid">
                  Open prototype
                </PillButton>
                <PillButton sectionId="prd" variant="outline">
                  Read the PRD
                </PillButton>
              </div>
            </FadeIn>

            <FadeIn className="mt-16">
              <div className="h-1.5 w-full max-w-md rounded-full brand-gradient opacity-80" />
              <p className="mt-4 text-xs text-muted">
                Unofficial PM case study · Om Raje
              </p>
            </FadeIn>
          </div>
        </section>

        <section
          id="problem"
          className="scroll-mt-20 border-t border-line bg-bg-alt py-20 lg:py-24"
        >
          <div className="mx-auto max-w-6xl px-6 lg:px-8">
            <FadeIn>
              <h2 className="text-3xl font-semibold tracking-tight text-navy">
                The problem
              </h2>
              <p className="mt-3 max-w-2xl text-muted">
                Agency leads stitch together platform tabs, pacing sheets, and
                Slack threads — then still walk into client stand-ups blind.
              </p>
            </FadeIn>

            <FadeInGroup className="mt-12 grid gap-6 sm:grid-cols-3">
              {problemStats.map((stat) => (
                <div
                  key={stat.value}
                  className="rounded-card border border-line bg-white p-8 shadow-card"
                >
                  <p className="text-4xl font-semibold tracking-tight text-navy">
                    {stat.value}
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-muted">
                    {stat.line}
                  </p>
                </div>
              ))}
            </FadeInGroup>
          </div>
        </section>

        <section
          id="prototype"
          className="scroll-mt-20 border-t border-line bg-white py-20 lg:py-24"
          aria-label="Monday morning brief prototype"
        >
          <PrototypeSection
            clients={enrichedClients}
            summary={portfolioSummary}
          />
        </section>

        <section
          id="prd"
          className="scroll-mt-20 border-t border-line bg-bg-alt py-20 lg:py-24"
          aria-label="PRD placeholder"
        />

        <section
          id="metrics"
          className="scroll-mt-20 border-t border-line py-20 lg:py-24"
          aria-label="Metrics placeholder"
        />
      </main>

      <footer className="border-t border-line py-10">
        <div className="mx-auto max-w-6xl px-6 text-center text-sm text-muted lg:px-8">
          AdsGPT Command Center — concept by Om Raje. Not affiliated with Venxr.
        </div>
      </footer>
    </div>
  );
}
