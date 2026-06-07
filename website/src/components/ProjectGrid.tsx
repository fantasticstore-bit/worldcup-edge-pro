import { projects } from "@/lib/projects";
import { FadeIn } from "@/components/Motion";
import { ProjectCard } from "@/components/ProjectCard";

export function ProjectGrid() {
  return (
    <div className="grid gap-5 md:grid-cols-2">
      {projects.map((project, index) => (
        <FadeIn key={project.slug} delay={index * 0.06}>
          <ProjectCard project={project} />
        </FadeIn>
      ))}
    </div>
  );
}
