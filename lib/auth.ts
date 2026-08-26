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
  const existing = getParentByEmail(email);
  if (existing) {
    throw new Error("An account with this email already exists.");
  }
  const passwordHash = await hashPassword(password);
  const parent = createParent(email, name, passwordHash);
  const session = createSession(parent.id, parent.email, parent.name);
  return { parent, session };
}

export async function signIn(email: string, password: string) {
  const parent = getParentByEmail(email);
  if (!parent) {
    throw new Error("Incorrect email or password.");
  }
  const valid = await verifyPassword(password, parent.passwordHash);
  if (!valid) {
    throw new Error("Incorrect email or password.");
  }
  const session = createSession(parent.id, parent.email, parent.name);
  return { parent, session };
}

export function signOut() {
  const session = getSession();
  if (session) {
    deleteSession(session.token);
  }
}

export function getCurrentUser() {
  const session = getSession();
  if (!session) return null;
  const parent = getParentByEmail(session.email);
  if (!parent) return null;
  return {
    id: parent.id,
    email: parent.email,
    name: parent.name,
    phone: parent.phone,
    location: parent.location,
    planningStyle: parent.planningStyle,
    emailVerified: parent.emailVerified,
    role: parent.role,
  };
}

export function requireAuth() {
  const user = getCurrentUser();
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

export function isAdmin(user: ReturnType<typeof getCurrentUser>) {
  return user?.role === "admin";
}
