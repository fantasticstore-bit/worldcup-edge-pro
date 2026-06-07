import Head from "next/head";
import Link from "next/link";
import {
  ArrowRight,
  Cpu,
  LineChart,
  Radar,
  Rocket,
  ShieldCheck,
  Sparkles
} from "lucide-react";
import { EmailCapture } from "@/components/EmailCapture";
import { HeroReveal, FadeIn } from "@/components/Motion";
import { ProjectGrid } from "@/components/ProjectGrid";
import { projects } from "@/lib/projects";
import { site } from "@/lib/site";

const principles = [
  {
    title: "AI-native",
    description: "Products that turn predictive models into practical workflows.",
    icon: Cpu
  },
  {
    title: "Operator-focused",
    description: "Interfaces built for decisions, review cycles and repeat use.",
    icon: LineChart
  },
  {
    title: "Launchable",
    description: "A portfolio designed to grow from MVPs into serious products.",
    icon: Rocket
  }
];

const labSignals = [
  { label: "Active builds", value: "04" },
  { label: "Core themes", value: "AI / BI / Assets" },
  { label: "Shipping mode", value: "Founder-led" }
];

const thesis = [
  {
    title: "Signals over noise",
    description:
      "Every product starts from a decision that people already make badly with spreadsheets, tabs or instinct.",
    icon: Radar
  },
  {
    title: "Useful before beautiful",
    description:
      "The interface has to help someone act faster, compare better and trust the next move.",
    icon: ShieldCheck
  },
  {
    title: "Premium by default",
    description:
      "Small tools can still feel serious: sharp typography, fast flows, credible data and clear positioning.",
    icon: Sparkles
  }
];

const featuredProject = projects.find((project) => project.slug === "lego-tracker");

