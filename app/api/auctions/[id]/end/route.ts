import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { AuctionStatus } from "@prisma/client";

// This endpoint will handle the auction ending and transferring funds to the seller
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getAuthSession();
    const userId = session?.user?.id;
    const { id } = params;

    // Only admins or the auction's seller can force an end
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the auction with its highest bid
    const auction = await prisma.auction.findUnique({
      where: { id },
      include: {
        bids: {
          orderBy: { amount: "desc" },
          take: 1,
          include: { bidder: true },
        },
      },
    });

    if (!auction) {
      return NextResponse.json({ error: "Auction not found" }, { status: 404 });
    }

    // Check if auction is already ended
    if (auction.status === AuctionStatus.ENDED) {
      return NextResponse.json(
        { error: "Auction is already ended" },
        { status: 400 }
      );
    }

    // Check if auction has ended by time
    const now = new Date();
    if (new Date(auction.endTime) > now) {
      return NextResponse.json(
        { error: "Auction has not yet ended" },
        { status: 400 }
      );
    }

    // If there's a winning bid, transfer funds to seller
    if (auction.bids.length > 0) {
      const winningBid = auction.bids[0];

      await prisma.$transaction([
        // Update auction status
        prisma.auction.update({
          where: { id },
          data: { status: AuctionStatus.ENDED },
        }),

        // Transfer bid amount to seller
        prisma.user.update({
          where: { id: auction.sellerId },
          data: {
            amount: { increment: winningBid.amount },
          },
        }),

        // Add points to seller (optional feature)
        prisma.user.update({
          where: { id: auction.sellerId },
          data: {
            points: { increment: 10 }, // Award 10 points for successful auction
          },
        }),
      ]);

      return NextResponse.json({
        success: true,
        message: "Auction ended successfully. Funds transferred to seller.",
      });
    } else {
      // No bids, just end the auction
      await prisma.auction.update({
        where: { id },
        data: { status: AuctionStatus.ENDED },
      });

      return NextResponse.json({
        success: true,
        message: "Auction ended with no bids.",
      });
    }
  } catch (error) {
    console.error("Error ending auction:", error);
    return NextResponse.json(
      { error: "Failed to end auction" },
      { status: 500 }
    );
  }
}
