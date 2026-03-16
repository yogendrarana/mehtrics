"use client";

import { motion, useReducedMotion } from "motion/react";

// Deterministic particle field to avoid SSR/client hydration mismatches.
const particles = Array.from({ length: 24 }, (_, index) => {
  const left = (index * 37) % 100;
  const top = (index * 53) % 100;
  const delay = ((index * 11) % 60) / 10; // 0.0 .. 5.9
  const duration = 8 + ((index * 7) % 9); // 8 .. 16
  const size = 2 + ((index * 5) % 4); // 2 .. 5

  return {
    id: index,
    left: `${left}%`,
    top: `${top}%`,
    delay,
    duration,
    size,
  };
});

export function AmbientBackground() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <motion.div
        className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(30,30,30,0.12),transparent_36%),radial-gradient(circle_at_80%_18%,rgba(80,78,72,0.12),transparent_34%),radial-gradient(circle_at_50%_88%,rgba(60,60,56,0.1),transparent_36%)]"
        animate={
          prefersReducedMotion
            ? {}
            : { backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"] }
        }
        transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
      />
      <div className="absolute inset-0 opacity-35 bg-[radial-gradient(rgba(0,0,0,0.12)_1px,transparent_1px)] bg-size-[3px_3px]" />
      {particles.map((particle) => (
        <motion.span
          key={particle.id}
          className="absolute rounded-full bg-black/25"
          style={{
            left: particle.left,
            top: particle.top,
            width: particle.size,
            height: particle.size,
          }}
          animate={
            prefersReducedMotion
              ? {}
              : { y: [0, -18, 0], opacity: [0.2, 0.85, 0.2] }
          }
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}