export default function Home() {
  return (
    <>
      <Head>
        <title>{site.name} | AI, analytics and investment tools</title>
        <meta name="description" content={site.description} />
        <meta property="og:title" content={`${site.name} | Product Hub`} />
        <meta property="og:description" content={site.description} />
        <meta property="og:url" content={site.url} />
        <meta property="og:type" content="website" />
        <meta name="twitter:title" content={`${site.name} | Product Hub`} />
        <meta name="twitter:description" content={site.description} />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-radial-grid bg-[length:auto,auto,38px_38px,38px_38px]" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-ink/20 to-ink" />
        <div className="relative mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-7xl gap-10 px-5 py-16 sm:px-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <div>
            <HeroReveal>
              <div className="inline-flex items-center gap-2 rounded border border-neon/25 bg-neon/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-neon">
                <span className="h-2 w-2 rounded-full bg-neon shadow-glow" />
                Founder product hub
              </div>
              <h1 className="mt-6 max-w-5xl text-5xl font-semibold tracking-normal text-white sm:text-7xl lg:text-8xl">
                Marco Roberti builds decision engines.
              </h1>
              <p className="mt-6 max-w-2xl text-xl leading-8 text-white/70">
                AI, analytics and investment tools designed like serious
                products: sharp dashboards, practical models and workflows that
                turn messy signals into action.
              </p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/projects"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded bg-neon px-5 font-semibold text-black transition hover:bg-white"
                >
                  Enter the product lab
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex min-h-12 items-center justify-center rounded border border-white/15 bg-white/[0.08] px-5 font-semibold text-white transition hover:bg-white/[0.12]"
                >
                  Start a conversation
                </Link>
              </div>
            </HeroReveal>

            <div className="mt-10 grid gap-3 sm:grid-cols-3">
              {labSignals.map((signal, index) => (
                <HeroReveal key={signal.label} delay={0.1 + index * 0.06}>
                  <div className="rounded border border-white/10 bg-black/25 p-4 backdrop-blur">
                    <p className="text-xs uppercase tracking-[0.18em] text-white/50">
                      {signal.label}
                    </p>
                    <p className="mt-2 font-mono text-lg text-white">
                      {signal.value}
                    </p>
                  </div>
                </HeroReveal>
              ))}
            </div>
          </div>

          <HeroReveal delay={0.16}>
            <div className="relative overflow-hidden rounded-lg border border-white/10 bg-white/[0.055] p-5 shadow-blueglow backdrop-blur-xl">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(77,255,136,0.16),transparent_34%),radial-gradient(circle_at_78%_20%,rgba(49,168,255,0.2),transparent_30%)]" />
              <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.045)_1px,transparent_1px)] bg-[size:32px_32px]" />
              <div className="relative">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.22em] text-electric">
                      Portfolio cockpit
                    </p>
                    <h2 className="mt-2 text-2xl font-semibold text-white">
                      Product radar
                    </h2>
                  </div>
                  <div className="rounded border border-neon/30 bg-neon/10 px-3 py-1 font-mono text-sm text-neon">
                    ONLINE
                  </div>
                </div>

                <div className="mt-5 space-y-3">
                  {projects.map((project, index) => {
                    const Icon = project.icon;
                    return (
                      <Link
                        key={project.slug}
                        href={`/projects/${project.slug}`}
                        className="group flex items-center justify-between gap-4 rounded border border-white/10 bg-black/40 p-4 transition hover:border-neon/40 hover:bg-black/50"
                      >
                        <div className="flex items-center gap-3">
                          <div className="grid h-10 w-10 place-items-center rounded border border-white/10 bg-white/10 text-electric">
                            <Icon className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="font-semibold text-white">
                              {project.name}
                            </p>
                            <p className="mt-1 text-xs uppercase tracking-[0.16em] text-white/50">
                              {project.eyebrow}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-mono text-sm text-neon">
                            0{index + 1}
                          </p>
                          <p className="mt-1 text-xs text-white/50">
                            {project.status}
                          </p>
                        </div>
                      </Link>
                    );
                  })}
                </div>

                <div className="mt-5 grid grid-cols-3 gap-3">
                  {principles.map((principle) => {
                    const Icon = principle.icon;
                    return (
                      <div
                        key={principle.title}
                        className="rounded border border-white/10 bg-white/[0.05] p-3"
                      >
                        <Icon className="h-4 w-4 text-neon" />
                        <p className="mt-3 text-sm font-semibold text-white">
                          {principle.title}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </HeroReveal>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-5 py-16 sm:px-8">
        <FadeIn className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-neon">
              Operating thesis
            </p>
            <h2 className="mt-3 text-3xl font-semibold text-white sm:text-5xl">
              Small tools. Serious systems. Built to compound.
            </h2>
          </div>
          <p className="text-lg leading-8 text-white/60">
            This is not a portfolio of side projects. It is a product studio
            built around repeatable markets: prediction, operational
            intelligence, dashboards and alternative asset signals.
          </p>
        </FadeIn>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {thesis.map((item, index) => {
            const Icon = item.icon;
            return (
              <FadeIn key={item.title} delay={index * 0.06}>
                <div className="h-full rounded-lg border border-white/10 bg-white/[0.045] p-6 backdrop-blur">
                  <Icon className="h-6 w-6 text-electric" />
                  <h3 className="mt-5 text-xl font-semibold text-white">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-white/60">
                    {item.description}
                  </p>
                </div>
              </FadeIn>
            );
          })}
        </div>
      </section>

      {featuredProject ? (
        <section className="mx-auto w-full max-w-7xl px-5 py-16 sm:px-8">
          <FadeIn>
            <div className="relative overflow-hidden rounded-lg border border-neon/20 bg-white/[0.055] p-6 shadow-glow backdrop-blur-xl sm:p-8">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(77,255,136,0.18),transparent_32%),radial-gradient(circle_at_82%_15%,rgba(49,168,255,0.16),transparent_30%)]" />
              <div className="relative grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
                <div>
                  <p className="text-sm font-medium uppercase tracking-[0.24em] text-neon">
                    Featured build
                  </p>
                  <h2 className="mt-4 text-3xl font-semibold text-white sm:text-5xl">
                    LEGO Tracker is the first serious product bet.
                  </h2>
                  <p className="mt-5 text-lg leading-8 text-white/70">
                    The private prototype already works like a market cockpit:
                    portfolio value, watchlists, API sync, hot sets, momentum
                    filters, pulse scores and set-level buy/hold guidance.
                  </p>
                  <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                    <Link
                      href="/projects/lego-tracker"
                      className="inline-flex min-h-12 items-center justify-center gap-2 rounded bg-neon px-5 font-semibold text-black transition hover:bg-white"
                    >
                      Open LEGO Tracker
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                    <Link
                      href="/contact"
                      className="inline-flex min-h-12 items-center justify-center rounded border border-white/15 bg-white/10 px-5 font-semibold text-white transition hover:bg-white/15"
                    >
                      Request beta access
                    </Link>
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {[
                    ["Portfolio", "Owned sets, paid price, estimated value and gain."],
                    ["Pulse score", "A fast signal for momentum and set quality."],
                    ["Decision center", "Verdict, liquidity, sealed premium and data source."],
                    ["Watchlist", "Target prices and buy-zone monitoring."]
                  ].map(([title, body]) => (
                    <div
                      key={title}
                      className="rounded border border-white/10 bg-black/30 p-5"
                    >
                      <p className="font-semibold text-white">{title}</p>
                      <p className="mt-2 text-sm leading-6 text-white/60">
                        {body}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </FadeIn>
        </section>
      ) : null}

      <section className="mx-auto w-full max-w-7xl px-5 py-16 sm:px-8">
        <FadeIn className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-electric">
              Current products
            </p>
            <h2 className="mt-3 text-3xl font-semibold text-white sm:text-5xl">
              The current product stack.
            </h2>
          </div>
          <Link
            href="/projects"
            className="inline-flex items-center gap-2 text-sm font-semibold text-neon transition hover:text-white"
          >
            See all projects
            <ArrowRight className="h-4 w-4" />
          </Link>
        </FadeIn>
        <ProjectGrid />
      </section>

      <section className="mx-auto w-full max-w-7xl px-5 py-16 sm:px-8">
        <FadeIn className="mb-8 max-w-3xl">
          <p className="text-sm font-medium uppercase tracking-[0.24em] text-neon">
            Build queue
          </p>
          <h2 className="mt-3 text-3xl font-semibold text-white sm:text-5xl">
            What is moving next.
          </h2>
          <p className="mt-4 text-lg leading-8 text-white/60">
            The hub is designed to evolve in public: prototypes become MVPs,
            MVPs become products, and products earn their place in the stack.
          </p>
        </FadeIn>
        <div className="overflow-hidden rounded-lg border border-white/10 bg-white/[0.045] backdrop-blur-xl">
          {projects.map((project, index) => {
            const Icon = project.icon;
            return (
              <FadeIn key={project.slug} delay={index * 0.04}>
                <Link
                  href={`/projects/${project.slug}`}
                  className="grid gap-4 border-b border-white/10 p-5 transition last:border-b-0 hover:bg-white/[0.055] md:grid-cols-[auto_1fr_0.75fr_0.75fr_auto] md:items-center"
                >
                  <div className="flex items-center gap-3">
                    <div className="grid h-11 w-11 place-items-center rounded border border-white/10 bg-black/30 text-electric">
                      <Icon className="h-5 w-5" />
                    </div>
                    <p className="font-mono text-sm text-neon">0{index + 1}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">
                      {project.name}
                    </h3>
                    <p className="mt-1 text-sm text-white/60">
                      {project.oneLiner}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.16em] text-white/50">
                      Stage
                    </p>
                    <p className="mt-1 text-sm font-medium text-white/70">
                      {project.stage}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.16em] text-white/50">
                      Next
                    </p>
                    <p className="mt-1 text-sm font-medium text-white/70">
                      {project.nextMilestone}
                    </p>
                  </div>
                  <ArrowRight className="hidden h-5 w-5 text-white/40 md:block" />
                </Link>
              </FadeIn>
            );
          })}
        </div>
      </section>

      <EmailCapture />
    </>
  );
}
