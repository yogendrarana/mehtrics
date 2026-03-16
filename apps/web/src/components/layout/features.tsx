"use client";

import { Badge } from "@mehtrics/ui/badge";
import { Button } from "@mehtrics/ui/button";
import { Container } from "@mehtrics/ui/container";
import { cn } from "@mehtrics/utils/cn";
import {
  ArrowRight,
  CircleCheck,
  Fingerprint,
  Gauge,
  Layers3,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import type * as React from "react";

export function Features() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <Container className="border-y border-border">
      <section id="features" className="border-x border-border bg-muted/30">
        <div className="px-4 py-20 md:py-28">
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
            <Badge variant="outline" className="rounded-full px-4 py-2">
              Bento features
            </Badge>
            <h2 className="mt-6 text-3xl md:text-4xl font-bold tracking-tight text-balance">
              Everything you need for modern traffic analytics.
            </h2>
            <p className="mt-4 text-muted-foreground text-lg text-pretty">
              Designed with a Vercel-style dashboard feel: sharp typography,
              crisp borders, and data that loads instantly.
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
            className="mt-12 mx-auto max-w-6xl grid gap-4 md:grid-cols-12"
          >
            <BentoCard
              className="md:col-span-7"
              icon={<Gauge className="size-4" />}
              title="Fast by default"
              description="A tiny script and a dashboard that stays snappy, even at scale."
              bullets={[
                "Realtime view with low latency",
                "No sampling and no guesswork",
                "Built for modern stacks",
              ]}
              prefersReducedMotion={prefersReducedMotion}
            />
            <BentoCard
              className="md:col-span-5"
              icon={<Fingerprint className="size-4" />}
              title="Privacy-first"
              description="No cookies. No fingerprinting. No surprises."
              bullets={[
                "GDPR-friendly defaults",
                "No raw IP storage",
                "Respectful analytics",
              ]}
              prefersReducedMotion={prefersReducedMotion}
            />

            <BentoCard
              className="md:col-span-5"
              icon={<Layers3 className="size-4" />}
              title="Events and conversions"
              description="Track what matters with clean events and flexible filters."
              bullets={[
                "Custom events and goals",
                "UTM and referrer breakdowns",
                "Device and geo insights",
              ]}
              prefersReducedMotion={prefersReducedMotion}
            />
            <BentoCard
              className="md:col-span-7"
              icon={<ShieldCheck className="size-4" />}
              title="Own your data"
              description="Self-host in minutes and keep analytics inside your boundary."
              bullets={[
                "Self-hostable setup",
                "Multiple sites per account",
                "Clean UI that your team will use",
              ]}
              prefersReducedMotion={prefersReducedMotion}
              highlight
            />

            <BentoSmall
              className="md:col-span-6"
              prefersReducedMotion={prefersReducedMotion}
              icon={<Sparkles className="size-4" />}
              title="Developer-friendly"
              description="Thoughtful defaults, solid docs, predictable behavior."
            />
            <BentoSmall
              className="md:col-span-6"
              prefersReducedMotion={prefersReducedMotion}
              icon={<CircleCheck className="size-4" />}
              title="Simple setup"
              description="Add one script tag, verify, and ship."
            />
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            variants={{
              hidden: prefersReducedMotion
                ? { opacity: 1 }
                : { opacity: 0, y: 12 },
              show: {
                opacity: 1,
                y: 0,
                transition: { duration: 0.55, ease: "easeOut" },
              },
            }}
            className="mt-12 flex items-center justify-center"
          >
            <Button
              variant="outline"
              className="bg-background/60"
              render={<Link href="/pricing" />}
            >
              See pricing
              <ArrowRight className="size-4" />
            </Button>
          </motion.div>
        </div>
      </section>
    </Container>
  );
}

function BentoCard({
  icon,
  title,
  description,
  bullets,
  className,
  prefersReducedMotion,
  highlight,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  bullets: string[];
  className?: string;
  prefersReducedMotion: boolean;
  highlight?: boolean;
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
      className={cn(
        "relative overflow-hidden rounded-3xl border border-border bg-card/70 backdrop-blur supports-[backdrop-filter]:bg-card/50 p-6",
        "shadow-[0_12px_40px_-32px_rgba(0,0,0,0.45)]",
        highlight &&
          "border-foreground/15 bg-[radial-gradient(800px_circle_at_20%_20%,rgba(0,0,0,0.08),transparent_55%)] dark:bg-[radial-gradient(800px_circle_at_20%_20%,rgba(255,255,255,0.08),transparent_55%)]",
        className,
      )}
    >
      <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity">
        <div className="absolute inset-0 bg-[radial-gradient(600px_circle_at_70%_10%,rgba(0,0,0,0.08),transparent_55%)] dark:bg-[radial-gradient(600px_circle_at_70%_10%,rgba(255,255,255,0.08),transparent_55%)]" />
      </div>

      <div className="relative">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background/60 px-3 py-1 text-xs text-muted-foreground">
              <span className="text-foreground/80">{icon}</span>
              <span>Feature</span>
            </div>
            <h3 className="text-xl font-semibold tracking-tight">{title}</h3>
            <p className="text-muted-foreground">{description}</p>
          </div>
        </div>

        <ul className="mt-6 space-y-2 text-sm text-muted-foreground">
          {bullets.map((bullet) => (
            <li key={bullet} className="flex items-start gap-2">
              <span className="mt-0.5 size-4 rounded-full border border-border bg-background/60 flex items-center justify-center">
                <span className="size-1.5 rounded-full bg-foreground/40" />
              </span>
              <span className="leading-relaxed">{bullet}</span>
            </li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
}

function BentoSmall({
  icon,
  title,
  description,
  className,
  prefersReducedMotion,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  className?: string;
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
      className={cn(
        "rounded-3xl border border-border bg-background/70 backdrop-blur supports-[backdrop-filter]:bg-background/50 p-6",
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <div className="size-9 rounded-xl border border-border bg-card/60 flex items-center justify-center text-foreground/80">
          {icon}
        </div>
        <div>
          <div className="text-base font-semibold tracking-tight">{title}</div>
          <div className="mt-1 text-sm text-muted-foreground">
            {description}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
