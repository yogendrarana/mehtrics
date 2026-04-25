"use client";

import { Button } from "@mehtrics/ui/button";
import { Container } from "@mehtrics/ui/container";
import { GitHub } from "@mehtrics/ui/icons";
import { ArrowRight, BookOpen } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import Link from "next/link";

export function CTASection() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <Container className="border-b border-border">
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
            className="relative grid gap-8 px-4 md:px-0 lg:grid-cols-[1.1fr_0.9fr] lg:items-center"
          >
            <div className="space-y-4">
              <h3 className="text-3xl md:text-4xl font-bold tracking-tight text-balance">
                Ship analytics without handing your traffic to someone else.
              </h3>

              <p className="max-w-2xl text-lg text-muted-foreground text-pretty">
                Start with the docs, drop in the tracking snippet, and wire up
                the stack on your own terms. The product story works just as
                well without a hosted plan attached to it.
              </p>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Button render={<Link href="/docs" />}>
                  <BookOpen className="size-4" />
                  Open docs
                  <ArrowRight className="size-4" />
                </Button>
              </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-border bg-background/85 shadow-[0_24px_80px_-42px_rgba(0,0,0,0.55)]">
              <div className="flex items-center gap-2 border-b border-border px-4 py-3 text-xs text-muted-foreground">
                <span className="size-2 rounded-full bg-foreground/30" />
                <span className="size-2 rounded-full bg-foreground/20" />
                <span className="size-2 rounded-full bg-foreground/10" />
                <span className="ml-2">install snippet</span>
              </div>
              <div className="space-y-3 p-4 font-mono text-sm text-foreground/88">
                <div className="text-muted-foreground">
                  Add this once and start collecting traffic events.
                </div>
                <div className="overflow-x-auto rounded-xl border border-border bg-muted/40 p-4">
                  <pre className="whitespace-pre-wrap wrap-break-word">
                    <code>{`<script
  async
  src="/tracker.js"
  data-site="your-site-id"
></script>`}</code>
                  </pre>
                </div>
                <div className="text-xs text-muted-foreground">
                  Route guides, event examples, and API notes live in the docs.
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </Container>
  );
}
