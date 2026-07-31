import type { Transition, Variants } from "framer-motion";

export const D = {
  instant: 0.09,
  quick: 0.16,
  settle: 0.24,
  travel: 0.32,
  arrive: 0.48,
  breath: 1.6,
} as const;

export const FALL: Transition = { duration: D.settle, ease: [0.32, 0, 0.24, 1] };
export const LIFT: Transition = { duration: D.quick, ease: [0.4, 0, 0.4, 1] };
export const DRAW: Transition = { duration: D.arrive, ease: [0.16, 0.6, 0.2, 1] };
export const QUICK: Transition = { duration: D.quick, ease: [0.32, 0, 0.24, 1] };

export const descend: Variants = {
  hidden: { opacity: 0, y: -8 },
  show: { opacity: 1, y: 0, transition: FALL },
  exit: { opacity: 0, y: -4, transition: LIFT },
};

export const fade: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: QUICK },
  exit: { opacity: 0, transition: { duration: D.instant } },
};

export function stagger(delay = 0, each = 0.06): Variants {
  return {
    hidden: {},
    show: { transition: { delayChildren: delay, staggerChildren: each } },
  };
}

export const sillDraw: Variants = {
  hidden: { scaleX: 0 },
  show: { scaleX: 1, transition: DRAW },
};
