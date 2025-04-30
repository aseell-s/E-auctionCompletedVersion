// - Only admins or the seller can end the auction.
// - Checks if the auction exists, is not already ended, and end time has passed.
// - Sends money to the seller if there's a winning bid (may also give points).
// - Marks the auction as "ENDED" in the database.


import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const auction = await prisma.auction.findUnique({
      where: { id: params.id },
      include: {
        bids: {
          include: {
            bidder: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          orderBy: { amount: "desc" },
        },
        seller: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: { bids: true },
        },
      },
    });

    if (!auction) {
      return NextResponse.json({ error: "Auction not found" }, { status: 404 });
    }

    // Transform the data to exclude sensitive information
    const transformedAuction = {
      ...auction,
      seller: {
        id: auction.seller.id,
        name: auction.seller.name,
      },
      bids: auction.bids.map((bid) => ({
        id: bid.id,
        amount: bid.amount,
        createdAt: bid.createdAt,
        bidder: {
          id: bid.bidder.id,
          name: bid.bidder.name,
        },
      })),
    };

    return NextResponse.json(transformedAuction);
  } catch (error) {
    console.error("Error fetching auction details:", error);
    return NextResponse.json(
      { error: "Failed to fetch auction details" },
      { status: 500 }
    );
  }
}
