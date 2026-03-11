import type { TutorialMeta } from "./types";

export const tutorialMeta: TutorialMeta = {
  slug: "rust-series-3",
  title: "Rust Series 3: Advanced Patterns",
  summary:
    "Continue from intermediate Rust with lifetimes, smart pointers, async fundamentals, macros, and testing workflows.",
  category: "Backend Fundamentals",
  level: "Advanced",
  duration: "3h 10m",
  coverGradient: "from-violet-400 via-sky-400 via-orange-400 to-yellow-400",
  technologies: ["Rust", "Async", "Macros", "Testing"],
  outcomes: [
    "Understand lifetime annotations and common borrowing relationships",
    "Choose between Box, Rc, RefCell, and other smart pointer patterns",
    "Build intuition for async Rust, macros, and testing strategy",
  ],
  prerequisites: [
    "Comfortable with the Rust basics and intermediate tutorials",
    "Familiar with ownership, borrowing, traits, and threads",
    "Able to read multi-file Rust examples and compiler feedback",
  ],
};
