import { GetStaticPaths, GetStaticProps } from "next";
import Head from "next/head";
import { ProjectLanding } from "@/components/ProjectLanding";
import { getProject, projects } from "@/lib/projects";
import { site } from "@/lib/site";

type ProjectPageProps = {
  slug: string;
};

export const getStaticPaths: GetStaticPaths = async () => ({
  paths: projects.map((project) => ({
    params: { slug: project.slug }
  })),
  fallback: false
});

export const getStaticProps: GetStaticProps<ProjectPageProps> = async ({
  params
}) => {
  const project = getProject(String(params?.slug));

  if (!project) {
    return {
      notFound: true
    };
  }

  return {
    props: {
      slug: project.slug
    }
  };
};

export default function ProjectPage({ slug }: ProjectPageProps) {
  const project = getProject(slug);

  if (!project) {
    return null;
  }

  return (
    <>
      <Head>
        <title>{`${project.name} | ${site.name}`}</title>
        <meta name="description" content={project.description} />
        <meta property="og:title" content={project.name} />
        <meta property="og:description" content={project.description} />
        <meta
          property="og:url"
          content={`${site.url}/projects/${project.slug}`}
        />
      </Head>
      <ProjectLanding project={project} />
    </>
  );
}
