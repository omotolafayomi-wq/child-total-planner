"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";

function LoginForm({ redirectTo }: { redirectTo: string }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { signIn } = await import("@/lib/auth");
      await signIn(email, password);
      router.push(redirectTo || "/dashboard");
      router.refresh();
    } catch (err) {
      setError((err as Error)?.message || "Failed to sign in.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="label" htmlFor="email">Email</label>
        <input id="email" type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} required />
      </div>
      <div>
        <label className="label" htmlFor="password">Password</label>
        <input id="password" type="password" className="input" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
      </div>
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}
      <button type="submit" className="btn-primary w-full" disabled={loading}>
        {loading ? "Signing in..." : "Sign In"}
      </button>
      <p className="text-center text-sm text-muted-foreground">
        Don&apos;t have an account? <Link href={`/signup?redirect=${encodeURIComponent(redirectTo)}`} className="text-primary font-medium hover:underline">Create Account</Link>
      </p>
    </form>
  );
}

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/dashboard";
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    getCurrentUser().then(setUser);
  }, []);

  useEffect(() => {
    if (user) {
      router.push(redirectTo);
    }
  }, [user, router, redirectTo]);

  if (user) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
      <div className="w-full max-w-md">
        <div className="card">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold">Welcome</h1>
            <p className="text-sm text-muted-foreground mt-1">Sign in to continue your development journey</p>
          </div>
          <LoginForm redirectTo={redirectTo} />
          <p className="text-center text-sm text-muted-foreground mt-4">
            <Link href="/signup" className="text-primary font-medium hover:underline">Create a new account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-muted/30" />}>
      <LoginContent />
    </Suspense>
  );
}
