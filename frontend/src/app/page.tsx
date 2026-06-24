"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/lib/auth";

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
      {/* Navbar */}
      <nav className="border-b border-gold/10 bg-background/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          <span className="font-heading text-2xl font-bold text-gold">LEWIF</span>
          <div className="flex items-center gap-4">
            <Link href="#how-it-works" className="hidden sm:inline text-sm text-muted-foreground hover:text-foreground transition-colors">
              How It Works
            </Link>
            <Link href="#features" className="hidden sm:inline text-sm text-muted-foreground hover:text-foreground transition-colors">
              Features
            </Link>
            <Link href="/about" className="hidden sm:inline text-sm text-muted-foreground hover:text-foreground transition-colors">
              About
            </Link>
            <Button
              onClick={() => router.push("/login")}
              variant="outline"
              className="border-gold/30 hover:bg-gold/10 text-sm cursor-pointer"
            >
              Sign In
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex-1 flex items-center justify-center px-4 py-20 sm:py-32">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-gold/80 text-sm font-medium tracking-widest uppercase mb-4">
            Biological Age Calculator
          </p>
          <h1 className="font-heading text-5xl sm:text-7xl font-bold leading-tight tracking-tight">
            Know your{" "}
            <span className="text-gold">true age</span>
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Your birth certificate tells one story. Your blood tells another.
            LEWIF calculates your biological age from standard blood biomarkers
            using the clinically validated PhenoAge formula.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
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
          </div>
          <p className="mt-4 text-sm text-muted-foreground/60">
            Upload a lab report. Get your biological age in seconds.
          </p>
        </div>
      </section>

      {/* Social proof bar */}
      <section className="border-y border-gold/10 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
            <div>
              <p className="font-heading text-3xl font-bold text-gold">9</p>
              <p className="text-sm text-muted-foreground mt-1">Blood Biomarkers</p>
            </div>
            <div>
              <p className="font-heading text-3xl font-bold text-gold">2018</p>
              <p className="text-sm text-muted-foreground mt-1">Levine PhenoAge Study</p>
            </div>
            <div>
              <p className="font-heading text-3xl font-bold text-gold">AI</p>
              <p className="text-sm text-muted-foreground mt-1">Powered Report Reading</p>
            </div>
            <div>
              <p className="font-heading text-3xl font-bold text-gold">Free</p>
              <p className="text-sm text-muted-foreground mt-1">To Get Started</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 sm:py-28 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-gold/80 text-sm font-medium tracking-widest uppercase mb-3">
              Simple Process
            </p>
            <h2 className="font-heading text-3xl sm:text-5xl font-bold">
              Three steps to your{" "}
              <span className="text-gold">biological age</span>
            </h2>
          </div>

          <div className="grid sm:grid-cols-3 gap-8">
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
              <Card key={item.step} className="border-gold/10 bg-card/60">
                <CardContent className="pt-8 pb-6">
                  <span className="font-heading text-5xl font-bold text-gold/20">
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
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 sm:py-28 px-4 bg-card/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-gold/80 text-sm font-medium tracking-widest uppercase mb-3">
              Features
            </p>
            <h2 className="font-heading text-3xl sm:text-5xl font-bold">
              More than a{" "}
              <span className="text-gold">calculator</span>
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
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
              <Card key={feature.title} className="border-gold/10 bg-card/60">
                <CardContent className="pt-6 pb-6">
                  <h3 className="font-heading text-lg font-semibold mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 sm:py-28 px-4">
        <div className="max-w-2xl mx-auto text-center">
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
        </div>
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
