import Head from "next/head";
import Link from "next/link";
import { ArrowRight, Cpu, LineChart, Rocket } from "lucide-react";
import { EmailCapture } from "@/components/EmailCapture";
import { HeroReveal, FadeIn } from "@/components/Motion";
import { ProjectGrid } from "@/components/ProjectGrid";
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

export default function Home() {
  return (
    <>
      <Head>
        <title>{site.name} | AI, analytics and investment tools</title>
        <meta name="description" content={site.description} />
        <meta property="og:title" content={`${site.name} | Product Hub`} />
        <meta property="og:description" content={site.description} />
        <meta property="og:url" content={site.url} />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-radial-grid bg-[length:auto,auto,38px_38px,38px_38px]" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-ink/25 to-ink" />
        <div className="relative mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-7xl flex-col justify-center px-5 py-16 sm:px-8">
          <HeroReveal className="max-w-4xl">
            <p className="text-sm font-medium uppercase tracking-[0.26em] text-neon">
              Product hub
            </p>
            <h1 className="mt-5 text-5xl font-semibold tracking-normal text-white sm:text-7xl lg:text-8xl">
              Marco Roberti
            </h1>
            <p className="mt-6 max-w-2xl text-xl leading-8 text-white/70">
              Building AI, analytics and investment tools.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/projects"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded bg-neon px-5 font-semibold text-black transition hover:bg-white"
              >
                Explore Projects
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex min-h-12 items-center justify-center rounded border border-white/15 bg-white/[0.08] px-5 font-semibold text-white transition hover:bg-white/[0.12]"
              >
                Contact
              </Link>
            </div>
          </HeroReveal>

          <div className="mt-14 grid gap-4 md:grid-cols-3">
            {principles.map((principle, index) => {
              const Icon = principle.icon;
              return (
                <HeroReveal key={principle.title} delay={0.12 + index * 0.08}>
                  <div className="h-full rounded-lg border border-white/10 bg-white/[0.055] p-5 backdrop-blur-xl">
                    <Icon className="h-5 w-5 text-electric" />
                    <h2 className="mt-4 text-lg font-semibold text-white">
                      {principle.title}
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-white/60">
                      {principle.description}
                    </p>
                  </div>
                </HeroReveal>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-5 py-16 sm:px-8">
        <FadeIn className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-electric">
              Current products
            </p>
            <h2 className="mt-3 text-3xl font-semibold text-white sm:text-4xl">
              A scalable portfolio of product bets.
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

      <EmailCapture />
    </>
  );
}
