"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Button } from "@mehtrics/ui/button";
import { Container } from "@mehtrics/ui/container";
import { clientEnv } from "@mehtrics/env/client";
import { motion, useReducedMotion } from "motion/react";

import { AmbientBackground } from "@/components/ambient-background";

export function Hero() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <Container>
      <section className="relative border-x border-border overflow-hidden">
        <AmbientBackground />

        <div className="relative px-4 py-20 md:py-32">
          <motion.div
            initial="hidden"
            animate="show"
            variants={{
              hidden: {},
              show: {
                transition: prefersReducedMotion
                  ? {}
                  : { staggerChildren: 0.08 },
              },
            }}
            className="mx-auto max-w-4xl text-center"
          >
            <motion.h1
              variants={{
                hidden: prefersReducedMotion
                  ? { opacity: 1 }
                  : { opacity: 0, y: 12, filter: "blur(10px)" },
                show: {
                  opacity: 1,
                  y: 0,
                  filter: "blur(0px)",
                  transition: { duration: 0.6, ease: "easeOut" },
                },
              }}
              className="mt-10 text-balance text-4xl md:text-6xl font-extrabold tracking-tight"
            >
              Analytics you can trust, and actually own.
            </motion.h1>

            <motion.p
              variants={{
                hidden: prefersReducedMotion
                  ? { opacity: 1 }
                  : { opacity: 0, y: 10 },
                show: {
                  opacity: 1,
                  y: 0,
                  transition: { duration: 0.5, ease: "easeOut" },
                },
              }}
              className="mt-6 text-pretty text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto"
            >
              Track traffic, conversions, and events with a tiny script and a
              fast dashboard. No cookies. No creepy fingerprinting. Just clean,
              developer-friendly insights.
            </motion.p>
          </motion.div>
        </div>
      </section>
    </Container>
  );
}
