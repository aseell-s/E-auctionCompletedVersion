import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { AuctionStatus, Role } from "@prisma/client";

export async function GET() {
  try {
    const session = await getAuthSession();
    const userId = session?.user?.id;

    // If no user is logged in, return empty response
    if (!userId) {
      return NextResponse.json([]);
    }

    // Get user role to determine if they're a seller
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    const isSeller = user?.role === Role.SELLER;

    // Check and update expired auctions
    const now = new Date();
    const expiredAuctions = await prisma.auction.findMany({
      where: {
        status: AuctionStatus.ACTIVE,
        endTime: {
          lt: now,
        },
      },
      select: {
        id: true,
      },
    });

    // Update expired auctions status to ENDED
    if (expiredAuctions.length > 0) {
      const expiredIds = expiredAuctions.map((auction) => auction.id);
      await prisma.auction.updateMany({
        where: {
          id: {
            in: expiredIds,
          },
        },
        data: {
          status: AuctionStatus.ENDED,
        },
      });

      console.log(
        `Updated ${expiredAuctions.length} expired auctions to ENDED status.`
      );
    }

    // For buyer, find auctions where they are the highest bidder
    let auctionsWithHighestBids: any[] = [];
    const isBuyer = user?.role === Role.BUYER;

    if (isBuyer) {
      // Get auctions where the user is the highest bidder
      auctionsWithHighestBids = await prisma.auction.findMany({
        where: {
          bids: {
            some: {
              bidderId: userId,
              auction: {
                bids: {
                  none: {
                    NOT: {
                      bidderId: userId,
                    },
                    amount: {
                      gt: prisma.bid.fields.amount,
                    },
                  },
                },
              },
            },
          },
        },
        select: { id: true },
      });
    }

    // Fetch auctions with updated statuses
    const auctions = await prisma.auction.findMany({
      where: {
        OR: [
          // For sellers: show only their auctions
          ...(isSeller ? [{ sellerId: userId }] : []),

          // For buyers: show active auctions + auctions where they're highest bidder
          ...(isBuyer
            ? [
                { status: AuctionStatus.ACTIVE },
                { id: { in: auctionsWithHighestBids.map((a) => a.id) } },
              ]
            : []),
        ],
      },
      include: {
        seller: {
          select: {
            id: true,
            name: true,
          },
        },
        bids: {
          orderBy: {
            amount: "desc",
          },
          take: 1,
          include: {
            bidder: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        _count: {
          select: {
            bids: true,
          },
        },
      },
    });

    // If user is logged in, fetch their favorites to mark favorite auctions
    let userFavorites: string[] = [];
    if (userId) {
      const favorites = await prisma.userFavorite.findMany({
        where: { userId },
        select: { auctionId: true },
      });
      userFavorites = favorites.map((fav) => fav.auctionId);
    }

    // Add isFavorite flag and winner info to each auction
    const auctionsWithEnhancements = auctions.map((auction) => {
      const winner =
        auction.status === AuctionStatus.ENDED && auction.bids.length > 0
          ? auction.bids[0].bidder
          : null;

      return {
        ...auction,
        isFavorite: userFavorites.includes(auction.id),
        winner: winner,
        // Remove the full bids array to keep response lean
        bids: undefined,
      };
    });

    return NextResponse.json(auctionsWithEnhancements);
  } catch (error) {
    console.error("Error fetching approved auctions:", error);
    return NextResponse.json(
      { error: "Failed to fetch auctions" },
      { status: 500 }
    );
  }
}
