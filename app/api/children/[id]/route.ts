import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/server-store";
import { assertChildOwnership, getServerChild, updateServerChild, deleteServerChild } from "@/lib/server-store";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const sessionToken = request.cookies.get("session")?.value;
    const session = sessionToken ? getServerSession(sessionToken) : null;

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const child = getServerChild(id);
    if (!child || !assertChildOwnership(session.parentId, id)) {
      return NextResponse.json({ error: "Child not found or access denied" }, { status: 404 });
    }

    return NextResponse.json({ child });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch child" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const sessionToken = request.cookies.get("session")?.value;
    const session = sessionToken ? getServerSession(sessionToken) : null;

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const child = getServerChild(id);
    if (!child || !assertChildOwnership(session.parentId, id)) {
      return NextResponse.json({ error: "Child not found or access denied" }, { status: 404 });
    }

    const updates = await request.json();
    const updated = updateServerChild(id, updates);
    if (!updated) {
      return NextResponse.json({ error: "Failed to update child" }, { status: 500 });
    }

    return NextResponse.json({ child: updated });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update child" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const sessionToken = request.cookies.get("session")?.value;
    const session = sessionToken ? getServerSession(sessionToken) : null;

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const child = getServerChild(id);
    if (!child || !assertChildOwnership(session.parentId, id)) {
      return NextResponse.json({ error: "Child not found or access denied" }, { status: 404 });
    }

    deleteServerChild(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete child" }, { status: 500 });
  }
}
