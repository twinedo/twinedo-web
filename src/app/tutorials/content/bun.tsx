import type { TutorialMeta } from "./types";

export const tutorialMeta: TutorialMeta = {
  slug: "bun",
  title: "Bun for Fast Next.js Tooling",
  summary:
    "Use Bun to speed up dependency install and local scripts while keeping your Next.js workflow stable.",
  category: "Tooling",
  level: "Beginner",
  duration: "45m",
  coverGradient: "from-cyan-400 via-blue-500 to-indigo-500",
  technologies: ["Bun", "Next.js", "TypeScript"],
  outcomes: [
    "Install and run scripts using Bun",
    "Compare npm and Bun script execution",
    "Keep package manager behavior predictable",
  ],
  prerequisites: [
    "Node.js already installed",
    "Basic terminal usage",
    "Existing Next.js project",
  ],
};

export default function BunTutorialContent() {
  return (
    <article className="space-y-6 text-blue-100/85">
      <section className="rounded-2xl border border-white/15 bg-white/5 p-5">
        <h3 className="text-white font-semibold mb-2">Why Bun here</h3>
        <p>
          Bun reduces install and command overhead for local development. You
          can use it as a drop-in script runner in most Next.js projects.
        </p>
      </section>

      <section className="rounded-2xl border border-white/15 bg-white/5 p-5">
        <h3 className="text-white font-semibold mb-2">Quick setup</h3>
        <pre className="text-xs md:text-sm bg-slate-950/80 border border-white/15 rounded-xl p-4 overflow-x-auto text-cyan-100">
{`# install bun
curl -fsSL https://bun.sh/install | bash

# install dependencies
bun install

# run next dev
bun run dev`}
        </pre>
      </section>

      <section className="rounded-2xl border border-white/15 bg-white/5 p-5">
        <h3 className="text-white font-semibold mb-2">Pragmatic tip</h3>
        <p>
          Keep one lockfile strategy per team. If you standardize on Bun, use
          `bun.lock` as the source of truth to avoid dependency drift.
        </p>
      </section>
    </article>
  );
}
