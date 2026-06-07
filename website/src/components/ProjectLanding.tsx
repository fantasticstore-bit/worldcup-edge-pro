import Link from "next/link";
import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import { Project } from "@/lib/projects";
import { EmailCapture } from "@/components/EmailCapture";
import { FadeIn, HeroReveal } from "@/components/Motion";
import { ProductVisual } from "@/components/ProductVisual";

type ProjectLandingProps = {
  project: Project;
};

export function ProjectLanding({ project }: ProjectLandingProps) {
  return (
    <>
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-radial-grid bg-[length:auto,auto,38px_38px,38px_38px]" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-ink/35 to-ink" />
        <div className="relative mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-7xl gap-10 px-5 py-16 sm:px-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <HeroReveal>
            <Link
              href="/projects"
              className="inline-flex items-center gap-2 text-sm text-white/60 transition hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              All projects
            </Link>
            <p className="mt-8 text-sm font-medium uppercase tracking-[0.24em] text-neon">
              {project.eyebrow}
            </p>
            <h1 className="mt-4 text-4xl font-semibold tracking-normal text-white sm:text-6xl">
              {project.landing.headline}
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/70">
              {project.landing.subheadline}
            </p>
            <div className="mt-7 grid gap-3 sm:grid-cols-3">
              {[
                ["Stage", project.stage],
                ["Market", project.market],
                ["Next", project.nextMilestone]
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="rounded border border-white/10 bg-black/25 p-4 backdrop-blur"
                >
                  <p className="text-[11px] uppercase tracking-[0.18em] text-white/50">
                    {label}
                  </p>
                  <p className="mt-2 text-sm font-medium leading-5 text-white">
                    {value}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/contact"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded bg-neon px-5 font-semibold text-black transition hover:bg-white"
              >
                {project.landing.primaryCta}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/projects"
                className="inline-flex min-h-12 items-center justify-center rounded border border-white/15 bg-white/10 px-5 font-semibold text-white transition hover:bg-white/15"
              >
                View all products
              </Link>
            </div>
          </HeroReveal>
          <HeroReveal delay={0.12}>
            <ProductVisual project={project} />
          </HeroReveal>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-5 py-16 sm:px-8">
        <FadeIn className="mb-8 max-w-3xl">
          <p className="text-sm font-medium uppercase tracking-[0.24em] text-electric">
            System architecture
          </p>
          <h2 className="mt-3 text-3xl font-semibold text-white sm:text-5xl">
            Built around the decisions that matter.
          </h2>
          <p className="mt-4 text-lg leading-8 text-white/60">
            {project.oneLiner}
          </p>
        </FadeIn>
        <div className="grid gap-5 md:grid-cols-3">
          {project.landing.features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <FadeIn key={feature.title} delay={index * 0.07}>
                <div className="h-full rounded-lg border border-white/10 bg-white/[0.055] p-6 backdrop-blur-xl">
                  <div className="grid h-11 w-11 place-items-center rounded border border-electric/35 bg-electric/10 text-electric">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h2 className="mt-5 text-xl font-semibold text-white">
                    {feature.title}
                  </h2>
                  <p className="mt-3 text-sm leading-6 text-white/60">
                    {feature.description}
                  </p>
                </div>
              </FadeIn>
            );
          })}
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-7xl gap-5 px-5 py-6 sm:px-8 lg:grid-cols-[0.8fr_1.2fr]">
        <FadeIn>
          <div className="h-full rounded-lg border border-white/10 bg-panel/80 p-7">
            <p className="text-sm font-medium uppercase tracking-[0.22em] text-electric">
              Audience
            </p>
            <p className="mt-4 text-2xl font-semibold leading-9 text-white">
              {project.landing.audience}
            </p>
          </div>
        </FadeIn>
        <FadeIn delay={0.07}>
          <div className="h-full rounded-lg border border-white/10 bg-white/[0.055] p-7">
            <p className="text-sm font-medium uppercase tracking-[0.22em] text-neon">
              Build focus
            </p>
            <div className="mt-5 space-y-3">
              {project.landing.buildFocus.map((item) => (
                <div
                  key={item}
                  className="flex items-start gap-3 rounded border border-white/10 bg-black/25 p-4"
                >
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-neon" />
                  <p className="font-medium text-white">{item}</p>
                </div>
              ))}
            </div>
            <p className="mt-5 text-sm leading-6 text-white/60">
              {project.landing.proof}
            </p>
          </div>
        </FadeIn>
      </section>

      <EmailCapture />
    </>
  );
}
