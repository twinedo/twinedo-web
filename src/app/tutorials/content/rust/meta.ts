import type { TutorialMeta } from "../types";

export const tutorialMeta: TutorialMeta = {
  slug: "rust",
  title: "Rust Basics for Beginners",
  summary:
    "Learn ownership, borrowing, and project structure with practical examples from a web engineer perspective.",
  category: "Backend Fundamentals",
  level: "Beginner",
  duration: "1h 30m",
  coverGradient: "from-orange-400 via-amber-500 to-yellow-500",
  technologies: ["Rust", "Cargo", "CLI"],
  outcomes: [
    "Understand ownership and borrowing",
    "Create and run cargo projects",
    "Build confidence reading Rust compiler feedback",
  ],
  prerequisites: [
    "Comfortable with JavaScript/TypeScript",
    "Basic command-line usage",
    "Willingness to learn strict compile-time checks",
  ],
};
