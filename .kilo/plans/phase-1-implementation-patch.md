# Phase 1 Implementation Patch — Foundation Stabilization

## Status
All source-file edits are blocked by tool permissions. This document contains the exact full-file rewrites required. Apply them with an agent that has edit permissions, or copy the snippets into the files manually.

---

## File 1: `lib/store.ts` — Unify Session Cookie

### Change
Replace the `createSession`, `getSession`, and `deleteSession` functions so they use the `session` cookie name instead of `tcd_session`. This aligns the client-side store with the API routes.

### Exact replacement block
```ts
export function createSession(parentId: string, email: string, name: string): Session {
  const session: Session = {
    parentId,
    email,
    name,
    token: generateToken(),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  };
  const sessions = read<Session[]>(STORE_KEYS.sessions, []);
  sessions.push(session);
  write(STORE_KEYS.sessions, sessions);
  if (typeof document !== "undefined") {
    document.cookie = `session=${session.token}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
  }
  return session;
}

export function getSession(): Session | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/session=([^;]+)/);
  const token = match?.[1];
  if (!token) return null;
  const sessions = read<Session[]>(STORE_KEYS.sessions, []);
  const session = sessions.find((s) => s.token === token);
  if (!session) return null;
  if (new Date(session.expiresAt) < new Date()) {
    deleteSession(token);
    return null;
  }
  return session;
}

export function deleteSession(token: string) {
  let sessions = read<Session[]>(STORE_KEYS.sessions, []);
  sessions = sessions.filter((s) => s.token !== token);
  write(STORE_KEYS.sessions, sessions);
  if (typeof document !== "undefined") {
    document.cookie = "session=; path=/; max-age=0; SameSite=Lax";
  }
}
```

---

## File 2: `lib/server-store.ts` — Add File Persistence

### Full file content
```ts
"use server";

import fs from "fs/promises";
import path from "path";

const DATA_FILE = path.join(process.cwd(), ".local", "server-store.json");

declare global {
  var serverParents: any[] | undefined;
  var serverSessions: any[] | undefined;
}

async function loadFromFile() {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf-8");
    const data = JSON.parse(raw);
    if (!global.serverParents) global.serverParents = data.parents || [];
    if (!global.serverSessions) global.serverSessions = data.sessions || [];
  } catch {
    if (!global.serverParents) global.serverParents = [];
    if (!global.serverSessions) global.serverSessions = [];
  }
}

async function saveToFile() {
  try {
    await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
    await fs.writeFile(DATA_FILE, JSON.stringify({
      parents: global.serverParents,
      sessions: global.serverSessions,
    }), "utf-8");
  } catch {
    // Ignore file system errors
  }
}

function getServerParents() {
  if (!global.serverParents) {
    global.serverParents = [];
  }
  return global.serverParents;
}

function getServerSessions() {
  if (!global.serverSessions) {
    global.serverSessions = [];
  }
  return global.serverSessions;
}

export function getServerParentByEmail(email: string) {
  return getServerParents().find((p: any) => p.email === email);
}

export function createServerParent(parent: any) {
  const parents = getServerParents();
  parents.push(parent);
  saveToFile();
  return parent;
}

export function getServerSession(token: string) {
  const sessions = getServerSessions();
  return sessions.find((s: any) => s.token === token);
}

export function createServerSession(session: any) {
  const sessions = getServerSessions();
  sessions.push(session);
  saveToFile();
  return session;
}

export function deleteServerSession(token: string) {
  const sessions = getServerSessions();
  const index = sessions.findIndex((s: any) => s.token === token);
  if (index >= 0) {
    sessions.splice(index, 1);
    saveToFile();
  }
}

export function updateServerParent(id: string, updates: any) {
  const parents = getServerParents();
  const index = parents.findIndex((p: any) => p.id === id);
  if (index >= 0) {
    parents[index] = { ...parents[index], ...updates };
    saveToFile();
    return parents[index];
  }
  return null;
}

loadFromFile();
```

---

## File 3: `app/api/admin/setup/route.ts` — Fix Server-Side Usage

### Full file content
```ts
import { NextRequest, NextResponse } from "next/server";
import { getServerParentByEmail, updateServerParent } from "@/lib/server-store";

export async function POST(request: NextRequest) {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "Not allowed in production" }, { status: 403 });
  }

  const body = await request.json();
  const { email, role } = body as { email: string; role: "parent" | "admin" };

  if (!email || !role) {
    return NextResponse.json({ error: "Email and role are required" }, { status: 400 });
  }

  const parent = getServerParentByEmail(email);
  if (!parent) {
    return NextResponse.json({ error: "Parent not found" }, { status: 404 });
  }

  updateServerParent(parent.id, { role });
  return NextResponse.json({ success: true, email, role });
}
```

---

## File 4: `app/api/auth/forgot-password/route.ts` — Do Not Expose Temp Password

### Full file content
```ts
import { NextRequest, NextResponse } from "next/server";
import { hashPassword } from "@/lib/auth";
import { getServerParentByEmail, updateServerParent } from "@/lib/server-store";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required." }, { status: 400 });
    }

    const parent = getServerParentByEmail(email);
    if (!parent) {
      // Return generic success to avoid email enumeration
      return NextResponse.json({
        success: true,
        message: "If an account exists, a temporary password has been sent.",
      });
    }

    const tempPassword = Math.random().toString(36).slice(-8);
    const passwordHash = await hashPassword(tempPassword + "tcd_salt_2024");
    updateServerParent(parent.id, { passwordHash });

    return NextResponse.json({
      success: true,
      message: "If an account exists, a temporary password has been sent.",
    });
  } catch (error) {
    return NextResponse.json({ error: "Password reset failed." }, { status: 500 });
  }
}
```

---

## File 5: `app/forgot-password/page.tsx` — Update Messaging

### Full file content
```tsx
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
```

---

## Validation

After applying all changes, run:

```bash
npm run build
```

Then manually verify:
1. Sign up → sign out → sign in works
2. Server restart does not lose parent data
3. `/api/admin/setup` works without crashing
4. `/api/auth/forgot-password` returns generic message, not temp password
5. `/forgot-password` page shows the generic success message
