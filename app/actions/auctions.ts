import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function getUserAuctions() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) return null;

    const auctions = await prisma.auction.findMany({
      where: {
        sellerId: session.user.id,
      },
      include: {
        _count: {
          select: { bids: true },
        },
        seller: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return auctions;
  } catch (error) {
    console.error("Error fetching user auctions:", error);
    return null;
  }
}
