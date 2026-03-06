import type { TutorialMeta } from "./types";

export const tutorialMeta: TutorialMeta = {
  slug: "ci-cd",
  title: "Ship Next.js with CI/CD",
  summary:
    "Run lint/test/build checks per pull request and deploy confidently with clear rollback strategy.",
  category: "DevOps",
  level: "Advanced",
  duration: "1h 50m",
  coverGradient: "from-fuchsia-400 via-pink-500 to-rose-600",
  technologies: ["GitHub Actions", "Next.js", "Vercel"],
  outcomes: [
    "Build reliable PR quality gates",
    "Automate deployment per branch environment",
    "Recover quickly from bad releases",
  ],
  prerequisites: [
    "Git branch workflow knowledge",
    "Basic CI concepts",
    "Deployable Next.js project",
  ],
};

export default function CiCdTutorialContent() {
  return (
    <article className="space-y-6 text-blue-100/85">
      <section className="rounded-2xl border border-white/15 bg-white/5 p-5">
        <h3 className="text-white font-semibold mb-2">Pipeline stages</h3>
        <p>Validate, build, deploy, and observe. Keep each stage explicit.</p>
      </section>
      <section className="rounded-2xl border border-white/15 bg-white/5 p-5">
        <h3 className="text-white font-semibold mb-2">Minimal CI checklist</h3>
        <ul className="space-y-2 text-sm">
          <li>1. Run `npm run lint`</li>
          <li>2. Run `npm run build`</li>
          <li>3. Block merge if checks fail</li>
        </ul>
      </section>
    </article>
  );
}
