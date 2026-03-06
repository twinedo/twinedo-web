import type { TutorialMeta } from "./types";

export const tutorialMeta: TutorialMeta = {
  slug: "react-query",
  title: "React Query Without State Chaos",
  summary:
    "Model loading, error, and cache behavior in one place for list/detail pages and mutations.",
  category: "Data Layer",
  level: "Intermediate",
  duration: "1h 10m",
  coverGradient: "from-sky-400 via-blue-500 to-violet-500",
  technologies: ["React Query", "TypeScript", "REST API"],
  outcomes: [
    "Create typed query hooks",
    "Use staleTime and invalidation correctly",
    "Handle mutation success and rollback paths",
  ],
  prerequisites: [
    "Comfortable with React hooks",
    "API integration experience",
    "Basic TypeScript interface usage",
  ],
};

export default function ReactQueryTutorialContent() {
  return (
    <article className="space-y-6 text-blue-100/85">
      <section className="rounded-2xl border border-white/15 bg-white/5 p-5">
        <h3 className="text-white font-semibold mb-2">Query hook pattern</h3>
        <pre className="text-xs md:text-sm bg-slate-950/80 border border-white/15 rounded-xl p-4 overflow-x-auto text-cyan-100">
{`export const useProjects = () =>
  useQuery({
    queryKey: ["projects"],
    queryFn: fetchProjects,
    staleTime: 30_000,
  });`}
        </pre>
      </section>

      <section className="rounded-2xl border border-white/15 bg-white/5 p-5">
        <h3 className="text-white font-semibold mb-2">Mutation flow</h3>
        <p>
          For create/update/delete actions, invalidate only the affected query
          keys. This keeps UI fresh without excessive refetching.
        </p>
      </section>
    </article>
  );
}
