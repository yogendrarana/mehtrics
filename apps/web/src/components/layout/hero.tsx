"use client";

import { Button } from "@mehtrics/ui/button";
import { Container } from "@mehtrics/ui/container";
import { ArrowRight } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { AmbientBackground } from "@/components/ambient-background";
import { SiteOverview } from "@/components/dashboard/site-overview";

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

            <motion.div
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
              className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3"
            >
              <Button
                size="xl"
                className="h-12 px-6 sm:px-8"
                render={<Link href="/signup" />}
              >
                Get started
                <ArrowRight className="size-4" />
              </Button>
              <Button
                size="xl"
                variant="outline"
                className="h-12 px-6 sm:px-8 bg-background/60 backdrop-blur supports-backdrop-filter:bg-background/40"
                render={<Link href="#demo" />}
              >
                See the dashboard
              </Button>
            </motion.div>
          </motion.div>

          <motion.div
            id="demo"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.25 }}
            variants={{
              hidden: prefersReducedMotion
                ? { opacity: 1 }
                : { opacity: 0, y: 18 },
              show: {
                opacity: 1,
                y: 0,
                transition: { duration: 0.6, ease: "easeOut" },
              },
            }}
            className="mt-16 md:mt-20 mx-auto max-w-6xl"
          >
            <div className="rounded-xl border bg-card/70 overflow-hidden">
              <SiteOverview
                mode="embed"
                compact
                title="Analytics"
                subtitle="A real dashboard preview, using the same UI as the app."
                initialData={{
                  totals: { visitors: 12482, pageviews: 41093, events: 6208 },
                  series: {
                    visitors: [
                      { date: "2026-03-01", value: 420 },
                      { date: "2026-03-02", value: 502 },
                      { date: "2026-03-03", value: 488 },
                      { date: "2026-03-04", value: 560 },
                      { date: "2026-03-05", value: 610 },
                      { date: "2026-03-06", value: 640 },
                      { date: "2026-03-07", value: 590 },
                      { date: "2026-03-08", value: 710 },
                      { date: "2026-03-09", value: 742 },
                      { date: "2026-03-10", value: 780 },
                      { date: "2026-03-11", value: 820 },
                      { date: "2026-03-12", value: 860 },
                      { date: "2026-03-13", value: 900 },
                      { date: "2026-03-14", value: 960 },
                    ],
                    views: [
                      { date: "2026-03-01", value: 1200 },
                      { date: "2026-03-02", value: 1320 },
                      { date: "2026-03-03", value: 1280 },
                      { date: "2026-03-04", value: 1410 },
                      { date: "2026-03-05", value: 1520 },
                      { date: "2026-03-06", value: 1580 },
                      { date: "2026-03-07", value: 1490 },
                      { date: "2026-03-08", value: 1710 },
                      { date: "2026-03-09", value: 1830 },
                      { date: "2026-03-10", value: 1900 },
                      { date: "2026-03-11", value: 2010 },
                      { date: "2026-03-12", value: 2140 },
                      { date: "2026-03-13", value: 2290 },
                      { date: "2026-03-14", value: 2410 },
                    ],
                    events: [
                      { date: "2026-03-01", value: 140 },
                      { date: "2026-03-02", value: 180 },
                      { date: "2026-03-03", value: 160 },
                      { date: "2026-03-04", value: 210 },
                      { date: "2026-03-05", value: 240 },
                      { date: "2026-03-06", value: 260 },
                      { date: "2026-03-07", value: 220 },
                      { date: "2026-03-08", value: 290 },
                      { date: "2026-03-09", value: 310 },
                      { date: "2026-03-10", value: 330 },
                      { date: "2026-03-11", value: 360 },
                      { date: "2026-03-12", value: 390 },
                      { date: "2026-03-13", value: 420 },
                      { date: "2026-03-14", value: 460 },
                    ],
                  },
                  breakdowns: {
                    pages: [
                      { label: "/", value: 6200 },
                      { label: "/pricing", value: 4900 },
                      { label: "/docs", value: 2100 },
                      { label: "/blog/privacy", value: 1600 },
                      { label: "/dashboard", value: 980 },
                    ],
                    referrers: [
                      { label: "Direct", value: 5200 },
                      { label: "google.com", value: 2400 },
                      { label: "github.com", value: 1100 },
                      { label: "x.com", value: 730 },
                      { label: "vercel.com", value: 410 },
                    ],
                    countries: [
                      { label: "US", value: 6400 },
                      { label: "DE", value: 1800 },
                      { label: "GB", value: 1200 },
                      { label: "IN", value: 980 },
                      { label: "NP", value: 640 },
                    ],
                    devices: [
                      { label: "desktop", value: 7200 },
                      { label: "mobile", value: 4100 },
                      { label: "tablet", value: 210 },
                    ],
                    browsers: [
                      { label: "Chrome", value: 6200 },
                      { label: "Safari", value: 2400 },
                      { label: "Firefox", value: 980 },
                      { label: "Edge", value: 610 },
                    ],
                    os: [
                      { label: "macOS", value: 3200 },
                      { label: "Windows", value: 2800 },
                      { label: "Linux", value: 2100 },
                      { label: "iOS", value: 1400 },
                      { label: "Android", value: 820 },
                    ],
                  },
                }}
              />
            </div>
          </motion.div>
        </div>
      </section>
    </Container>
  );
}
