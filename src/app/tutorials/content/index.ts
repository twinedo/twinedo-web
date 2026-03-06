import BunTutorialContent, { tutorialMeta as bun } from "./bun";
import CiCdTutorialContent, { tutorialMeta as ciCd } from "./ci-cd";
import NextPerformanceTutorialContent, {
  tutorialMeta as nextPerformance,
} from "./next-performance";
import ReactQueryTutorialContent, {
  tutorialMeta as reactQuery,
} from "./react-query";
import RustTutorialContent from "./rust";
import { tutorialMeta as rust } from "./rust/meta";
import type { TutorialMeta, TutorialModule } from "./types";

export const tutorialModules: TutorialModule[] = [
  { meta: bun, Content: BunTutorialContent },
  { meta: rust, Content: RustTutorialContent },
  { meta: reactQuery, Content: ReactQueryTutorialContent },
  { meta: nextPerformance, Content: NextPerformanceTutorialContent },
  { meta: ciCd, Content: CiCdTutorialContent },
];

export const tutorials: TutorialMeta[] = tutorialModules.map((item) => item.meta);

export const tutorialBySlug: Record<string, TutorialModule> = tutorialModules.reduce(
  (acc, item) => {
    acc[item.meta.slug] = item;
    return acc;
  },
  {} as Record<string, TutorialModule>
);

export type { TutorialMeta, TutorialModule } from "./types";
