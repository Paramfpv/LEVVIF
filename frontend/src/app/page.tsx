"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, type Variants } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { HUDCorners } from "@/components/hud-corners";
import { useAuth } from "@/lib/auth";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut" } },
};

const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

export default function Home() {
  const { isLoggedIn, isLoading } = useAuth();
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (isLoading) return;
    if (isLoggedIn) {
      router.replace("/dashboard");
    } else {
      setReady(true);
    }
  }, [isLoggedIn, isLoading, router]);

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <h1 className="font-heading text-5xl font-bold text-gold">LEWIF</h1>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero */}
      <section className="flex-1 flex items-center justify-center px-4 py-20 sm:py-32">
        <motion.div
          className="max-w-3xl mx-auto text-center"
          variants={stagger}
          initial="hidden"
          animate="show"
        >
          <motion.p
            variants={fadeUp}
            className="hud-label mb-5"
          >
            Biological Age Calculator · PhenoAge Protocol
          </motion.p>

          <motion.h1
            variants={fadeUp}
            className="font-heading text-5xl sm:text-7xl font-bold leading-tight tracking-tight"
          >
            Know your{" "}
            <span className="text-gold">true age</span>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
          >
            Your birth certificate tells one story. Your blood tells another.
            LEWIF calculates your biological age from standard blood biomarkers
            using the clinically validated Levine PhenoAge formula.
          </motion.p>

          <motion.div
            variants={fadeUp}
            className="mt-10 flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Button
              onClick={() => router.push("/calculate")}
              className="bg-gold hover:bg-gold-light text-background font-semibold text-base px-8 py-6 cursor-pointer"
            >
              Try It Free — No Account Needed
            </Button>
            <Button
              onClick={() => router.push("/login")}
              variant="outline"
              className="border-gold/30 hover:bg-gold/10 text-base px-8 py-6 cursor-pointer"
            >
              Create Account
            </Button>
          </motion.div>

          <motion.p variants={fadeUp} className="mt-4 text-sm text-muted-foreground/50">
            Upload a lab report. Get your biological age in seconds.
          </motion.p>
        </motion.div>
      </section>

      {/* Social proof bar */}
      <motion.section
        className="border-y border-gold/10 py-8"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
            {[
              { value: "9", label: "Blood Biomarkers" },
              { value: "2018", label: "Levine PhenoAge Study" },
              { value: "AI", label: "Powered Report Reading" },
              { value: "Free", label: "To Get Started" },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="font-mono text-3xl font-bold text-gold">{stat.value}</p>
                <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 sm:py-28 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <p className="hud-label mb-4">Protocol</p>
            <h2 className="font-heading text-3xl sm:text-5xl font-bold">
              Three steps to your{" "}
              <span className="text-gold">biological age</span>
            </h2>
          </motion.div>

          <motion.div
            className="grid sm:grid-cols-3 gap-8"
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
          >
            {[
              {
                step: "01",
                title: "Upload Your Report",
                description:
                  "Take a photo or upload a PDF of your blood test results. Our AI reads it instantly.",
              },
              {
                step: "02",
                title: "Get Your PhenoAge",
                description:
                  "We extract 9 key biomarkers and calculate your biological age using the Levine PhenoAge formula.",
              },
              {
                step: "03",
                title: "Understand & Improve",
                description:
                  "Chat with your personal health advisor to understand your results and get actionable recommendations.",
              },
            ].map((item) => (
              <motion.div key={item.step} variants={fadeUp}>
                <Card className="hud-glow border-gold/10 bg-card/60 relative overflow-hidden h-full">
                  <HUDCorners />
                  <CardContent className="pt-8 pb-6">
                    <span className="font-mono text-5xl font-bold text-gold/15">
                      {item.step}
                    </span>
                    <h3 className="font-heading text-xl font-semibold mt-4 mb-3">
                      {item.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {item.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 sm:py-28 px-4 bg-card/20">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <p className="hud-label mb-4">Capabilities</p>
            <h2 className="font-heading text-3xl sm:text-5xl font-bold">
              More than a{" "}
              <span className="text-gold">calculator</span>
            </h2>
          </motion.div>

          <motion.div
            className="grid sm:grid-cols-2 gap-6"
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
          >
            {[
              {
                title: "AI-Powered Report Reading",
                description:
                  "No manual data entry. Upload your lab report as a PDF or photo — our AI extracts all 9 biomarkers automatically.",
              },
              {
                title: "Personal Health Advisor",
                description:
                  "An AI chatbot that knows your health history, remembers your lifestyle, and gives personalized, evidence-based advice.",
              },
              {
                title: "Track Over Time",
                description:
                  "Every calculation is saved. See how your biological age changes with your lifestyle choices, diet, and exercise.",
              },
              {
                title: "Clinically Validated",
                description:
                  "Built on the Levine 2018 PhenoAge formula — published research using NHANES data, not a proprietary black box.",
              },
            ].map((feature) => (
              <motion.div key={feature.title} variants={fadeUp}>
                <Card className="hud-glow border-gold/10 bg-card/60 relative overflow-hidden h-full">
                  <HUDCorners />
                  <CardContent className="pt-6 pb-6">
                    <h3 className="font-heading text-lg font-semibold mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 sm:py-28 px-4">
        <motion.div
          className="max-w-2xl mx-auto text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
        >
          <h2 className="font-heading text-3xl sm:text-5xl font-bold mb-6">
            Ready to know your{" "}
            <span className="text-gold">true age</span>?
          </h2>
          <p className="text-muted-foreground text-lg mb-10">
            It takes less than a minute. Upload a lab report and find out if
            you&apos;re aging faster or slower than your years.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => router.push("/calculate")}
              className="bg-gold hover:bg-gold-light text-background font-semibold text-base px-8 py-6 cursor-pointer"
            >
              Try It Free
            </Button>
            <Button
              onClick={() => router.push("/login")}
              variant="outline"
              className="border-gold/30 hover:bg-gold/10 text-base px-8 py-6 cursor-pointer"
            >
              Create Account
            </Button>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gold/10 py-10 px-4">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="font-heading text-xl font-bold text-gold">LEWIF</span>
            <p className="text-sm text-muted-foreground mt-1">
              Longevity and healthspan, quantified.
            </p>
          </div>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <Link href="/about" className="hover:text-foreground transition-colors">
              About
            </Link>
            <Link href="/calculate" className="hover:text-foreground transition-colors">
              Try Free
            </Link>
            <Link href="/login" className="hover:text-foreground transition-colors">
              Sign In
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
