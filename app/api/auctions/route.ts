import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { PrismaClient, AuctionStatus } from "@prisma/client";

const prisma = new PrismaClient();

// export async function POST(req: Request) {
//   try {
//     const session = await getServerSession(authOptions);

//     if (!session) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }

//     if (session.user.role !== Role.SELLER) {
//       return NextResponse.json(
//         { error: "Only sellers can create auctions" },
//         { status: 403 }
//       );
//     }

//     const data = await req.json();
//     const { title, description, startPrice, endTime, images, itemType } = data;

//     // Validate required fields
//     if (!title || !description || !startPrice || !endTime) {
//       return NextResponse.json(
//         { error: "Missing required fields" },
//         { status: 400 }
//       );
//     }

//     // Create the auction
//     const auction = await prisma.auction.create({
//       data: {
//         title,
//         description,
//         startPrice,
//         currentPrice: startPrice,
//         endTime: new Date(endTime),
//         images: images || [],
//         sellerId: session.user.id,
//         itemType,
//         status: AuctionStatus.ACTIVE,
//       },
//     });

//     return NextResponse.json(auction);
//   } catch (error) {
//     console.error("Auction creation error:", error);
//     return NextResponse.json(
//       { error: "Failed to create auction" },
//       { status: 500 }
//     );
//   }
// }

// app/api/auctions/route.ts
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    console.log("[Auction Creation] Session:", session);

    if (!session?.user?.id) {
      console.error("[Auction Creation] Unauthorized access attempt");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rawBody = await req.text();
    console.log("[Auction Creation] Raw request body:", rawBody);
    const data = JSON.parse(rawBody);

    const {
      title,
      description,
      startPrice,
      endTime,
      images = [],
      itemType = "IRON",
    } = data;

    // Validate required fields
    const missingFields = [];
    if (!title?.trim()) missingFields.push("title");
    if (!description?.trim()) missingFields.push("description");
    if (!startPrice) missingFields.push("startPrice");
    if (!endTime) missingFields.push("endTime");

    if (missingFields.length > 0) {
      console.error("[Auction Creation] Missing fields:", missingFields);
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(", ")}` },
        { status: 400 }
      );
    }

    // Validate numerical startPrice
    if (isNaN(Number(startPrice))) {
      console.error("[Auction Creation] Invalid startPrice:", startPrice);
      return NextResponse.json(
        { error: "startPrice must be a valid number" },
        { status: 400 }
      );
    }

    // Validate itemType enum
    const validItemTypes = ["IRON", "METAL", "ALUMINIUM"];
    if (!validItemTypes.includes(itemType)) {
      console.error("[Auction Creation] Invalid itemType:", itemType);
      return NextResponse.json(
        { error: "Invalid item type specified" },
        { status: 400 }
      );
    }

    console.log("[Auction Creation] Creating auction with:", {
      title: title.trim(),
      description: description.trim(),
      startPrice: Number(startPrice),
      endTime: new Date(endTime),
      images,
      itemType,
      sellerId: session.user.id,
    });

    const auction = await prisma.auction.create({
      data: {
        title: title.trim(),
        description: description.trim(),
        startPrice: Number(startPrice),
        currentPrice: Number(startPrice),
        endTime: new Date(endTime),
        images,
        itemType,
        sellerId: session.user.id,
        // itemType,
        status: AuctionStatus.PENDING,
      },
    });

    console.log("[Auction Creation] Success:", auction.id);
    return NextResponse.json(auction);
  } catch (error) {
    console.error("[Auction Creation] Critical Error:", {
      error,
      rawError: error instanceof Error ? error.message : "Unknown error type",
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") as AuctionStatus | null;
    const sellerId = searchParams.get("sellerId");
    const approvalStatus = searchParams.get("approvalStatus");
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const auctions = await prisma.auction.findMany({
      where: {
        ...(status && { status: status as AuctionStatus }),
        ...(sellerId && { sellerId }),
        ...(approvalStatus === "pending" && { status: AuctionStatus.PENDING }),
        ...(approvalStatus === "approved" && { status: AuctionStatus.ACTIVE }),
      },
      include: {
        seller: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            createdAt: true,
          },
        },
        bids: {
          select: {
            id: true,
            amount: true,
            createdAt: true,
            bidder: {
              select: {
                name: true,
                email: true,
              },
            },
          },
          orderBy: {
            amount: "desc",
          },
          take: 5,
        },
        _count: {
          select: {
            bids: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(auctions);
  } catch (error) {
    console.error("Auction fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch auctions" },
      { status: 500 }
    );
  }
}
