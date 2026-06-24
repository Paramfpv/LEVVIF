"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "@/components/navbar";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";

interface Calculation {
  id: string;
  biomarkers: Record<string, number>;
  phenoage: number;
  chronological_age: number;
  age_difference: number;
  defaulted_biomarkers: string[];
  created_at: string;
}

export default function HistoryPage() {
  const { accessToken, isLoggedIn } = useAuth();
  const router = useRouter();
  const [history, setHistory] = useState<Calculation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoggedIn) {
      router.replace("/login");
      return;
    }

    api<Calculation[]>(`/history/?access_token=${accessToken}`)
      .then(setHistory)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isLoggedIn, accessToken, router]);

  if (!isLoggedIn) return null;

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 py-8">
        <h1 className="font-heading text-3xl sm:text-4xl font-bold mb-8">
          Your <span className="text-gold">History</span>
        </h1>

        {loading ? (
          <p className="text-muted-foreground">Loading...</p>
        ) : history.length === 0 ? (
          <Card className="border-gold/20 bg-card/80 text-center py-12">
            <CardContent>
              <p className="text-muted-foreground">
                No calculations yet. Upload a lab report to get started.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {history.map((calc) => (
              <Card key={calc.id} className="border-gold/20 bg-card/80">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm text-muted-foreground font-normal">
                      {formatDate(calc.created_at)}
                    </CardTitle>
                    {calc.defaulted_biomarkers.length > 0 && (
                      <Badge
                        variant="outline"
                        className="text-xs border-amber-500/40 text-amber-400"
                      >
                        {calc.defaulted_biomarkers.length} defaulted
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-baseline gap-6 flex-wrap">
                    <div>
                      <span className="text-sm text-muted-foreground">
                        PhenoAge{" "}
                      </span>
                      <span className="font-heading text-2xl font-bold text-gold">
                        {calc.phenoage}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">
                        Age{" "}
                      </span>
                      <span className="font-heading text-2xl font-bold">
                        {calc.chronological_age}
                      </span>
                    </div>
                    <div>
                      <span
                        className={`font-heading text-2xl font-bold ${
                          calc.age_difference < 0
                            ? "text-green-400"
                            : "text-red-400"
                        }`}
                      >
                        {calc.age_difference > 0 ? "+" : ""}
                        {calc.age_difference}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {" "}
                        yrs
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
