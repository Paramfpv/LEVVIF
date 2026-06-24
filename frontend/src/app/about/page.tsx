"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function AboutPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <nav className="border-b border-gold/10 bg-background/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          <Link href="/" className="font-heading text-2xl font-bold text-gold">
            LEWIF
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Home
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

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 py-16 sm:py-24">
        {/* Hero */}
        <div className="mb-16">
          <p className="text-gold/80 text-sm font-medium tracking-widest uppercase mb-4">
            About LEWIF
          </p>
          <h1 className="font-heading text-4xl sm:text-5xl font-bold leading-tight">
            We believe aging is{" "}
            <span className="text-gold">measurable</span>
          </h1>
          <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
            LEWIF was born from a simple question: if aging is a biological
            process, shouldn&apos;t we be able to measure it? Turns out, we can —
            and the science has been there since 2018.
          </p>
        </div>

        <Separator className="bg-gold/10 mb-16" />

        {/* The Science */}
        <section className="mb-16">
          <h2 className="font-heading text-2xl sm:text-3xl font-bold mb-6">
            The Science
          </h2>
          <div className="space-y-4 text-muted-foreground leading-relaxed">
            <p>
              LEWIF is built on the{" "}
              <strong className="text-foreground">Levine PhenoAge formula</strong>,
              published in the journal <em>Aging</em> in 2018 by Dr. Morgan Levine
              and colleagues. The study analyzed data from NHANES (National Health
              and Nutrition Examination Survey) — one of the largest and most
              respected health datasets in the world.
            </p>
            <p>
              The formula uses 9 standard blood biomarkers that you&apos;d find on a
              routine blood panel — things like albumin, glucose, creatinine, and
              white blood cell count. From these, it calculates a composite
              &quot;phenotypic age&quot; that correlates with mortality risk better
              than chronological age alone.
            </p>
            <p>
              In plain terms: two people who are both 40 years old on paper can
              have very different biological ages. One might have the biology of a
              35-year-old, the other of a 50-year-old. PhenoAge captures that
              difference.
            </p>
          </div>
        </section>

        {/* What We Do */}
        <section className="mb-16">
          <h2 className="font-heading text-2xl sm:text-3xl font-bold mb-6">
            What We Do
          </h2>
          <div className="grid gap-4">
            {[
              {
                title: "Make it accessible",
                description:
                  "The PhenoAge formula is public, but running it yourself means digging through research papers and doing the math. We handle all of that — just upload your lab report.",
              },
              {
                title: "Make it effortless",
                description:
                  "Our AI reads your lab report — PDF or photo — and extracts the biomarkers automatically. No manual data entry, no looking up which values go where.",
              },
              {
                title: "Make it actionable",
                description:
                  "A number without context is useless. Our AI health advisor explains your results in plain language and gives you evidence-based recommendations.",
              },
            ].map((item) => (
              <Card key={item.title} className="border-gold/10 bg-card/60">
                <CardContent className="pt-6 pb-6">
                  <h3 className="font-heading text-lg font-semibold mb-2">
                    {item.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {item.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Transparency */}
        <section className="mb-16">
          <h2 className="font-heading text-2xl sm:text-3xl font-bold mb-6">
            Transparency
          </h2>
          <div className="space-y-4 text-muted-foreground leading-relaxed">
            <p>
              We believe in being honest about what this is and what it isn&apos;t.
            </p>
            <ul className="space-y-3 ml-4">
              <li className="flex gap-3">
                <span className="text-gold mt-1">•</span>
                <span>
                  <strong className="text-foreground">This is not a medical diagnosis.</strong>{" "}
                  PhenoAge is a research metric. It&apos;s a useful signal, not a
                  verdict.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="text-gold mt-1">•</span>
                <span>
                  <strong className="text-foreground">The formula is public.</strong>{" "}
                  We didn&apos;t invent PhenoAge. We implemented a published,
                  peer-reviewed formula and made it easy to use.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="text-gold mt-1">•</span>
                <span>
                  <strong className="text-foreground">Missing biomarkers use population averages.</strong>{" "}
                  If your report doesn&apos;t include all 9 values, we use healthy
                  adult averages from NHANES data and tell you exactly which ones
                  were defaulted.
                </span>
              </li>
            </ul>
          </div>
        </section>

        <Separator className="bg-gold/10 mb-16" />

        {/* CTA */}
        <section className="text-center">
          <h2 className="font-heading text-2xl sm:text-3xl font-bold mb-4">
            Curious about your biological age?
          </h2>
          <p className="text-muted-foreground mb-8">
            Try it now — no account required.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => router.push("/calculate")}
              className="bg-gold hover:bg-gold-light text-background font-semibold px-8 py-6 cursor-pointer"
            >
              Try It Free
            </Button>
            <Button
              onClick={() => router.push("/login")}
              variant="outline"
              className="border-gold/30 hover:bg-gold/10 px-8 py-6 cursor-pointer"
            >
              Create Account
            </Button>
          </div>
        </section>
      </main>

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
            <Link href="/" className="hover:text-foreground transition-colors">
              Home
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
