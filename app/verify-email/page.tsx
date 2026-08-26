"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { verifyEmailByToken, resendVerificationEmail } from "@/lib/auth";

export default function VerifyEmailPage() {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  useEffect(() => {
    if (token) {
      handleVerify(token);
    }
  }, [token]);

  function handleVerify(token: string) {
    setLoading(true);
    setTimeout(() => {
      const parent = verifyEmailByToken(token);
      if (parent) {
        setMessage("Your account is verified. Welcome to Total Child Development Planner.");
        setTimeout(() => {
          router.push("/signin");
        }, 3000);
      } else {
        setError("Invalid or expired verification token. Please request a new one.");
      }
      setLoading(false);
    }, 500);
  }

  function handleResend() {
    setLoading(true);
    setTimeout(() => {
      resendVerificationEmail("demo@example.com");
      setMessage("Verification email resent! Check your inbox.");
      setLoading(false);
    }, 500);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
      <div className="w-full max-w-md">
        <div className="card text-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
          </div>
          <h1 className="text-2xl font-bold mb-2">Verify Your Email</h1>
          <p className="text-muted-foreground mb-6">
            We sent a verification link to your registered email address.
          </p>

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

          <div className="space-y-3">
            <button onClick={handleResend} className="btn-primary w-full" disabled={loading}>
              {loading ? "Processing..." : "Resend Verification"}
            </button>
            <Link href="/signin" className="btn-outline w-full">
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
