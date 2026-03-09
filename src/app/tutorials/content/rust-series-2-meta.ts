import type { TutorialMeta } from "./types";

export const tutorialMeta: TutorialMeta = {
  slug: "rust-series-2",
  title: "Rust Series 2: Intermediate Patterns",
  summary:
    "Continue from Rust basics with traits, generics, iterators, collections, and safe concurrency patterns.",
  category: "Backend Fundamentals",
  level: "Intermediate",
  duration: "2h 20m",
  coverGradient: "from-emerald-400 via-amber-500 to-orange-500",
  technologies: ["Rust", "Generics", "Concurrency"],
  outcomes: [
    "Use traits and generics to model reusable APIs",
    "Work fluently with collections, iterators, and closures",
    "Understand threads, channels, mutexes, and async direction",
  ],
  prerequisites: [
    "Comfortable with the Rust basics tutorial",
    "Familiar with ownership and borrowing",
    "Able to read small Rust programs and compiler errors",
  ],
};
