"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, type Variants } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HUDCorners } from "@/components/hud-corners";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";

interface Calculation {
  id: string;
  phenoage: number;
  chronological_age: number;
  age_difference: number;
  created_at: string;
}

function AnimatedNumber({ value }: { value: number }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const duration = 1100;
    const start = performance.now();

    function tick(now: number) {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(Math.round(value * eased * 10) / 10);
      if (t < 1) requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
  }, [value]);

  return <>{display.toFixed(1)}</>;
}

const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};

const card: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

export default function DashboardPage() {
  const { accessToken, isLoggedIn } = useAuth();
  const router = useRouter();
  const [latest, setLatest] = useState<Calculation | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoggedIn) {
      router.replace("/login");
      return;
    }

    api<Calculation[]>(`/history/?access_token=${accessToken}`)
      .then((data) => {
        if (data.length > 0) setLatest(data[0]);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isLoggedIn, accessToken, router]);

  if (!isLoggedIn) return null;

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="hud-label mb-2">Biological Profile</p>
          <h1 className="font-heading text-3xl sm:text-4xl font-bold mb-8">
            Your <span className="text-gold">Biological Age</span>
          </h1>
        </motion.div>

        {loading ? (
          <div className="grid gap-6 sm:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-36 rounded-lg bg-card/60 animate-pulse border border-gold/10" />
            ))}
          </div>
        ) : latest ? (
          <>
            <motion.div
              className="grid gap-6 sm:grid-cols-3"
              variants={stagger}
              initial="hidden"
              animate="show"
            >
              {/* PhenoAge — primary card */}
              <motion.div variants={card} className="sm:col-span-1">
                <Card className="hud-glow border-gold/20 bg-card/80 relative overflow-hidden">
                  <HUDCorners />
                  <CardHeader className="pb-1">
                    <CardTitle className="hud-label">Phenotypic Age</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="font-mono text-6xl font-bold text-gold leading-none">
                      <AnimatedNumber value={latest.phenoage} />
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">years</p>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Chronological Age */}
              <motion.div variants={card}>
                <Card className="hud-glow border-gold/20 bg-card/80 relative overflow-hidden">
                  <HUDCorners />
                  <CardHeader className="pb-1">
                    <CardTitle className="hud-label">Chronological Age</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="font-mono text-6xl font-bold leading-none">
                      {latest.chronological_age}
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">years</p>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Difference */}
              <motion.div variants={card}>
                <Card className="hud-glow border-gold/20 bg-card/80 relative overflow-hidden">
                  <HUDCorners />
                  <CardHeader className="pb-1">
                    <CardTitle className="hud-label">Difference</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p
                      className={`font-mono text-6xl font-bold leading-none ${
                        latest.age_difference < 0 ? "text-teal" : "text-red-400"
                      }`}
                    >
                      {latest.age_difference > 0 ? "+" : ""}
                      {latest.age_difference}
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                      {latest.age_difference < 0
                        ? "younger than your age"
                        : "older than your age"}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>

            <motion.div
              className="mt-6 flex flex-col sm:flex-row gap-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.4 }}
            >
              <Button
                onClick={() => router.push("/upload")}
                className="bg-gold hover:bg-gold-light text-background font-semibold cursor-pointer"
              >
                Upload New Report
              </Button>
              <Button
                onClick={() => router.push("/chat")}
                variant="outline"
                className="border-gold/30 hover:bg-gold/10 cursor-pointer"
              >
                Ask the Health Advisor
              </Button>
            </motion.div>
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="hud-glow border-gold/20 bg-card/80 relative overflow-hidden text-center py-12">
              <HUDCorners />
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  No results yet. Upload your first lab report to see your biological age.
                </p>
                <Button
                  onClick={() => router.push("/upload")}
                  className="bg-gold hover:bg-gold-light text-background font-semibold cursor-pointer"
                >
                  Upload Lab Report
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </main>
    </div>
  );
}
