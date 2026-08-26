"use client";

import { useState } from "react";
import Link from "next/link";
import { getParentByEmail, updateParent } from "@/lib/store";

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
    await new Promise((r) => setTimeout(r, 500));
    const parent = getParentByEmail(email);
    if (!parent) {
      setError("No account found with that email.");
      setLoading(false);
      return;
    }
    const tempPassword = Math.random().toString(36).slice(-8);
    const encoder = new TextEncoder();
    const data = encoder.encode(tempPassword + "tcd_salt_2024");
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hash = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
    updateParent(parent.id, { passwordHash: hash });
    setMessage(`Your temporary password is: ${tempPassword}. Sign in and update your password in Profile.`);
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
      <div className="w-full max-w-md">
        <div className="card">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold">Reset Password</h1>
            <p className="text-sm text-muted-foreground mt-1">We&apos;ll send a temporary password to your email</p>
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
    </div>
  );
}
