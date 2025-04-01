import { signOut } from "next-auth/react";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    await signOut({ callbackUrl: "/" });
    return NextResponse.json({ success: true });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to logout";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
