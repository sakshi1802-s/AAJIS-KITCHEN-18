import { motion, useReducedMotion } from "motion/react";

const SPARKS = [
  { x: -70, y: -26, color: "var(--saffron)", delay: 0 },
  { x: 66, y: -34, color: "var(--terracotta)", delay: 0.06 },
  { x: -44, y: 22, color: "var(--leaf)", delay: 0.12 },
  { x: 52, y: 26, color: "var(--maroon)", delay: 0.18 },
  { x: 0, y: -52, color: "var(--saffron)", delay: 0.1 },
];

/**
 * Animation 5 of 5: the order-placed moment — a steel thali lands and a few
 * sparks scatter. Hand-drawn rather than a Lottie file so there's no runtime
 * dependency and it inherits the theme colours.
 */
export function OrderPlacedCelebration() {
  const reduceMotion = useReducedMotion();

  return (
    <div className="relative mx-auto size-28" aria-hidden="true">
      {!reduceMotion &&
        SPARKS.map((spark, i) => (
          <motion.span
            key={i}
            className="absolute top-1/2 left-1/2 size-2 rounded-full"
            style={{ backgroundColor: spark.color }}
            initial={{ opacity: 0, x: 0, y: 0, scale: 0.4 }}
            animate={{ opacity: [0, 1, 0], x: spark.x, y: spark.y, scale: [0.4, 1, 0.6] }}
            transition={{ duration: 0.9, delay: 0.15 + spark.delay, ease: "easeOut" }}
          />
        ))}

      <motion.svg
        viewBox="0 0 120 120"
        className="relative size-28"
        initial={reduceMotion ? false : { scale: 0.7, opacity: 0, rotate: -8 }}
        animate={{ scale: 1, opacity: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 220, damping: 16 }}
      >
        <circle cx="60" cy="60" r="46" className="fill-secondary stroke-terracotta" strokeWidth="3" />
        <circle cx="60" cy="60" r="34" className="fill-card" />
        <motion.path
          d="M44 61 L55 72 L78 49"
          fill="none"
          className="stroke-leaf"
          strokeWidth="7"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={reduceMotion ? false : { pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.45, delay: 0.15, ease: "easeOut" }}
        />
      </motion.svg>
    </div>
  );
}
