import { Project } from "@/lib/projects";

type ProductVisualProps = {
  project: Project;
  compact?: boolean;
};

export function ProductVisual({ project, compact = false }: ProductVisualProps) {
  const Icon = project.icon;
  const accent =
    project.accent === "blue"
      ? "from-electric/30 to-electric/5"
      : project.accent === "mixed"
        ? "from-neon/25 to-electric/20"
        : "from-neon/30 to-neon/5";

  return (
    <div
      className={`relative overflow-hidden rounded-lg border border-white/10 bg-panel/80 p-5 shadow-blueglow ${
        compact ? "min-h-56" : "min-h-80"
      }`}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${accent}`} />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:26px_26px]" />
      <div className="relative flex h-full flex-col justify-between gap-8">
        <div className="flex items-center justify-between">
          <div className="rounded border border-white/15 bg-black/40 p-3 backdrop-blur">
            <Icon className="h-6 w-6 text-white" />
          </div>
          <span className="rounded border border-white/15 bg-black/40 px-3 py-1 text-xs text-white/70">
            {project.status}
          </span>
        </div>
        <div className="space-y-3">
          {project.landing.metrics.map((metric, index) => (
            <div
              key={metric}
              className="flex items-center justify-between rounded border border-white/10 bg-black/30 px-4 py-3 backdrop-blur"
            >
              <span className="text-sm text-white/70">{metric}</span>
              <span
                className={`h-2 rounded-full ${
                  index === 0
                    ? "w-24 bg-neon"
                    : index === 1
                      ? "w-16 bg-electric"
                      : "w-20 bg-white/50"
                }`}
              />
            </div>
          ))}
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-white/50">
            Product system
          </p>
          <p className="mt-2 text-xl font-semibold text-white">
            {project.name}
          </p>
        </div>
      </div>
    </div>
  );
}
