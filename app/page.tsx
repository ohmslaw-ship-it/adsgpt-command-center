import { Container } from "@/components/container";
import { FadeIn, FadeInGroup } from "@/components/fade-in";
import { HeroBackground } from "@/components/hero-background";
import { MetricsSection } from "@/components/metrics-section";
import { PrdSection } from "@/components/prd-section";
import { PrototypeSection } from "@/components/prototype-section";
import { SectionLink } from "@/components/section-link";
import { SiteHeader } from "@/components/site-header";

/* Illustrative stats for the case-study narrative — not live data */
const problemStats = [
  {
    value: "23",
    line: "Active ad accounts before the first coffee",
    iconColor: "text-lavender-dark",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden>
        <rect
          x="3"
          y="3"
          width="8"
          height="8"
          rx="2"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <rect
          x="13"
          y="3"
          width="8"
          height="8"
          rx="2"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <rect
          x="3"
          y="13"
          width="8"
          height="8"
          rx="2"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <rect
          x="13"
          y="13"
          width="8"
          height="8"
          rx="2"
          stroke="currentColor"
          strokeWidth="1.5"
        />
      </svg>
    ),
  },
  {
    value: "₹1.8 Cr",
    line: "Monthly media under one lead's watch",
    iconColor: "text-coral",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden>
        <path
          d="M4 18V6M4 18h16M4 18l4-5 4 3 4-6 4 8"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    value: "90 min",
    line: "Average daily time in dashboards and sheets",
    iconColor: "text-[#8a6500]",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden>
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
        <path
          d="M12 7v5l3 2"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
] as const;

function HeroButton({
  sectionId,
  variant,
  children,
}: {
  sectionId: string;
  variant: "solid" | "outline";
  children: React.ReactNode;
}) {
  const base =
    "inline-flex h-12 items-center justify-center rounded-full px-7 text-[16px] font-semibold transition-colors";
  const styles =
    variant === "solid"
      ? "bg-ink text-white hover:bg-navy"
      : "border border-line bg-white text-body hover:border-muted/40";

  return (
    <SectionLink sectionId={sectionId} className={`${base} ${styles}`}>
      {children}
    </SectionLink>
  );
}

export default function Home() {
  return (
    <div className="flex w-full min-w-0 flex-col flex-1">
      <SiteHeader />

      <main className="w-full min-w-0 flex-1">
        <section className="section-full-bleed relative -mt-[72px] flex min-h-[100svh] flex-col overflow-hidden pt-[72px]">
          <HeroBackground />

          <Container className="relative -mt-8 flex flex-1 flex-col items-center justify-center pb-28 pt-8 text-center lg:pb-32">
            <FadeIn className="flex w-full flex-col items-center">
              <p className="mb-8 inline-flex items-center rounded-full border border-line bg-white px-4 py-1.5 text-[14px] font-semibold text-muted shadow-[0_0_24px_rgba(184,169,254,0.45)]">
                Concept · Not affiliated with Venxr
              </p>
            </FadeIn>

            <FadeIn className="w-full max-w-[880px]">
              <h1 className="text-[44px] font-bold leading-[1.05] tracking-[-0.025em] text-navy text-hero-glow lg:text-[68px]">
                Every client. Every rupee.
                <br />
                One morning brief.
              </h1>
              <p className="mx-auto mt-6 max-w-[640px] text-[20px] leading-[1.65] text-body">
                A portfolio command center for agency leads running 20+ ad
                accounts, built on AdsGPT&apos;s Govern and Analyze pillars.
              </p>
              <div className="mt-10 flex flex-wrap justify-center gap-4">
                <HeroButton sectionId="prototype" variant="solid">
                  Open prototype
                </HeroButton>
                <HeroButton sectionId="prd" variant="outline">
                  Read the PRD
                </HeroButton>
              </div>
            </FadeIn>

            <FadeIn className="mt-16 flex w-full flex-col items-center">
              <div className="h-1.5 w-full max-w-md rounded-full brand-gradient opacity-80" />
              <p className="mt-4 text-label-muted">
                Unofficial PM case study · Om Raje
              </p>
            </FadeIn>
          </Container>
        </section>

        <section
          id="problem"
          className="scroll-mt-20 section-full-bleed bg-white py-20 lg:py-28"
        >
          <Container>
            <FadeIn className="mb-14">
              <h2 className="text-h2">The problem</h2>
              <p className="mt-3 max-w-2xl text-subline">
                Agency leads stitch together platform tabs, pacing sheets, and
                Slack threads — then still walk into client stand-ups blind.
              </p>
            </FadeIn>

            <FadeInGroup className="grid gap-6 sm:grid-cols-3">
              {problemStats.map((stat) => (
                <div
                  key={stat.value}
                  className="rounded-3xl bg-[#F3F4FE] p-10"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white shadow-[0_1px_2px_rgba(16,24,64,0.06)]">
                    <span className={stat.iconColor}>{stat.icon}</span>
                  </div>
                  <p className="mt-6 text-stat-problem">{stat.value}</p>
                  <div
                    className="mt-3 h-0.5 w-12 rounded-full bg-gradient-to-r from-[#FF7D85] to-[#B8A9FE]"
                    aria-hidden
                  />
                  <p className="mt-4 text-body">{stat.line}</p>
                </div>
              ))}
            </FadeInGroup>
          </Container>
        </section>

        <section
          id="prototype"
          className="scroll-mt-20 section-full-bleed section-lavender-band py-20 lg:py-28"
          aria-label="Monday morning brief prototype"
        >
          <PrototypeSection />
        </section>

        <section
          id="prd"
          className="scroll-mt-20 section-full-bleed bg-white py-20 lg:py-28"
          aria-label="Product requirements"
        >
          <PrdSection />
        </section>

        <section
          id="metrics"
          className="scroll-mt-20 section-full-bleed section-lavender-band py-20 lg:py-28"
          aria-label="Success metrics"
        >
          <MetricsSection />
        </section>
      </main>

      <footer className="section-full-bleed border-t border-line py-10">
        <Container className="text-center text-muted">
          AdsGPT Command Center — concept by Om Raje. Not affiliated with Venxr.
        </Container>
      </footer>
    </div>
  );
}
