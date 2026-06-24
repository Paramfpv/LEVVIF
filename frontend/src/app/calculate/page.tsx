"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://levvif.onrender.com";

interface UploadResult {
  phenoage: number;
  chronological_age: number;
  age_difference: number;
  extracted_biomarkers: Record<string, number>;
  defaulted_biomarkers: string[];
}

const BIOMARKER_LABELS: Record<string, string> = {
  albumin: "Albumin (g/dL)",
  creatinine: "Creatinine (mg/dL)",
  glucose: "Glucose (mg/dL)",
  crp: "CRP (mg/L)",
  lymphocyte_percent: "Lymphocyte (%)",
  mcv: "MCV (fL)",
  rdw: "RDW (%)",
  alkaline_phosphatase: "ALP (U/L)",
  wbc: "WBC (×10³/µL)",
  age: "Age (years)",
};

export default function CalculatePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [age, setAge] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<UploadResult | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [analysis, setAnalysis] = useState("");
  const [analyzing, setAnalyzing] = useState(false);

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragActive(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) setFile(dropped);
  }

  async function handleUpload() {
    if (!file) return;
    setLoading(true);
    setError("");
    setResult(null);

    const formData = new FormData();
    formData.append("file", file);
    if (age) formData.append("age", age);

    try {
      const res = await fetch(`${API_URL}/upload/lab-report`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: res.statusText }));
        throw new Error(err.detail || "Upload failed");
      }

      const data: UploadResult = await res.json();
      setResult(data);

      setAnalyzing(true);
      try {
        const analyzeRes = await fetch(`${API_URL}/guest/analyze`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        if (analyzeRes.ok) {
          const analyzeData = await analyzeRes.json();
          setAnalysis(analyzeData.analysis);
        }
      } catch {
      } finally {
        setAnalyzing(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Simple guest navbar */}
      <nav className="border-b border-gold/10 bg-card/60 backdrop-blur sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14">
          <span className="font-heading text-xl font-bold text-gold">LEWIF</span>
          <button
            onClick={() => router.push("/login")}
            className="text-sm text-muted-foreground hover:text-gold transition-colors cursor-pointer"
          >
            Sign in for full features →
          </button>
        </div>
      </nav>

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 py-8">
        <h1 className="font-heading text-3xl sm:text-4xl font-bold mb-2">
          Try <span className="text-gold">LEWIF</span>
        </h1>
        <p className="text-muted-foreground mb-8">
          Upload your lab report and discover your biological age. No account needed.
        </p>

        {!result ? (
          <div className="space-y-6">
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragActive(true);
              }}
              onDragLeave={() => setDragActive(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-colors ${
                dragActive
                  ? "border-gold bg-gold/5"
                  : file
                    ? "border-gold/40 bg-gold/5"
                    : "border-gold/20 hover:border-gold/40"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.png,.jpg,.jpeg,.webp"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="hidden"
              />

              {file ? (
                <div>
                  <p className="text-gold font-medium">{file.name}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {(file.size / 1024 / 1024).toFixed(2)} MB — Click or drop to replace
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-muted-foreground">
                    Drop your lab report here, or click to browse
                  </p>
                  <p className="text-sm text-muted-foreground/60 mt-2">
                    PDF, PNG, JPEG, or WebP
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="age">
                Age{" "}
                <span className="text-muted-foreground font-normal">
                  (optional if found in report)
                </span>
              </Label>
              <Input
                id="age"
                type="number"
                placeholder="e.g. 30"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="bg-background/50 border-gold/20 focus:border-gold max-w-[200px]"
              />
            </div>

            {error && <p className="text-destructive text-sm">{error}</p>}

            <Button
              onClick={handleUpload}
              disabled={!file || loading}
              className="bg-gold hover:bg-gold-light text-background font-semibold cursor-pointer"
            >
              {loading ? "Analyzing report..." : "Calculate PhenoAge"}
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-3">
              <Card className="border-gold/20 bg-card/80">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-muted-foreground font-normal">
                    PhenoAge
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="font-heading text-4xl font-bold text-gold">
                    {result.phenoage}
                  </p>
                </CardContent>
              </Card>

              <Card className="border-gold/20 bg-card/80">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-muted-foreground font-normal">
                    Chronological Age
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="font-heading text-4xl font-bold">
                    {result.chronological_age}
                  </p>
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
                    className={`font-heading text-4xl font-bold ${
                      result.age_difference < 0
                        ? "text-green-400"
                        : "text-red-400"
                    }`}
                  >
                    {result.age_difference > 0 ? "+" : ""}
                    {result.age_difference} yrs
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card className="border-gold/20 bg-card/80">
              <CardHeader>
                <CardTitle className="font-heading text-lg">
                  Extracted Biomarkers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 sm:grid-cols-2">
                  {Object.entries(result.extracted_biomarkers).map(
                    ([key, value]) => (
                      <div
                        key={key}
                        className="flex items-center justify-between py-2 px-3 rounded-lg bg-background/50"
                      >
                        <span className="text-sm text-muted-foreground">
                          {BIOMARKER_LABELS[key] || key}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{value}</span>
                          {result.defaulted_biomarkers.includes(key) && (
                            <Badge
                              variant="outline"
                              className="text-xs border-amber-500/40 text-amber-400"
                            >
                              default
                            </Badge>
                          )}
                        </div>
                      </div>
                    )
                  )}
                </div>
              </CardContent>
            </Card>

            {/* AI Analysis */}
            <Card className="border-gold/20 bg-card/80">
              <CardHeader>
                <CardTitle className="font-heading text-lg">
                  Your Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                {analyzing ? (
                  <p className="text-muted-foreground">Analyzing your results...</p>
                ) : analysis ? (
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    {analysis}
                  </p>
                ) : (
                  <p className="text-muted-foreground">
                    Analysis unavailable right now. Try again later.
                  </p>
                )}
              </CardContent>
            </Card>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={() => {
                  setResult(null);
                  setFile(null);
                  setAge("");
                  setAnalysis("");
                }}
                className="bg-gold hover:bg-gold-light text-background font-semibold cursor-pointer"
              >
                Upload Another
              </Button>
              <Button
                onClick={() => router.push("/login")}
                variant="outline"
                className="border-gold/30 hover:bg-gold/10 cursor-pointer"
              >
                Sign up for chat & history →
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
