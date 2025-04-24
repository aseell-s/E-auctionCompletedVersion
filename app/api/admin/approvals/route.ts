/*
1. Gets sellers who are waiting to be approved.
2. Gets auctions that are still pending and not approved yet.
3. Sends the information to the admin so they can review it.
4. If something goes wrong, it handles the error nicely without breaking the app
*/
import { AuctionStatus, PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Wrap each database operation in individual try-catch blocks
    let pendingSellers = [];
    let pendingAuctions = [];
    let totalUsers = 0;

    try {
      pendingSellers = await prisma.user.findMany({
        where: { role: "SELLER", isApproved: false },
        include: {
          profile: true,
        },
      });
    } catch (error) {
      console.error("Error fetching pending sellers:", error);
    }

    try {
      pendingAuctions = await prisma.auction.findMany({
        where: { status: AuctionStatus.PENDING },
        include: {
          seller: {
            include: {
              profile: true,
            },
          },
          bids: {
            include: {
              bidder: true,
            },
            orderBy: {
              amount: "desc",
            },
          },
          Comment: {
            include: {
              user: true,
            },
            orderBy: {
              createdAt: "desc",
            },
          },
        },
      });
    } catch (error) {
      console.error("Error fetching pending auctions:", error);
    }

    try {
      totalUsers = await prisma.user.count();
    } catch (error) {
      console.error("Error counting users:", error);
    }

    // Check if we have at least some data to return
    if (!pendingSellers && !pendingAuctions && !totalUsers) {
      throw new Error("Failed to fetch any data from the database");
    }

    return NextResponse.json({
      pendingSellers: pendingSellers || [],
      pendingAuctions: pendingAuctions || [],
      totalUsers: totalUsers || 0,
    });
  } catch (error) {
    console.error("Critical error in GET /api/admin/approvals:", error);
    return NextResponse.json(
      {
        error: "Internal Server Error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  } finally {
    // Ensure connection is closed
    await prisma.$disconnect();
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { type, id, approved } = body;

    if (!type || !id || approved === undefined) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (type === "seller") {
      await prisma.user.update({
        where: { id },
        data: { isApproved: approved },
      });
    } else if (type === "auction") {
      await prisma.auction.update({
        where: { id },
        data: {
          status: approved ? AuctionStatus.ACTIVE : AuctionStatus.REJECTED,
        },
      });
    } else {
      return NextResponse.json(
        { error: "Invalid type specified" },
        { status: 400 }
      );
    }

    return NextResponse.json({ message: "Successfully updated" });
  } catch (error) {
    console.error("Error in PATCH /api/admin/approvals:", error);
    return NextResponse.json(
      {
        error: "Internal Server Error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
