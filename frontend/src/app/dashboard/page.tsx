"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/navbar";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";

interface Calculation {
  id: string;
  phenoage: number;
  chronological_age: number;
  age_difference: number;
  created_at: string;
}

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
      <Navbar />

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-8">
        <h1 className="font-heading text-3xl sm:text-4xl font-bold mb-8">
          Your <span className="text-gold">Biological Age</span>
        </h1>

        {loading ? (
          <p className="text-muted-foreground">Loading...</p>
        ) : latest ? (
          <div className="grid gap-6 sm:grid-cols-3">
            <Card className="border-gold/20 bg-card/80 sm:col-span-1">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground font-normal">
                  PhenoAge
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-heading text-5xl font-bold text-gold">
                  {latest.phenoage}
                </p>
                <p className="text-sm text-muted-foreground mt-1">years</p>
              </CardContent>
            </Card>

            <Card className="border-gold/20 bg-card/80">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground font-normal">
                  Chronological Age
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-heading text-5xl font-bold">
                  {latest.chronological_age}
                </p>
                <p className="text-sm text-muted-foreground mt-1">years</p>
              </CardContent>
            </Card>

            <Card className="border-gold/20 bg-card/80">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground font-normal">
                  Difference
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p
                  className={`font-heading text-5xl font-bold ${
                    latest.age_difference < 0
                      ? "text-green-400"
                      : "text-red-400"
                  }`}
                >
                  {latest.age_difference > 0 ? "+" : ""}
                  {latest.age_difference}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {latest.age_difference < 0
                    ? "younger than your age"
                    : "older than your age"}
                </p>
              </CardContent>
            </Card>
          </div>
        ) : (
          <Card className="border-gold/20 bg-card/80 text-center py-12">
            <CardContent>
              <p className="text-muted-foreground mb-4">
                No results yet. Upload your first lab report to see your
                biological age.
              </p>
              <Button
                onClick={() => router.push("/upload")}
                className="bg-gold hover:bg-gold-light text-background font-semibold cursor-pointer"
              >
                Upload Lab Report
              </Button>
            </CardContent>
          </Card>
        )}

        {latest && (
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
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
          </div>
        )}
      </main>
    </div>
  );
}
