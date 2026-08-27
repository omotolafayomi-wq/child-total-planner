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
      return NextResponse.json({ error: "No account found with that email." }, { status: 404 });
    }

    const tempPassword = Math.random().toString(36).slice(-8);
    const passwordHash = await hashPassword(tempPassword + "tcd_salt_2024");
    updateServerParent(parent.id, { passwordHash });

    return NextResponse.json({
      success: true,
      message: `Your temporary password is: ${tempPassword}. Sign in and update your password in Profile.`,
    });
  } catch (error) {
    return NextResponse.json({ error: "Password reset failed." }, { status: 500 });
  }
}
