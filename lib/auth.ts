import { getSession, createSession, deleteSession } from "./store";
import { getParentByEmail, createParent, verifyEmail, resendVerification } from "./store";

export { getSession };

export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + "tcd_salt_2024");
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const testHash = await hashPassword(password);
  return testHash === hash;
}

export async function signUp(email: string, name: string, password: string) {
  const response = await fetch("/api/auth/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, name, password }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Signup failed");
  }

  return data;
}

export async function signIn(email: string, password: string) {
  const response = await fetch("/api/auth/signin", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Sign in failed");
  }

  return data;
}

export async function signOut() {
  await fetch("/api/auth/session", {
    method: "DELETE",
  });
}

export async function getCurrentUser() {
  try {
    const response = await fetch("/api/auth/session");
    if (!response.ok) return null;
    const data = await response.json();
    return data.user;
  } catch {
    return null;
  }
}

export function requireAuth() {
  const user = getSession();
  if (!user) {
    throw new Error("Unauthorized");
  }
  return user;
}

export function verifyEmailByToken(token: string) {
  return verifyEmail(token);
}

export function resendVerificationEmail(email: string) {
  return resendVerification(email);
}

export function isAdmin(user: any) {
  return user?.role === "admin";
}
