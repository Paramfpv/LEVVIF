"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { HUDCorners } from "@/components/hud-corners";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://levvif.onrender.com";

const DEMO_BIOMARKERS = {
  albumin: 4.2,
  creatinine: 0.95,
  glucose: 88.0,
  crp: 2.0,
  lymphocyte_percent: 32.0,
  mcv: 89.0,
  rdw: 13.1,
  alkaline_phosphatase: 67.0,
  wbc: 6.3,
  age: 30,
};

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

function calcBMI(height_cm: string, weight_kg: string): number | null {
  const h = parseFloat(height_cm);
  const w = parseFloat(weight_kg);
  if (!h || !w || h < 50 || h > 250 || w < 20 || w > 300) return null;
  return Math.round((w / Math.pow(h / 100, 2)) * 10) / 10;
}

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
  const [showLifestyleForm, setShowLifestyleForm] = useState(false);
  const [lifestyle, setLifestyle] = useState<LifestyleForm>(DEFAULT_LIFESTYLE);
  const [refining, setRefining] = useState(false);
  const [refineError, setRefineError] = useState("");

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragActive(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) setFile(dropped);
  }

  function setLS(field: keyof LifestyleForm, value: string) {
    setLifestyle((prev) => ({ ...prev, [field]: value }));
  }

  async function runAnalysis(data: UploadResult) {
    setAnalyzing(true);
    setAnalysis("");
    try {
      const res = await fetch(`${API_URL}/guest/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) setAnalysis((await res.json()).analysis);
    } catch {
    } finally {
      setAnalyzing(false);
    }
  }

  async function handleUpload() {
    if (!file) return;
    setLoading(true);
    setError("");
    setResult(null);
    setAnalysis("");
    setShowLifestyleForm(false);
    setLifestyle(DEFAULT_LIFESTYLE);

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
      runAnalysis(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function handleDemo() {
    setLoading(true);
    setError("");
    setResult(null);
    setAnalysis("");
    setShowLifestyleForm(false);
    setLifestyle(DEFAULT_LIFESTYLE);

    try {
      const res = await fetch(`${API_URL}/guest/calculate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(DEMO_BIOMARKERS),
      });
      if (!res.ok) throw new Error("Demo calculation failed");
      const calc = await res.json();
      const data: UploadResult = {
        ...calc,
        extracted_biomarkers: DEMO_BIOMARKERS,
        defaulted_biomarkers: ["crp", "albumin", "alkaline_phosphatase"],
      };
      setResult(data);
      runAnalysis(data);
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
      setRefineError("Please fill in all fields.");
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
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: res.statusText }));
        throw new Error(err.detail || "Refinement failed");
      }
      const data: UploadResult = await res.json();
      setResult(data);
      setShowLifestyleForm(false);
      runAnalysis(data);
    } catch (err) {
      setRefineError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setRefining(false);
    }
  }

  const crpWasDefaulted = result?.defaulted_biomarkers.includes("crp");
  const crpWasPredicted = result?.crp_predicted !== undefined;
  const bmi = calcBMI(lifestyle.height_cm, lifestyle.weight_kg);

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="hud-label mb-2">Phenotypic Age Protocol</p>
          <h1 className="font-heading text-3xl sm:text-4xl font-bold mb-2">
            Try <span className="text-gold">LEWIF</span>
          </h1>
          <p className="text-muted-foreground mb-8">
            Upload your lab report and discover your biological age. No account needed.
          </p>
        </motion.div>

        {!result ? (
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          >
            <div
              onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
              onDragLeave={() => setDragActive(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-colors ${
                dragActive ? "border-gold bg-gold/5"
                  : file ? "border-gold/40 bg-gold/5"
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
                  <p className="text-muted-foreground">Drop your lab report here, or click to browse</p>
                  <p className="text-sm text-muted-foreground/60 mt-2">PDF, PNG, JPEG, or WebP</p>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="age">
                Age <span className="text-muted-foreground font-normal">(optional if found in report)</span>
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

            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
              <Button
                onClick={handleUpload}
                disabled={!file || loading}
                className="bg-gold hover:bg-gold-light text-background font-semibold cursor-pointer"
              >
                {loading ? "Analyzing..." : "Calculate PhenoAge"}
              </Button>

              <span className="text-muted-foreground text-sm">or</span>

              <Button
                onClick={handleDemo}
                disabled={loading}
                variant="outline"
                className="border-gold/30 hover:bg-gold/10 cursor-pointer text-sm"
              >
                {loading ? "Loading..." : "Try with sample data →"}
              </Button>
            </div>

            <p className="text-xs text-muted-foreground">
              No lab report? Sample data uses realistic biomarker values for a 30-year-old so you can explore the full flow including the ML CRP estimator.
            </p>
          </motion.div>
        ) : (
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Result cards */}
            <motion.div
              className="grid gap-4 sm:grid-cols-3"
              initial="hidden"
              animate="show"
              variants={{ hidden: {}, show: { transition: { staggerChildren: 0.1 } } }}
            >
              {[
                {
                  label: "Phenotypic Age",
                  value: <span className="text-gold">{result.phenoage}</span>,
                },
                {
                  label: "Chronological Age",
                  value: result.chronological_age,
                },
                {
                  label: "Difference",
                  value: (
                    <span className={result.age_difference < 0 ? "text-teal" : "text-red-400"}>
                      {result.age_difference > 0 ? "+" : ""}{result.age_difference} yrs
                    </span>
                  ),
                },
              ].map(({ label, value }) => (
                <motion.div
                  key={label}
                  variants={{
                    hidden: { opacity: 0, y: 16 },
                    show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } },
                  }}
                >
                  <Card className="hud-glow border-gold/20 bg-card/80 relative overflow-hidden">
                    <HUDCorners />
                    <CardHeader className="pb-2">
                      <CardTitle className="hud-label">{label}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="font-mono text-4xl font-bold">{value}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>

            {/* CRP ML notice */}
            {crpWasDefaulted && !crpWasPredicted && (
              <Card className="border-amber-500/30 bg-amber-500/5">
                <CardContent className="pt-5">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="flex-1">
                      <p className="font-medium text-amber-400">CRP was missing from your report</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        We used the population average (2.0 mg/L). Fill in your lifestyle
                        data and our ML model will estimate your personal CRP for a more
                        accurate biological age.
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

                  <AnimatePresence>
                  {showLifestyleForm && (
                    <motion.div
                      key="lifestyle"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.35, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                    <div className="mt-6 space-y-5 border-t border-amber-500/20 pt-5">
                      <p className="text-sm text-muted-foreground">
                        Our XGBoost model (trained on 26,000 NHANES records) will estimate
                        your CRP from lifestyle data and recalculate your biological age.
                      </p>

                      <div className="grid gap-4 sm:grid-cols-2">
                        {/* Sex */}
                        <div className="space-y-2">
                          <Label>Sex</Label>
                          <div className="flex gap-3">
                            {[["0", "Male"], ["1", "Female"]].map(([val, label]) => (
                              <button key={val} onClick={() => setLS("female", val)}
                                className={`flex-1 py-2 rounded-lg border text-sm transition-colors cursor-pointer ${lifestyle.female === val ? "border-gold bg-gold/10 text-gold" : "border-gold/20 text-muted-foreground hover:border-gold/40"}`}>
                                {label}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Height + Weight → BMI */}
                        <div className="space-y-2">
                          <Label>Height & Weight</Label>
                          <div className="flex gap-2">
                            <div className="flex-1">
                              <Input
                                type="number"
                                placeholder="Height (cm)"
                                value={lifestyle.height_cm}
                                onChange={(e) => setLS("height_cm", e.target.value)}
                                className="bg-background/50 border-gold/20 focus:border-gold"
                              />
                            </div>
                            <div className="flex-1">
                              <Input
                                type="number"
                                placeholder="Weight (kg)"
                                value={lifestyle.weight_kg}
                                onChange={(e) => setLS("weight_kg", e.target.value)}
                                className="bg-background/50 border-gold/20 focus:border-gold"
                              />
                            </div>
                          </div>
                          {bmi && (
                            <p className="text-xs text-gold">BMI: {bmi}</p>
                          )}
                        </div>

                        {/* Sleep */}
                        <div className="space-y-2">
                          <Label htmlFor="sleep">Sleep hours per night</Label>
                          <Input id="sleep" type="number" placeholder="e.g. 7"
                            value={lifestyle.sleep_hours}
                            onChange={(e) => setLS("sleep_hours", e.target.value)}
                            className="bg-background/50 border-gold/20 focus:border-gold" />
                        </div>

                        {/* Sedentary */}
                        <div className="space-y-2">
                          <Label htmlFor="sedentary">Sedentary hours per day</Label>
                          <Input id="sedentary" type="number" placeholder="e.g. 5"
                            value={lifestyle.sedentary_hours}
                            onChange={(e) => setLS("sedentary_hours", e.target.value)}
                            className="bg-background/50 border-gold/20 focus:border-gold" />
                        </div>

                        {/* Smoked */}
                        <div className="space-y-2">
                          <Label>Ever smoked?</Label>
                          <div className="flex gap-3">
                            {[["0", "No"], ["1", "Yes"]].map(([val, label]) => (
                              <button key={val} onClick={() => setLS("ever_smoked", val)}
                                className={`flex-1 py-2 rounded-lg border text-sm transition-colors cursor-pointer ${lifestyle.ever_smoked === val ? "border-gold bg-gold/10 text-gold" : "border-gold/20 text-muted-foreground hover:border-gold/40"}`}>
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
                              <button key={val} onClick={() => setLS("ever_drinks", val)}
                                className={`flex-1 py-2 rounded-lg border text-sm transition-colors cursor-pointer ${lifestyle.ever_drinks === val ? "border-gold bg-gold/10 text-gold" : "border-gold/20 text-muted-foreground hover:border-gold/40"}`}>
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
                              <button key={val} onClick={() => setLS("trouble_sleeping", val)}
                                className={`flex-1 py-2 rounded-lg border text-sm transition-colors cursor-pointer ${lifestyle.trouble_sleeping === val ? "border-gold bg-gold/10 text-gold" : "border-gold/20 text-muted-foreground hover:border-gold/40"}`}>
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
                              <button key={val} onClick={() => setLS("vigorous_work", val)}
                                className={`flex-1 py-2 rounded-lg border text-sm transition-colors cursor-pointer ${lifestyle.vigorous_work === val ? "border-gold bg-gold/10 text-gold" : "border-gold/20 text-muted-foreground hover:border-gold/40"}`}>
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
                              <button key={val} onClick={() => setLS("vigorous_recreation", val)}
                                className={`flex-1 py-2 rounded-lg border text-sm transition-colors cursor-pointer ${lifestyle.vigorous_recreation === val ? "border-gold bg-gold/10 text-gold" : "border-gold/20 text-muted-foreground hover:border-gold/40"}`}>
                                {label}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      {refineError && <p className="text-destructive text-sm">{refineError}</p>}

                      <Button onClick={handleRefine} disabled={refining}
                        className="bg-gold hover:bg-gold-light text-background font-semibold cursor-pointer">
                        {refining ? "Calculating..." : "Recalculate with my data"}
                      </Button>
                    </div>
                    </motion.div>
                  )}
                  </AnimatePresence>
                </CardContent>
              </Card>
            )}

            {crpWasPredicted && (
              <div className="flex items-center gap-2 text-sm text-green-400">
                <span>✓</span>
                <span>CRP estimated by ML model: <strong>{result.crp_predicted} mg/L</strong> — result updated</span>
              </div>
            )}

            {/* Biomarkers */}
            <Card className="border-gold/20 bg-card/80">
              <CardHeader>
                <CardTitle className="font-heading text-lg">Extracted Biomarkers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 sm:grid-cols-2">
                  {Object.entries(result.extracted_biomarkers).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between py-2 px-3 rounded-lg bg-background/50">
                      <span className="text-sm text-muted-foreground">{BIOMARKER_LABELS[key] || key}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{typeof value === "number" ? value.toFixed(2) : value}</span>
                        {result.defaulted_biomarkers.includes(key) && (
                          <Badge variant="outline" className="text-xs border-amber-500/40 text-amber-400">default</Badge>
                        )}
                        {key === "crp" && crpWasPredicted && (
                          <Badge variant="outline" className="text-xs border-green-500/40 text-green-400">ML estimate</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* AI Analysis */}
            <Card className="border-gold/20 bg-card/80">
              <CardHeader>
                <CardTitle className="font-heading text-lg">Your Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                {analyzing ? (
                  <p className="text-muted-foreground">Analyzing your results...</p>
                ) : analysis ? (
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{analysis}</p>
                ) : (
                  <p className="text-muted-foreground">Analysis unavailable right now.</p>
                )}
              </CardContent>
            </Card>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={() => { setResult(null); setFile(null); setAge(""); setAnalysis(""); setShowLifestyleForm(false); setLifestyle(DEFAULT_LIFESTYLE); }}
                className="bg-gold hover:bg-gold-light text-background font-semibold cursor-pointer"
              >
                Upload Another
              </Button>
              <Button onClick={() => router.push("/login")} variant="outline" className="border-gold/30 hover:bg-gold/10 cursor-pointer">
                Sign up for chat & history →
              </Button>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}
