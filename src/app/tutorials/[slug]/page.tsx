import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  ClockIcon,
  RocketLaunchIcon,
} from "@heroicons/react/24/outline";
import { Footer, Header, Section } from "@/components";
import { tutorialBySlug, tutorials } from "../content";

const levelStyles = {
  Beginner: "bg-emerald-400/20 text-emerald-100 border-emerald-300/30",
  Intermediate: "bg-blue-400/20 text-blue-100 border-blue-300/30",
  Advanced: "bg-rose-400/20 text-rose-100 border-rose-300/30",
};

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function TutorialDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const tutorialModule = tutorialBySlug[slug];

  if (!tutorialModule) {
    notFound();
  }

  const { meta: tutorial, Content } = tutorialModule;
  const relatedTutorials = tutorials
    .filter((item) => item.slug !== tutorial.slug)
    .slice(0, 3);

  return (
    <div className="w-full min-h-screen overflow-x-hidden">
      <Header />

      <div className="relative w-full min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-24 left-10 w-80 h-80 bg-cyan-500/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
          <div className="absolute top-1/2 left-1/3 w-56 h-56 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-2000" />
        </div>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_85%_50%_at_50%_0%,black_75%,transparent_110%)]" />

        <Section className="px-4">
          <div className="relative z-10 max-w-5xl mx-auto space-y-8">
            <Link
              href="/tutorials"
              className="inline-flex items-center gap-2 text-sm text-blue-100 hover:text-cyan-100 transition-colors"
            >
              <ArrowLeftIcon className="w-4 h-4" />
              Back to tutorials
            </Link>

            <section className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 md:p-10 shadow-2xl shadow-black/30">
              <div
                className={`w-full h-1.5 rounded-full bg-gradient-to-r ${tutorial.coverGradient} mb-6`}
              />
              <div className="space-y-6">
                <div className="flex flex-wrap gap-3">
                  <span
                    className={`text-xs px-2.5 py-1 rounded-full border ${levelStyles[tutorial.level]}`}
                  >
                    {tutorial.level}
                  </span>
                  <span className="text-xs px-2.5 py-1 rounded-full border border-white/25 bg-white/10 text-blue-100">
                    {tutorial.category}
                  </span>
                </div>

                <div className="space-y-4">
                  <h1 className="text-3xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-cyan-200">
                    {tutorial.title}
                  </h1>
                  <p className="text-blue-100/85 text-lg leading-relaxed">
                    {tutorial.summary}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="rounded-2xl border border-white/20 bg-white/5 p-4">
                    <p className="text-xs text-blue-100/70 uppercase tracking-wider">
                      Duration
                    </p>
                    <p className="mt-2 inline-flex items-center gap-2 text-white">
                      <ClockIcon className="w-4 h-4" />
                      {tutorial.duration}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/20 bg-white/5 p-4">
                    <p className="text-xs text-blue-100/70 uppercase tracking-wider">
                      Technologies
                    </p>
                    <p className="mt-2 text-white">{tutorial.technologies.length}</p>
                  </div>
                  <div className="rounded-2xl border border-white/20 bg-white/5 p-4">
                    <p className="text-xs text-blue-100/70 uppercase tracking-wider">
                      Outcomes
                    </p>
                    <p className="mt-2 text-white">{tutorial.outcomes.length}</p>
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-white/20 bg-white/10 backdrop-blur-xl p-6 md:p-8">
              <h2 className="text-2xl font-semibold text-white mb-4">
                Technologies
              </h2>
              <div className="flex flex-wrap gap-2">
                {tutorial.technologies.map((tech) => (
                  <span
                    key={tech}
                    className="rounded-full border border-white/20 bg-white/5 px-3 py-1.5 text-xs text-blue-100/90"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </section>

            <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="rounded-2xl border border-white/20 bg-white/10 backdrop-blur-xl p-6">
                <h2 className="text-xl font-semibold text-white mb-4">
                  What you will learn
                </h2>
                <ul className="space-y-3">
                  {tutorial.outcomes.map((outcome) => (
                    <li
                      key={outcome}
                      className="rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-blue-100/85 text-sm"
                    >
                      {outcome}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-2xl border border-white/20 bg-white/10 backdrop-blur-xl p-6">
                <h2 className="text-xl font-semibold text-white mb-4">
                  Prerequisites
                </h2>
                <ul className="space-y-3">
                  {tutorial.prerequisites.map((prerequisite) => (
                    <li
                      key={prerequisite}
                      className="rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-blue-100/85 text-sm"
                    >
                      {prerequisite}
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            <section className="rounded-2xl border border-white/20 bg-white/10 backdrop-blur-xl p-6 md:p-8">
              <h2 className="text-2xl font-semibold text-white mb-6">
                Tutorial content
              </h2>
              <Content />
            </section>

            <section className="rounded-2xl border border-white/20 bg-white/10 backdrop-blur-xl p-6 md:p-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <h2 className="text-2xl font-semibold text-white">
                  Continue learning
                </h2>
                <p className="inline-flex items-center gap-2 text-sm text-blue-100/80">
                  <RocketLaunchIcon className="w-4 h-4" />
                  Suggested next tutorials
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {relatedTutorials.map((item) => (
                  <Link
                    key={item.slug}
                    href={`/tutorials/${item.slug}`}
                    className="group rounded-xl border border-white/15 bg-white/5 p-4 hover:bg-white/10 hover:border-white/25 transition-all duration-300"
                  >
                    <div
                      className={`w-full h-1 rounded-full mb-4 bg-gradient-to-r ${item.coverGradient}`}
                    />
                    <p className="text-white text-sm font-medium mb-2 group-hover:text-cyan-100 transition-colors">
                      {item.title}
                    </p>
                    <p className="text-blue-100/75 text-xs line-clamp-2 mb-3">
                      {item.summary}
                    </p>
                    <p className="inline-flex items-center gap-1.5 text-xs text-blue-100/90">
                      Open tutorial
                      <ArrowRightIcon className="w-3.5 h-3.5" />
                    </p>
                  </Link>
                ))}
              </div>
            </section>
          </div>
        </Section>
      </div>

      <Footer />
    </div>
  );
}
