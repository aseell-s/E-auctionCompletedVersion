/*
Lets admins add money to a user’s account for things like bidding.
Makes sure only SUPER_ADMIN users can do this.
Checks that the user ID and amount are valid before updating.
Supports admin tools used to manage user accounts.
*/
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
// Fix: Import authOptions directly from the route file
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  // Check if user is authenticated and is an admin
  if (!session || session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { userId, amount } = await req.json();

    // Validate input
    if (!userId || typeof amount !== "number" || amount <= 0) {
      return NextResponse.json(
        { error: "Valid userId and positive amount are required" },
        { status: 400 }
      );
    }

    // Update user's funds
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        amount: {
          increment: amount,
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: `Successfully added ${amount} to user's account`,
      newBalance: user.amount,
    });
  } catch (error) {
    console.error("Failed to add funds:", error);
    return NextResponse.json(
      { error: "Failed to add funds to user account" },
      { status: 500 }
    );
  }
}
