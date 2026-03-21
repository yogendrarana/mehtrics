"use client";

import { Button } from "@mehtrics/ui/button";
import { Container } from "@mehtrics/ui/container";
import { ArrowRight, Terminal } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import Link from "next/link";

export function CTASection() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <Container className="border-b border-border">
      <section className="border-x border-border p-3 md:p-8">
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
        >
          <div className="relative overflow-hidden rounded-3xl border border-border bg-card/70 backdrop-blur supports-[backdrop-filter]:bg-card/50 p-8 md:p-12">
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-foreground/10 blur-3xl dark:bg-foreground/12" />
              <div className="absolute inset-0 opacity-25 bg-[radial-gradient(rgba(0,0,0,0.10)_1px,transparent_1px)] bg-size-[4px_4px] dark:bg-[radial-gradient(rgba(255,255,255,0.10)_1px,transparent_1px)]" />
            </div>

            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background/60 px-3 py-1 text-xs text-muted-foreground">
                <Terminal className="size-4" />
                Copy, paste, ship
              </div>

              <h3 className="text-3xl md:text-4xl font-bold tracking-tight text-balance">
                Start measuring what matters in minutes.
              </h3>

              <p className="text-muted-foreground text-lg text-pretty">
                Create an account, add the tracking snippet, and see traffic
                instantly. Upgrade later. No long-term contracts.
              </p>

              <Button render={<Link href="/signup" />}>
                Create an account
                <ArrowRight className="size-4" />
              </Button>
            </div>
          </div>
        </motion.div>
      </section>
    </Container>
  );
}
