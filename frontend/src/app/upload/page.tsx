"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "@/components/navbar";
import { useAuth } from "@/lib/auth";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://levvif.onrender.com";

interface UploadResult {
  phenoage: number;
  chronological_age: number;
  age_difference: number;
  extracted_biomarkers: Record<string, number>;
  defaulted_biomarkers: string[];
}

export default function UploadPage() {
  const { accessToken, isLoggedIn } = useAuth();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [age, setAge] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<UploadResult | null>(null);
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    if (!isLoggedIn) router.replace("/login");
  }, [isLoggedIn, router]);

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
    if (accessToken) formData.append("access_token", accessToken);

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
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  if (!isLoggedIn) return null;

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

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 py-8">
        <h1 className="font-heading text-3xl sm:text-4xl font-bold mb-8">
          Upload <span className="text-gold">Lab Report</span>
        </h1>

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
                    {(file.size / 1024 / 1024).toFixed(2)} MB — Click or drop to
                    replace
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
            {/* Result cards */}
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

            {/* Extracted biomarkers */}
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

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={() => {
                  setResult(null);
                  setFile(null);
                  setAge("");
                }}
                className="bg-gold hover:bg-gold-light text-background font-semibold cursor-pointer"
              >
                Upload Another
              </Button>
              <Button
                onClick={() => router.push("/dashboard")}
                variant="outline"
                className="border-gold/30 hover:bg-gold/10 cursor-pointer"
              >
                Back to Dashboard
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
