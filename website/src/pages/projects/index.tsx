import Head from "next/head";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ProjectGrid } from "@/components/ProjectGrid";
import { FadeIn } from "@/components/Motion";
import { projects } from "@/lib/projects";
import { site } from "@/lib/site";

export default function ProjectsPage() {
  return (
    <>
      <Head>
        <title>{`Projects | ${site.name}`}</title>
        <meta
          name="description"
          content="Explore Marco Roberti's focused stack of AI, analytics and investment products."
        />
        <meta
          property="og:title"
          content={`Projects | ${site.name}`}
        />
        <meta
          property="og:description"
          content="A focused stack of AI, analytics and investment products."
        />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-radial-grid bg-[length:auto,auto,38px_38px,38px_38px]" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-ink" />
        <div className="relative mx-auto w-full max-w-7xl px-5 py-16 sm:px-8">
          <FadeIn className="max-w-4xl">
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-neon">
              Product portfolio
            </p>
            <h1 className="mt-4 text-4xl font-semibold text-white sm:text-6xl">
              A focused stack of AI, analytics and investment products.
            </h1>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-white/70">
              Each project targets a market where better data, cleaner
              dashboards and sharper prediction can change the quality of a
              decision.
            </p>
          </FadeIn>
          <div className="mt-10 grid gap-3 md:grid-cols-4">
            {projects.map((project, index) => (
              <FadeIn key={project.slug} delay={index * 0.05}>
                <Link
                  href={`/projects/${project.slug}`}
                  className="block h-full rounded-lg border border-white/10 bg-black/25 p-4 transition hover:border-neon/40 hover:bg-black/40"
                >
                  <p className="font-mono text-sm text-neon">0{index + 1}</p>
                  <h2 className="mt-3 font-semibold text-white">
                    {project.name}
                  </h2>
                  <p className="mt-2 text-xs uppercase tracking-[0.16em] text-white/50">
                    {project.status}
                  </p>
                </Link>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-5 py-16 sm:px-8">
        <FadeIn className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-electric">
              Live index
            </p>
            <h2 className="mt-3 text-3xl font-semibold text-white sm:text-5xl">
              Current and future builds.
            </h2>
          </div>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 text-sm font-semibold text-neon transition hover:text-white"
          >
            Discuss a build
            <ArrowRight className="h-4 w-4" />
          </Link>
        </FadeIn>
        <ProjectGrid />
      </section>
    </>
  );
}
