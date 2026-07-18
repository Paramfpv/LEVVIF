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
  crp_predicted?: number;
}

interface LifestyleForm {
  female: string;
  height_cm: string;
  weight_kg: string;
  ever_smoked: string;
  sleep_hours: string;
  trouble_sleeping: string;
  vigorous_work: string;
  vigorous_recreation: string;
  sedentary_hours: string;
  ever_drinks: string;
}

function calcBMI(height_cm: string, weight_kg: string): number | null {
  const h = parseFloat(height_cm);
  const w = parseFloat(weight_kg);
  if (!h || !w || h < 50 || h > 250 || w < 20 || w > 300) return null;
  return Math.round((w / Math.pow(h / 100, 2)) * 10) / 10;
}

const DEFAULT_LIFESTYLE: LifestyleForm = {
  female: "",
  height_cm: "",
  weight_kg: "",
  ever_smoked: "",
  sleep_hours: "",
  trouble_sleeping: "",
  vigorous_work: "",
  vigorous_recreation: "",
  sedentary_hours: "",
  ever_drinks: "",
};

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
  const [showLifestyleForm, setShowLifestyleForm] = useState(false);
  const [lifestyle, setLifestyle] = useState<LifestyleForm>(DEFAULT_LIFESTYLE);
  const [refining, setRefining] = useState(false);
  const [refineError, setRefineError] = useState("");

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
    setShowLifestyleForm(false);
    setLifestyle(DEFAULT_LIFESTYLE);

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

  async function handleRefine() {
    if (!result) return;
    const ls = lifestyle;
    const bmi = calcBMI(ls.height_cm, ls.weight_kg);

    if (
      ls.female === "" || !bmi || ls.ever_smoked === "" ||
      ls.sleep_hours === "" || ls.trouble_sleeping === "" ||
      ls.vigorous_work === "" || ls.vigorous_recreation === "" ||
      ls.sedentary_hours === "" || ls.ever_drinks === ""
    ) {
      setRefineError("Please fill in all lifestyle fields.");
      return;
    }

    setRefining(true);
    setRefineError("");

    try {
      const res = await fetch(`${API_URL}/upload/refine-crp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          biomarkers: result.extracted_biomarkers,
          lifestyle: {
            female: parseInt(ls.female),
            bmi,
            ever_smoked: parseInt(ls.ever_smoked),
            sleep_hours: parseFloat(ls.sleep_hours),
            trouble_sleeping: parseInt(ls.trouble_sleeping),
            vigorous_work: parseInt(ls.vigorous_work),
            vigorous_recreation: parseInt(ls.vigorous_recreation),
            sedentary_minutes: parseFloat(ls.sedentary_hours) * 60,
            ever_drinks: parseInt(ls.ever_drinks),
          },
          access_token: accessToken || null,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: res.statusText }));
        throw new Error(err.detail || "Refinement failed");
      }

      const data: UploadResult = await res.json();
      setResult(data);
      setShowLifestyleForm(false);
    } catch (err) {
      setRefineError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setRefining(false);
    }
  }

  function setLS(field: keyof LifestyleForm, value: string) {
    setLifestyle((prev) => ({ ...prev, [field]: value }));
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

  const crpWasDefaulted = result?.defaulted_biomarkers.includes("crp");
  const crpWasPredicted = result?.crp_predicted !== undefined;

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
              onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
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
                  <p className={`font-heading text-4xl font-bold ${result.age_difference < 0 ? "text-green-400" : "text-red-400"}`}>
                    {result.age_difference > 0 ? "+" : ""}{result.age_difference} yrs
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* CRP ML notice */}
            {crpWasDefaulted && !crpWasPredicted && (
              <Card className="border-amber-500/30 bg-amber-500/5">
                <CardContent className="pt-5">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="flex-1">
                      <p className="font-medium text-amber-400">CRP was missing from your report</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        We used the population average (2.0 mg/L). Fill in your lifestyle
                        data and our ML model will estimate your personal CRP value for a
                        more accurate biological age.
                      </p>
                    </div>
                    <Button
                      onClick={() => setShowLifestyleForm((v) => !v)}
                      variant="outline"
                      className="border-amber-500/40 text-amber-400 hover:bg-amber-500/10 shrink-0 cursor-pointer"
                    >
                      {showLifestyleForm ? "Hide form" : "Improve my result"}
                    </Button>
                  </div>

                  {showLifestyleForm && (
                    <div className="mt-6 space-y-5 border-t border-amber-500/20 pt-5">
                      <p className="text-sm text-muted-foreground">
                        Answer these questions to get a personalized CRP estimate from
                        our XGBoost model trained on 26,000 NHANES records.
                      </p>

                      <div className="grid gap-4 sm:grid-cols-2">
                        {/* Sex */}
                        <div className="space-y-2">
                          <Label>Sex</Label>
                          <div className="flex gap-3">
                            {[["0", "Male"], ["1", "Female"]].map(([val, label]) => (
                              <button
                                key={val}
                                onClick={() => setLS("female", val)}
                                className={`flex-1 py-2 rounded-lg border text-sm transition-colors cursor-pointer ${
                                  lifestyle.female === val
                                    ? "border-gold bg-gold/10 text-gold"
                                    : "border-gold/20 text-muted-foreground hover:border-gold/40"
                                }`}
                              >
                                {label}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Height + Weight → BMI */}
                        <div className="space-y-2">
                          <Label>Height & Weight</Label>
                          <div className="flex gap-2">
                            <Input
                              type="number"
                              placeholder="Height (cm)"
                              value={lifestyle.height_cm}
                              onChange={(e) => setLS("height_cm", e.target.value)}
                              className="bg-background/50 border-gold/20 focus:border-gold"
                            />
                            <Input
                              type="number"
                              placeholder="Weight (kg)"
                              value={lifestyle.weight_kg}
                              onChange={(e) => setLS("weight_kg", e.target.value)}
                              className="bg-background/50 border-gold/20 focus:border-gold"
                            />
                          </div>
                          {calcBMI(lifestyle.height_cm, lifestyle.weight_kg) && (
                            <p className="text-xs text-gold">BMI: {calcBMI(lifestyle.height_cm, lifestyle.weight_kg)}</p>
                          )}
                        </div>

                        {/* Sleep */}
                        <div className="space-y-2">
                          <Label htmlFor="sleep">Sleep hours per night</Label>
                          <Input
                            id="sleep"
                            type="number"
                            placeholder="e.g. 7"
                            value={lifestyle.sleep_hours}
                            onChange={(e) => setLS("sleep_hours", e.target.value)}
                            className="bg-background/50 border-gold/20 focus:border-gold"
                          />
                        </div>

                        {/* Sedentary */}
                        <div className="space-y-2">
                          <Label htmlFor="sedentary">Sedentary hours per day</Label>
                          <Input
                            id="sedentary"
                            type="number"
                            placeholder="e.g. 5"
                            value={lifestyle.sedentary_hours}
                            onChange={(e) => setLS("sedentary_hours", e.target.value)}
                            className="bg-background/50 border-gold/20 focus:border-gold"
                          />
                        </div>

                        {/* Smoked */}
                        <div className="space-y-2">
                          <Label>Ever smoked?</Label>
                          <div className="flex gap-3">
                            {[["0", "No"], ["1", "Yes"]].map(([val, label]) => (
                              <button
                                key={val}
                                onClick={() => setLS("ever_smoked", val)}
                                className={`flex-1 py-2 rounded-lg border text-sm transition-colors cursor-pointer ${
                                  lifestyle.ever_smoked === val
                                    ? "border-gold bg-gold/10 text-gold"
                                    : "border-gold/20 text-muted-foreground hover:border-gold/40"
                                }`}
                              >
                                {label}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Drinks */}
                        <div className="space-y-2">
                          <Label>Drink alcohol?</Label>
                          <div className="flex gap-3">
                            {[["0", "No"], ["1", "Yes"]].map(([val, label]) => (
                              <button
                                key={val}
                                onClick={() => setLS("ever_drinks", val)}
                                className={`flex-1 py-2 rounded-lg border text-sm transition-colors cursor-pointer ${
                                  lifestyle.ever_drinks === val
                                    ? "border-gold bg-gold/10 text-gold"
                                    : "border-gold/20 text-muted-foreground hover:border-gold/40"
                                }`}
                              >
                                {label}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Trouble sleeping */}
                        <div className="space-y-2">
                          <Label>Trouble sleeping?</Label>
                          <div className="flex gap-3">
                            {[["0", "No"], ["1", "Yes"]].map(([val, label]) => (
                              <button
                                key={val}
                                onClick={() => setLS("trouble_sleeping", val)}
                                className={`flex-1 py-2 rounded-lg border text-sm transition-colors cursor-pointer ${
                                  lifestyle.trouble_sleeping === val
                                    ? "border-gold bg-gold/10 text-gold"
                                    : "border-gold/20 text-muted-foreground hover:border-gold/40"
                                }`}
                              >
                                {label}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Vigorous work */}
                        <div className="space-y-2">
                          <Label>Vigorous physical work?</Label>
                          <div className="flex gap-3">
                            {[["0", "No"], ["1", "Yes"]].map(([val, label]) => (
                              <button
                                key={val}
                                onClick={() => setLS("vigorous_work", val)}
                                className={`flex-1 py-2 rounded-lg border text-sm transition-colors cursor-pointer ${
                                  lifestyle.vigorous_work === val
                                    ? "border-gold bg-gold/10 text-gold"
                                    : "border-gold/20 text-muted-foreground hover:border-gold/40"
                                }`}
                              >
                                {label}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Vigorous recreation */}
                        <div className="space-y-2 sm:col-span-2">
                          <Label>Vigorous recreational activity? (gym, running, sports)</Label>
                          <div className="flex gap-3 max-w-xs">
                            {[["0", "No"], ["1", "Yes"]].map(([val, label]) => (
                              <button
                                key={val}
                                onClick={() => setLS("vigorous_recreation", val)}
                                className={`flex-1 py-2 rounded-lg border text-sm transition-colors cursor-pointer ${
                                  lifestyle.vigorous_recreation === val
                                    ? "border-gold bg-gold/10 text-gold"
                                    : "border-gold/20 text-muted-foreground hover:border-gold/40"
                                }`}
                              >
                                {label}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      {refineError && (
                        <p className="text-destructive text-sm">{refineError}</p>
                      )}

                      <Button
                        onClick={handleRefine}
                        disabled={refining}
                        className="bg-gold hover:bg-gold-light text-background font-semibold cursor-pointer"
                      >
                        {refining ? "Calculating..." : "Recalculate with my data"}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* ML predicted CRP badge */}
            {crpWasPredicted && (
              <div className="flex items-center gap-2 text-sm text-green-400">
                <span>✓</span>
                <span>
                  CRP estimated by ML model: <strong>{result.crp_predicted} mg/L</strong> — result updated
                </span>
              </div>
            )}

            {/* Extracted biomarkers */}
            <Card className="border-gold/20 bg-card/80">
              <CardHeader>
                <CardTitle className="font-heading text-lg">
                  Extracted Biomarkers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 sm:grid-cols-2">
                  {Object.entries(result.extracted_biomarkers).map(([key, value]) => (
                    <div
                      key={key}
                      className="flex items-center justify-between py-2 px-3 rounded-lg bg-background/50"
                    >
                      <span className="text-sm text-muted-foreground">
                        {BIOMARKER_LABELS[key] || key}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {typeof value === "number" ? value.toFixed(2) : value}
                        </span>
                        {result.defaulted_biomarkers.includes(key) && (
                          <Badge variant="outline" className="text-xs border-amber-500/40 text-amber-400">
                            default
                          </Badge>
                        )}
                        {key === "crp" && crpWasPredicted && (
                          <Badge variant="outline" className="text-xs border-green-500/40 text-green-400">
                            ML estimate
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={() => {
                  setResult(null);
                  setFile(null);
                  setAge("");
                  setShowLifestyleForm(false);
                  setLifestyle(DEFAULT_LIFESTYLE);
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
