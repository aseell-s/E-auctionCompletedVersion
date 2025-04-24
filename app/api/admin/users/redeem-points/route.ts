/*
Lets users turn points into money, which is added to their account.
Allows only SUPER_ADMIN or SELLER users to do this.
Checks if the user ID and points are valid before converting.
Supports the platform’s points system by handling point redemption.
*/
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

// Conversion rate: 10 points = $1
const CONVERSION_RATE = 10;

export async function POST(request: Request) {
  try {
    // Check authorization
    const session = await getServerSession(authOptions);
    if (
      !session ||
      (session.user.role !== "SUPER_ADMIN" && session.user.role !== "SELLER")
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    const { userId, points } = body;

    if (!userId || !points || points <= 0) {
      return NextResponse.json(
        { error: "Invalid request data" },
        { status: 400 }
      );
    }

    // Get current user data
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if user has enough points
    if (user.points < points) {
      return NextResponse.json(
        { error: "Insufficient points" },
        { status: 400 }
      );
    }

    // Calculate amount to add based on points
    const amountToAdd = points / CONVERSION_RATE;

    // Update user record
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        points: { decrement: points },
        amount: { increment: amountToAdd },
      },
    });

    return NextResponse.json({
      newPoints: updatedUser.points,
      newBalance: updatedUser.amount,
      message: "Points redeemed successfully",
    });
  } catch (error) {
    console.error("Error redeeming points:", error);
    return NextResponse.json(
      { error: "Failed to redeem points" },
      { status: 500 }
    );
  }
}
