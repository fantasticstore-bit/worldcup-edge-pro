import Head from "next/head";
import { ProjectGrid } from "@/components/ProjectGrid";
import { FadeIn } from "@/components/Motion";
import { site } from "@/lib/site";

export default function ProjectsPage() {
  return (
    <>
      <Head>
        <title>{`Projects | ${site.name}`}</title>
        <meta
          name="description"
          content="Explore Marco Roberti's AI, analytics and investment product portfolio."
        />
      </Head>
      <section className="mx-auto w-full max-w-7xl px-5 py-16 sm:px-8">
        <FadeIn className="max-w-3xl">
          <p className="text-sm font-medium uppercase tracking-[0.24em] text-neon">
            Projects
          </p>
          <h1 className="mt-4 text-4xl font-semibold text-white sm:text-6xl">
            AI, analytics and investment tools in one hub.
          </h1>
          <p className="mt-5 text-lg leading-8 text-white/70">
            Current builds and future launches from Marco Roberti, organized as
            a product portfolio that can grow over time.
          </p>
        </FadeIn>
        <div className="mt-10">
          <ProjectGrid />
        </div>
      </section>
    </>
  );
}
