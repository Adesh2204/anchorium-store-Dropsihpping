import type { Variants } from "framer-motion";

/** Shared Framer Motion variants — consistent easing across the whole site. */
export const easeLuxe = [0.22, 1, 0.36, 1] as const;

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 26 },
  show: { opacity: 1, y: 0, transition: { duration: 0.85, ease: easeLuxe } },
};

export const fade: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 1.1, ease: easeLuxe } },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.94 },
  show: { opacity: 1, scale: 1, transition: { duration: 1.05, ease: easeLuxe } },
};

export const stagger = (delay = 0.08): Variants => ({
  hidden: {},
  show: { transition: { staggerChildren: delay, delayChildren: 0.05 } },
});

export const imageReveal: Variants = {
  hidden: { clipPath: "inset(0% 0% 100% 0%)" },
  show: {
    clipPath: "inset(0% 0% 0% 0%)",
    transition: { duration: 1.2, ease: easeLuxe },
  },
};

export const viewportOnce = { once: true, margin: "-12% 0px -12% 0px" } as const;
