// - GET API to fetch profile info for logged-in users (name, email, role, etc.).
// - Secures access so only authenticated users can use it.
// - Excludes sensitive data like passwords.
// - Supports dashboards and dynamic profile display on the frontend.
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    // Get the current session
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Find the user in the database
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        profile: true,
      },
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Return user data excluding sensitive information
    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      amount: user.amount,
      points: user.points,
      isApproved: user.isApproved,
      profile: user.profile,
      createdAt: user.createdAt,
    };

    return NextResponse.json(safeUser);
  } catch (error) {
    console.error("Error fetching profile:", error);
    return NextResponse.json(
      { message: "An error occurred while fetching the user profile" },
      { status: 500 }
    );
  }
}
