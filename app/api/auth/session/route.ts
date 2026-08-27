import { NextRequest, NextResponse } from "next/server";
import { getServerSession, deleteServerSession } from "@/lib/server-store";

export async function GET(request: NextRequest) {
  const sessionToken = request.cookies.get("session")?.value;

  if (!sessionToken) {
    return NextResponse.json({ user: null });
  }

  const session = getServerSession(sessionToken);
  if (!session || new Date(session.expiresAt) < new Date()) {
    return NextResponse.json({ user: null });
  }

  return NextResponse.json({
    user: {
      id: session.parentId,
      email: session.email,
      name: session.name,
    },
  });
}

export async function DELETE(request: NextRequest) {
  const sessionToken = request.cookies.get("session")?.value;

  if (sessionToken) {
    deleteServerSession(sessionToken);
  }

  const response = NextResponse.json({ success: true });
  response.cookies.delete("session");
  return response;
}
