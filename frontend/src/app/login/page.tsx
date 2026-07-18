"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { HUDCorners } from "@/components/hud-corners";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";

interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user_id: string;
  email: string;
}

interface SignupPendingResponse {
  user_id: string;
  email: string;
  message: string;
}

export default function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isSignUp) {
        const res = await api<AuthResponse | SignupPendingResponse>(
          "/auth/signup",
          {
            method: "POST",
            body: JSON.stringify({ email, password }),
          }
        );

        if ("access_token" in res) {
          login(res.access_token, res.email, res.user_id);
          router.push("/dashboard");
        } else {
          setError(res.message);
        }
      } else {
        const res = await api<AuthResponse>("/auth/login", {
          method: "POST",
          body: JSON.stringify({ email, password }),
        });

        login(res.access_token, res.email, res.user_id);
        router.push("/dashboard");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 22 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="text-center mb-8">
          <p className="hud-label mb-3">Identity Verification</p>
          <h1 className="font-heading text-4xl sm:text-5xl font-bold tracking-tight text-gold">
            LEWIF
          </h1>
          <p className="mt-2 text-muted-foreground text-sm sm:text-base">
            Know your biological age
          </p>
        </div>

        <Card className="hud-glow border-gold/20 bg-card/80 backdrop-blur relative overflow-hidden">
          <HUDCorners />
          <CardHeader className="text-center pb-2">
            <h2 className="font-heading text-xl font-semibold">
              {isSignUp ? "Create your account" : "Welcome back"}
            </h2>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-background/50 border-gold/20 focus:border-gold"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="bg-background/50 border-gold/20 focus:border-gold"
                />
              </div>

              {error && (
                <p className="text-destructive text-sm text-center">{error}</p>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gold hover:bg-gold-light text-background font-semibold cursor-pointer"
              >
                {loading
                  ? "Please wait..."
                  : isSignUp
                    ? "Create account"
                    : "Sign in"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <button
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setError("");
                }}
                className="text-sm text-muted-foreground hover:text-gold transition-colors cursor-pointer"
              >
                {isSignUp
                  ? "Already have an account? Sign in"
                  : "Don't have an account? Sign up"}
              </button>
            </div>

            <div className="mt-4 text-center">
              <button
                onClick={() => router.push("/calculate")}
                className="text-sm text-gold/60 hover:text-gold transition-colors cursor-pointer"
              >
                Try without an account →
              </button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
