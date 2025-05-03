/*
Checks if the user is a SUPER_ADMIN (only they can approve).
Updates the auction's isApproved field in the database to true.
Sends back a response to the frontend:
Success if approved
Error if not allowed or something goes wrong
*/
import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { Role } from "@prisma/client";

export async function POST(
  req: NextRequest,
  {
    params,
    searchParams,
  }: { params: { id: string }; searchParams: URLSearchParams }
) {
  try {
    // Get the authenticated user session
    const session = await getAuthSession();

    // Check if the user is logged in
    if (!session?.user) {
      return NextResponse.json(
        { error: "You must be logged in" },
        { status: 401 }
      );
    }

    // Check if the user is an admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (user?.role !== Role.SUPER_ADMIN) {
      return NextResponse.json(
        { error: "You do not have permission to perform this action" },
        { status: 403 }
      );
    }

    // Get the auction ID from params
    const { id } = params;

    // Update the auction status
    const auction = await prisma.auction.update({
      where: { id },
      data: { isApproved: true },
    });

    return NextResponse.json(auction);
  } catch (error) {
    console.error("Error approving auction:", error);
    return NextResponse.json(
      { error: "Failed to approve auction" },
      { status: 500 }
    );
  }
}
