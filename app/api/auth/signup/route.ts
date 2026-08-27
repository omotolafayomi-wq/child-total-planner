import { NextRequest, NextResponse } from "next/server";
import { hashPassword } from "@/lib/auth";
import { getServerParentByEmail, createServerParent, createServerSession } from "@/lib/server-store";

export async function POST(request: NextRequest) {
  try {
    const { email, name, password } = await request.json();

    if (!email || !name || !password) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const existing = getServerParentByEmail(email);
    if (existing) {
      return NextResponse.json({ error: "An account with this email already exists." }, { status: 400 });
    }

    const encoder = new TextEncoder();
    const data = encoder.encode(password + "tcd_salt_2024");
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const passwordHash = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");

    const parent = {
      id: crypto.randomUUID(),
      email,
      name,
      passwordHash,
      role: "parent" as const,
      createdAt: new Date().toISOString(),
    };

    createServerParent(parent);

    const sessionToken = crypto.randomUUID();
    const session = {
      token: sessionToken,
      parentId: parent.id,
      email: parent.email,
      name: parent.name,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    };

    createServerSession(session);

    const response = NextResponse.json({
      success: true,
      user: { id: parent.id, email: parent.email, name: parent.name },
    });

    response.cookies.set("session", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return response;
  } catch (error) {
    return NextResponse.json({ error: "Signup failed" }, { status: 500 });
  }
}
