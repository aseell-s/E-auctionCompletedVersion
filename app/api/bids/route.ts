// - POST API to place a bid on an auction.
// - Checks user balance, auction status, and bid amount.
// - Uses Prisma to update auction price, create bid, and adjust balances.
// - Ensures secure and valid bidding with proper validations.
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const body = await request.json();
    const { auctionId, amount } = body;

    // Get the current user with their balance
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { amount: true },
    });

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    // Check if the user has enough balance for the bid
    if (user.amount < amount) {
      return new NextResponse("Insufficient funds to place this bid", {
        status: 400,
      });
    }

    const auction = await prisma.auction.findUnique({
      where: { id: auctionId },
      include: {
        bids: {
          orderBy: { amount: "desc" },
          take: 1,
          include: { bidder: true },
        },
      },
    });

    if (!auction) {
      return new NextResponse("Auction not found", { status: 404 });
    }

    if (auction.status !== "ACTIVE") {
      return new NextResponse("Auction is not active", { status: 400 });
    }

    if (new Date(auction.endTime) < new Date()) {
      return new NextResponse("Auction has ended", { status: 400 });
    }

    if (amount <= auction.currentPrice) {
      return new NextResponse("Bid must be higher than current price", {
        status: 400,
      });
    }

    if (session.user.id === auction.sellerId) {
      return new NextResponse("Cannot bid on your own auction", {
        status: 400,
      });
    }

    // Find the previous highest bidder (if any) to refund their bid
    const previousHighestBid = auction.bids[0];

    // Create bid, update auction price, adjust user balances in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create the new bid
      const newBid = await tx.bid.create({
        data: {
          amount,
          auctionId,
          bidderId: session.user.id,
        },
      });

      // 2. Update the auction's current price
      const updatedAuction = await tx.auction.update({
        where: { id: auctionId },
        data: { currentPrice: amount },
      });

      // 3. Deduct the bid amount from the current bidder's balance
      await tx.user.update({
        where: { id: session.user.id },
        data: {
          amount: {
            decrement: amount,
          },
        },
      });

      // 4. If there was a previous bid, refund that bidder
      if (previousHighestBid) {
        await tx.user.update({
          where: { id: previousHighestBid.bidder.id },
          data: {
            amount: {
              increment: previousHighestBid.amount,
            },
          },
        });
      }

      return newBid;
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("[BIDS_POST]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
