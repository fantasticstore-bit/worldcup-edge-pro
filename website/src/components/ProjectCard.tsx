import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Project } from "@/lib/projects";
import { ProductVisual } from "@/components/ProductVisual";

type ProjectCardProps = {
  project: Project;
};

export function ProjectCard({ project }: ProjectCardProps) {
  const Icon = project.icon;

  return (
    <article className="group overflow-hidden rounded-lg border border-white/10 bg-white/[0.055] shadow-glow backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-neon/40 hover:bg-white/[0.075]">
      <ProductVisual project={project} compact />
      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.22em] text-electric">
              {project.eyebrow}
            </p>
            <h3 className="mt-2 flex items-center gap-2 text-xl font-semibold text-white">
              <Icon className="h-5 w-5 text-neon" />
              {project.name}
            </h3>
          </div>
          <span className="shrink-0 rounded border border-white/10 bg-white/10 px-2.5 py-1 text-xs text-white/60">
            {project.status}
          </span>
        </div>
        <p className="mt-4 min-h-20 text-sm leading-6 text-white/60">
          {project.oneLiner}
        </p>
        <div className="mt-5 rounded border border-white/10 bg-black/25 p-3">
          <div className="flex items-center justify-between gap-3">
            <p className="text-[11px] uppercase tracking-[0.16em] text-white/50">
              Stage
            </p>
            <p className="text-right text-xs font-medium text-white/70">
              {project.stage}
            </p>
          </div>
          <div className="mt-3 h-px bg-white/10" />
          <div className="mt-3 flex items-center justify-between gap-3">
            <p className="text-[11px] uppercase tracking-[0.16em] text-white/50">
              Next
            </p>
            <p className="text-right text-xs font-medium text-neon">
              {project.nextMilestone}
            </p>
          </div>
        </div>
        <div className="mt-5 grid grid-cols-3 gap-2">
          {project.landing.metrics.map((metric) => (
            <div
              key={metric}
              className="rounded border border-white/10 bg-black/25 px-3 py-2"
            >
              <p className="truncate text-[11px] uppercase tracking-[0.16em] text-white/50">
                {metric}
              </p>
            </div>
          ))}
        </div>
        <Link
          href={`/projects/${project.slug}`}
          className="mt-6 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded border border-neon/45 bg-neon/10 px-4 text-sm font-semibold text-neon transition hover:bg-neon hover:text-black"
        >
          Open Project
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>
    </article>
  );
}
