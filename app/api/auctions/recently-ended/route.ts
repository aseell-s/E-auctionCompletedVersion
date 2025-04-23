import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { calculatePoints } from "@/lib/pointsService";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Only get recently ended auctions (last 24 hours)
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);
    const now = new Date();

    const recentlyEndedAuctions = await prisma.auction.findMany({
      where: {
        sellerId: session.user.id,
        status: "ENDED",
        endTime: {
          gte: oneDayAgo,
          lte: now,
        },
      },
      include: {
        _count: {
          select: { bids: true },
        },
      },
      orderBy: {
        endTime: "desc",
      },
    });

    // Award points if not already awarded
    for (const auction of recentlyEndedAuctions) {
      if (!auction.pointsAwarded && auction._count.bids > 0) {
        const points = calculatePoints(
          auction.currentPrice,
          auction._count.bids
        );
        await prisma.$transaction([
          prisma.user.update({
            where: { id: auction.sellerId },
            data: { points: { increment: points } },
          }),
          prisma.auction.update({
            where: { id: auction.id },
            data: { pointsAwarded: true },
          }),
        ]);
        auction.pointsAwarded = true;
      }
    }

    // Fetch seller's current points from DB
    const seller = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { points: true },
    });

    // Calculate points for each auction (for response)
    const auctionsWithPoints = recentlyEndedAuctions.map((auction) => ({
      ...auction,
      pointsAwardedValue:
        auction._count.bids > 0
          ? calculatePoints(auction.currentPrice, auction._count.bids)
          : 0,
      sellerPoints: seller?.points ?? 0, // Always use DB value for consistency
    }));

    return NextResponse.json(auctionsWithPoints);
  } catch (error) {
    console.error("Error fetching recently ended auctions:", error);
    return NextResponse.json(
      { message: "An error occurred while fetching recently ended auctions" },
      { status: 500 }
    );
  }
}
