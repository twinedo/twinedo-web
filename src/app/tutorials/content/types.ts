import type { ReactNode } from "react";

export type TutorialLevel = "Beginner" | "Intermediate" | "Advanced";

export type TutorialMeta = {
  slug: string;
  title: string;
  summary: string;
  category: string;
  level: TutorialLevel;
  duration: string;
  coverGradient: string;
  technologies: string[];
  outcomes: string[];
  prerequisites: string[];
};

export type TutorialModule = {
  meta: TutorialMeta;
  Content: () => ReactNode;
};
