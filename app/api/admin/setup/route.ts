import { NextRequest, NextResponse } from "next/server";
import { getParentByEmail, setParentRole } from "@/lib/store";

export async function POST(request: NextRequest) {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "Not allowed in production" }, { status: 403 });
  }

  const body = await request.json();
  const { email, role } = body as { email: string; role: "parent" | "admin" };

  if (!email || !role) {
    return NextResponse.json({ error: "Email and role are required" }, { status: 400 });
  }

  const parent = getParentByEmail(email);
  if (!parent) {
    return NextResponse.json({ error: "Parent not found" }, { status: 404 });
  }

  setParentRole(email, role);
  return NextResponse.json({ success: true, email, role });
}
