// - DELETE API to remove an auction from user's favorites.
// - Only available to logged-in users.
// - Deletes the record from the userFavorite table using Prisma.
import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

// POST /api/user/favorites/[auctionId] - Add an auction to favorites
export async function POST(
  req: Request,
  { params }: { params: { auctionId: string } }
) {
  try {
    const session = await getAuthSession();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const { auctionId } = params;

    // Check if auction exists
    const auction = await prisma.auction.findUnique({
      where: { id: auctionId },
    });

    if (!auction) {
      return NextResponse.json({ error: "Auction not found" }, { status: 404 });
    }

    // Add to favorites (upsert to handle potential duplicates)
    await prisma.userFavorite.upsert({
      where: {
        userId_auctionId: {
          userId,
          auctionId,
        },
      },
      update: {},
      create: {
        userId,
        auctionId,
      },
    });

    return NextResponse.json({ message: "Added to favorites" });
  } catch (error) {
    console.error("Error adding favorite:", error);
    return NextResponse.json(
      { error: "Failed to add favorite" },
      { status: 500 }
    );
  }
}

// DELETE /api/user/favorites/[auctionId] - Remove an auction from favorites
export async function DELETE(
  req: Request,
  { params }: { params: { auctionId: string } }
) {
  try {
    const session = await getAuthSession();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const { auctionId } = params;

    // Remove from favorites
    await prisma.userFavorite.delete({
      where: {
        userId_auctionId: {
          userId,
          auctionId,
        },
      },
    });

    return NextResponse.json({ message: "Removed from favorites" });
  } catch (error) {
    console.error("Error removing favorite:", error);
    return NextResponse.json(
      { error: "Failed to remove favorite" },
      { status: 500 }
    );
  }
}
