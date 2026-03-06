import Link from "next/link";
import {
  ArrowRightIcon,
  ClockIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import { Footer, Header, Section } from "@/components";
import { tutorials } from "./content";

const levelStyles = {
  Beginner: "bg-emerald-400/20 text-emerald-100 border-emerald-300/30",
  Intermediate: "bg-blue-400/20 text-blue-100 border-blue-300/30",
  Advanced: "bg-rose-400/20 text-rose-100 border-rose-300/30",
};

export default function TutorialsPage() {
  return (
    <div className="w-full min-h-screen overflow-x-hidden">
      <Header />

      <div className="relative w-full min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-cyan-500/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-2000" />
        </div>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_85%_50%_at_50%_0%,black_75%,transparent_110%)]" />

        <Section className="px-4">
          <div className="relative z-10 max-w-6xl mx-auto">
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 md:p-10 shadow-2xl shadow-black/30 mb-10">
              <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
                <div className="max-w-3xl space-y-4">
                  <p className="inline-flex items-center gap-2 text-xs tracking-[0.2em] uppercase text-cyan-100/80">
                    <SparklesIcon className="w-4 h-4" />
                    Learning Hub
                  </p>
                  <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-cyan-200">
                    Tutorials for Real Product Work
                  </h1>
                  <p className="text-blue-100/85 text-lg leading-relaxed">
                    Pick a tutorial and jump into structured, practical lessons
                    focused on frontend, architecture, and shipping workflows.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="px-4 py-2 rounded-xl bg-white/10 border border-white/20 text-sm text-blue-100">
                    {tutorials.length} tutorials
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {tutorials.map((tutorial) => (
                <article
                  key={tutorial.slug}
                  className="group h-full flex flex-col rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl overflow-hidden hover:bg-white/10 hover:border-white/20 hover:-translate-y-1 transition-all duration-300"
                >
                  <div
                    className={`h-1.5 w-full bg-gradient-to-r ${tutorial.coverGradient}`}
                  />
                  <div className="p-6 h-full flex flex-col gap-5">
                    <div className="flex items-center justify-between gap-3">
                      <span
                        className={`text-xs px-2.5 py-1 rounded-full border ${levelStyles[tutorial.level]}`}
                      >
                        {tutorial.level}
                      </span>
                      <span className="text-xs text-blue-100/80">
                        {tutorial.category}
                      </span>
                    </div>

                    <div className="space-y-3">
                      <h2 className="text-xl font-semibold text-white group-hover:text-cyan-100 transition-colors">
                        {tutorial.title}
                      </h2>
                      <p className="text-sm leading-relaxed text-blue-100/80 line-clamp-3">
                        {tutorial.summary}
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-xs text-blue-100/80">
                      <div className="inline-flex items-center gap-1.5">
                        <ClockIcon className="w-4 h-4" />
                        {tutorial.duration}
                      </div>
                      <div>{tutorial.technologies.length} topics</div>
                    </div>

                    <Link
                      href={`/tutorials/${tutorial.slug}`}
                      className="mt-auto inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white/10 border border-white/20 py-2.5 text-sm text-white hover:bg-gradient-to-r hover:from-blue-500 hover:to-cyan-500 hover:border-transparent transition-all duration-300"
                    >
                      Start tutorial
                      <ArrowRightIcon className="w-4 h-4" />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </Section>
      </div>

      <Footer />
    </div>
  );
}
