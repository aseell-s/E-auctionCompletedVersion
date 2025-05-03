import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Check if the user is a seller
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (user?.role !== "SELLER") {
      return NextResponse.json(
        { error: "Only sellers can access this endpoint" },
        { status: 403 }
      );
    }

    // Get all auctions created by the seller
    const auctions = await prisma.auction.findMany({
      where: {
        sellerId: userId,
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        _count: {
          select: {
            bids: true,
          },
        },
        winner: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json(auctions);
  } catch (error) {
    console.error("Error fetching seller auctions:", error);
    
    // Fixed error response syntax
    return NextResponse.json(
      { error: "Failed to fetch auctions" },
      { status: 500 }
    );
  }
}
