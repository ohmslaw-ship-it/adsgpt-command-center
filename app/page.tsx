import Link from "next/link";
import { Container } from "@/components/container";
import { FadeIn, FadeInGroup } from "@/components/fade-in";
import { PrdSection } from "@/components/prd-section";
import { PrototypeSection } from "@/components/prototype-section";
import { SectionLink } from "@/components/section-link";

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
    "inline-flex items-center justify-center rounded-full px-7 py-3.5 text-button font-semibold transition-colors";
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
    <div className="flex flex-col flex-1">
      <header className="sticky top-0 z-50 border-b border-line bg-white/95 backdrop-blur-sm">
        <Container className="flex h-16 items-center gap-6">
          <Link
            href="/"
            className="shrink-0 text-nav font-semibold text-navy sm:text-body"
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
                className="text-nav font-medium text-muted transition-colors hover:text-navy"
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
        </Container>
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

          <Container className="relative pb-24 pt-16 lg:pb-28 lg:pt-20">
            <FadeIn>
              <p className="mb-8 inline-flex items-center rounded-full border border-line bg-white px-4 py-1.5 text-label-muted shadow-[0_0_24px_rgba(184,169,254,0.45)]">
                Concept · Not affiliated with Venxr
              </p>
            </FadeIn>

            <FadeIn className="max-w-3xl">
              <h1 className="text-hero">
                Every client. Every rupee.
                <br />
                One morning brief.
              </h1>
              <p className="mt-6 max-w-[620px] text-subline">
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
              <p className="mt-4 text-label-muted">
                Unofficial PM case study · Om Raje
              </p>
            </FadeIn>
          </Container>
        </section>

        <section
          id="problem"
          className="scroll-mt-20 border-t border-line bg-bg-alt py-20 lg:py-24"
        >
          <Container>
            <FadeIn>
              <h2 className="text-h2">The problem</h2>
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
                  <p className="text-stat">
                    {stat.value}
                  </p>
                  <p className="mt-3 text-muted">
                    {stat.line}
                  </p>
                </div>
              ))}
            </FadeInGroup>
          </Container>
        </section>

        <section
          id="prototype"
          className="scroll-mt-20 border-t border-line bg-white py-20 lg:py-24"
          aria-label="Monday morning brief prototype"
        >
          <PrototypeSection />
        </section>

        <section
          id="prd"
          className="scroll-mt-20 border-t border-line bg-[#F5F6FC] py-20 lg:py-24"
          aria-label="Product requirements"
        >
          <PrdSection />
        </section>

        <section
          id="metrics"
          className="scroll-mt-20 border-t border-line py-20 lg:py-24"
          aria-label="Metrics placeholder"
        />
      </main>

      <footer className="border-t border-line py-10">
        <Container className="text-center text-muted">
          AdsGPT Command Center — concept by Om Raje. Not affiliated with Venxr.
        </Container>
      </footer>
    </div>
  );
}
