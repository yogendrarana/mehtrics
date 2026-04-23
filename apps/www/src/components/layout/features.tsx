"use client";

import { Container } from "@mehtrics/ui/container";
import { cn } from "@mehtrics/utils/cn";
import {
  ChartNoAxesColumn,
  CircleCheck,
  Globe,
  ScanSearch,
  ShieldCheck,
  Sparkles,
  TimerReset,
} from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import type * as React from "react";

export function Features() {
  const prefersReducedMotion = useReducedMotion();

  const proofItems = [
    {
      icon: <ChartNoAxesColumn className="size-4" />,
      label: "Readable traffic trends",
      body: "See spikes, sources, and converting paths without a maze of reports.",
    },
    {
      icon: <ShieldCheck className="size-4" />,
      label: "Privacy by default",
      body: "No cookies, no fingerprinting, and sensible defaults you do not need to fight.",
    },
    {
      icon: <ScanSearch className="size-4" />,
      label: "Built for debugging",
      body: "Trace referrers, campaigns, and event flows when you need answers fast.",
    },
    {
      icon: <Sparkles className="size-4" />,
      label: "Developer-friendly setup",
      body: "Thoughtful docs, predictable behavior, and a tracking snippet you can wire in quickly.",
    },
    {
      icon: <Globe className="size-4" />,
      label: "Useful acquisition context",
      body: "Break down traffic by source, campaign, geography, and device without losing clarity.",
    },
    {
      icon: <TimerReset className="size-4" />,
      label: "Fast path to insight",
      body: "Open the dashboard, scan the trends, and answer the question without wrestling the UI.",
    },
  ];

  return (
    <Container className="border-y border-border">
      <section className="relative border-x border-border bg-muted/30">
        <div className="mx-auto max-w-6xl py-10 md:py-20">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.25 }}
            variants={{
              hidden: prefersReducedMotion
                ? { opacity: 1 }
                : { opacity: 0, y: 14 },
              show: {
                opacity: 1,
                y: 0,
                transition: { duration: 0.55, ease: "easeOut" },
              },
            }}
            className="mx-auto max-w-3xl text-center"
          >
            <h2 className="mt-6 text-3xl md:text-4xl font-bold tracking-tight text-balance">
              Everything you need for modern traffic analytics.
            </h2>
            <p className="mt-4 text-muted-foreground text-lg text-pretty">
              Sharp, fast, and self-hostable. The landing page keeps the clean
              product energy, while the rest of the experience stays focused on
              the data your team actually checks.
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            variants={{
              hidden: {},
              show: {
                transition: prefersReducedMotion
                  ? {}
                  : { staggerChildren: 0.08 },
              },
            }}
            className="mx-auto mt-10 grid max-w-6xl gap-4 md:grid-cols-2 xl:grid-cols-3"
          >
            {proofItems.map((item) => (
              <ProofCard
                key={item.label}
                prefersReducedMotion={Boolean(prefersReducedMotion)}
                icon={item.icon}
                label={item.label}
                body={item.body}
              />
            ))}
          </motion.div>
        </div>
      </section>
    </Container>
  );
}

function ProofCard({
  icon,
  label,
  body,
  prefersReducedMotion,
}: {
  icon: React.ReactNode;
  label: string;
  body: string;
  prefersReducedMotion: boolean;
}) {
  return (
    <motion.div
      variants={{
        hidden: prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 14 },
        show: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.55, ease: "easeOut" },
        },
      }}
      className="border border-border bg-background/70 p-5 backdrop-blur supports-backdrop-filter:bg-background/50"
    >
      <div className="flex items-center gap-3 text-sm font-medium">
        <span className="flex size-8 items-center justify-center rounded-full border border-border bg-card/70 text-foreground/80">
          {icon}
        </span>
        {label}
      </div>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">{body}</p>
    </motion.div>
  );
}
