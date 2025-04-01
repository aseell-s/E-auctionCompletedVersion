import { NextResponse } from "next/server";
import { PrismaClient, Role, AuctionStatus } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return new NextResponse(
        JSON.stringify({ message: "Not authenticated" }),
        {
          status: 401,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    if (session.user.role !== Role.SUPER_ADMIN) {
      return new NextResponse(
        JSON.stringify({ message: "Not authorized" }),
        {
          status: 403,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    const auctions = await prisma.auction.findMany({
      where: {
        status: AuctionStatus.PENDING,
        isApproved: false,
      },
      select: {
        id: true,
        title: true,
        description: true,
        startPrice: true,
        status: true,
        isApproved: true,
        createdAt: true,
        endTime: true,
        seller: {
          select: {
            id: true,
            name: true,
            email: true,
            profile: {
              select: {
                company: true,
                phone: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return new NextResponse(
      JSON.stringify({ auctions }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error fetching pending auctions:", error);
    return new NextResponse(
      JSON.stringify({
        message: "Internal server error",
        error: error instanceof Error ? error.message : String(error),
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } finally {
    await prisma.$disconnect();
  }
}
