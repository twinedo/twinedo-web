import type { TutorialMeta } from "./types";

export const tutorialMeta: TutorialMeta = {
  slug: "next-performance",
  title: "Next.js Performance Toolkit",
  summary:
    "Improve real-world performance with rendering boundaries, media strategy, and measurable budgets.",
  category: "Performance",
  level: "Intermediate",
  duration: "1h 20m",
  coverGradient: "from-lime-400 via-green-500 to-emerald-600",
  technologies: ["Next.js", "Web Vitals", "Image Optimization"],
  outcomes: [
    "Measure baseline performance",
    "Reduce client bundle overhead",
    "Improve LCP and interaction smoothness",
  ],
  prerequisites: [
    "Basic Next.js knowledge",
    "Experience profiling in browser devtools",
    "General Core Web Vitals awareness",
  ],
};

export default function NextPerformanceTutorialContent() {
  return (
    <article className="space-y-6 text-blue-100/85">
      <section className="rounded-2xl border border-white/15 bg-white/5 p-5">
        <h3 className="text-white font-semibold mb-2">Focus metrics first</h3>
        <p>
          Start with measurable targets for LCP, CLS, and INP before changing
          architecture or component boundaries.
        </p>
      </section>

      <section className="rounded-2xl border border-white/15 bg-white/5 p-5">
        <h3 className="text-white font-semibold mb-2">Server and client split</h3>
        <p>
          Keep heavy rendering on the server when possible. Move only genuinely
          interactive pieces to client components.
        </p>
      </section>
    </article>
  );
}
