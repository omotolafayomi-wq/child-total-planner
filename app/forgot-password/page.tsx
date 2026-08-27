"use client";

import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);
    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data.error || "Something went wrong.");
      } else {
        setMessage(data.message || "If an account exists, a temporary password has been sent.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur border-b border-border no-print">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="text-lg font-bold text-primary tracking-tight">
            Total Child
          </Link>
        </div>
      </header>
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 py-6">
        <div className="max-w-md mx-auto">
          <div className="card">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold">Reset Password</h1>
              <p className="text-sm text-muted-foreground mt-1">Enter your email and we&apos;ll send you a temporary password</p>
            </div>
            {error && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
                {error}
              </div>
            )}
            {message && (
              <div className="mb-4 rounded-lg border border-growth/30 bg-growth/10 px-4 py-3 text-sm text-foreground">
                {message}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label" htmlFor="email">Email</label>
                <input id="email" type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <button type="submit" className="btn-primary w-full" disabled={loading}>
                {loading ? "Sending..." : "Send Reset Link"}
              </button>
            </form>
            <p className="text-center text-sm text-muted-foreground mt-4">
              <Link href="/signin" className="text-primary font-medium hover:underline">Back to Sign In</Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
