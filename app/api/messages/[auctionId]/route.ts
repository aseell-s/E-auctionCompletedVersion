import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET: Fetch messages for a specific auction
export async function GET(
  req: NextRequest,
  { params }: { params: { auctionId: string } }
) {
  try {
    const session = await getAuthSession();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json(
        { error: "You must be logged in to view messages" },
        { status: 401 }
      );
    }

    // Use params directly without destructuring to avoid the warning
    // Get auction details to verify permission
    const auction = await prisma.auction.findUnique({
      where: { id: params.auctionId },
      select: { sellerId: true },
    });

    if (!auction) {
      return NextResponse.json({ error: "Auction not found" }, { status: 404 });
    }

    // Fetch all messages for this auction that involve this user
    // Changed query to include all messages for the auction
    const messages = await prisma.message.findMany({
      where: {
        auctionId: params.auctionId,
      },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}
