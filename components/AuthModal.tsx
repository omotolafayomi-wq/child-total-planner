"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { signIn, signUp, getCurrentUser } from "@/lib/auth";
import { getChildren } from "@/lib/store";
import { useRouter } from "next/navigation";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: "signin" | "signup";
}

export default function AuthModal({ isOpen, onClose, initialTab = "signin" }: AuthModalProps) {
  const [tab, setTab] = useState<"signin" | "signup">(initialTab);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    if (!isOpen) {
      setEmail("");
      setPassword("");
      setName("");
      setError("");
      setLoading(false);
    }
  }, [isOpen]);

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, handleClose]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (tab === "signup") {
        if (!name.trim()) {
          setError("Please enter your full name.");
          setLoading(false);
          return;
        }
        const result = await signUp(email, name, password);
        if (result.session) {
          const u = await getCurrentUser();
          if (u) {
            const kids = getChildren(u.id);
            if (kids.length === 0) {
              router.push("/onboarding/welcome");
            } else {
              router.push("/dashboard");
            }
          } else {
            router.push("/onboarding/welcome");
          }
          handleClose();
        }
      } else {
        await signIn(email, password);
        const u = await getCurrentUser();
        if (u) {
          const kids = getChildren(u.id);
          if (kids.length === 0) {
            router.push("/onboarding/welcome");
          } else {
            router.push("/dashboard");
          }
        } else {
          router.push("/dashboard");
        }
        handleClose();
      }
    } catch (err) {
      setError((err as Error)?.message || "Authentication failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="auth-modal-title">
      <div className="fixed inset-0 bg-black/50" onClick={handleClose} aria-hidden="true" />
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md p-6 sm:p-8">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Close dialog"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <div className="text-center mb-6">
          <h2 id="auth-modal-title" className="text-2xl font-bold text-primary">
            {tab === "signin" ? "Welcome back" : "Create Account"}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {tab === "signin" ? "Sign in to continue your child's development journey" : "Start your family's development journey"}
          </p>
        </div>

        <div className="flex rounded-lg border border-border p-1 mb-6">
          <button
            type="button"
            onClick={() => { setTab("signin"); setError(""); }}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${tab === "signin" ? "bg-primary text-white" : "text-muted-foreground hover:text-foreground"}`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setTab("signup"); setError(""); }}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${tab === "signup" ? "bg-primary text-white" : "text-muted-foreground hover:text-foreground"}`}
          >
            Sign Up
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {tab === "signup" && (
            <div>
              <label className="label" htmlFor="auth-name">Full Name</label>
              <input id="auth-name" type="text" className="input" value={name} onChange={(e) => setName(e.target.value)} required={tab === "signup"} />
            </div>
          )}
          <div>
            <label className="label" htmlFor="auth-email">Email</label>
            <input id="auth-email" type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div>
            <label className="label" htmlFor="auth-password">Password</label>
            <input id="auth-password" type="password" className="input" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
          </div>
          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? "Please wait..." : tab === "signin" ? "Sign In" : "Create Account"}
          </button>
        </form>

        {tab === "signin" && (
          <p className="text-center text-sm text-muted-foreground mt-4">
            <Link href="/forgot-password" className="text-primary hover:underline" onClick={handleClose}>
              Forgot password?
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
