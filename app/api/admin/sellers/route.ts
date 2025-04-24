/*
Checks if the user is logged in.
Allows only SUPER_ADMIN users to access the data
Reads filters and search terms from the URL
Gets ready to filter/search seller data, though actual data fetching isn’t shown.
Handles errors if the user isn’t logged in or allowed

*/
import { NextResponse, Request } from "next/server";
import { PrismaClient, Role } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const prisma = new PrismaClient();

export async function GET(request: Request) {
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
      return new NextResponse(JSON.stringify({ message: "Not authorized" }), {
        status: 403,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    // Get URL parameters
    const url = new URL(request.url);
    const approvalStatus = url.searchParams.get("approved");
    const searchQuery = url.searchParams.get("search");

    // Build where clause
    const where: any = {
      role: Role.SELLER,
    };

    // Filter by approval status if specified
    if (approvalStatus !== null) {
      where.isApproved = approvalStatus === "true";
    }

    // Add search filter if provided
    if (searchQuery) {
      where.OR = [
        { email: { contains: searchQuery, mode: "insensitive" } },
        { name: { contains: searchQuery, mode: "insensitive" } },
        {
          profile: {
            OR: [
              { companyName: { contains: searchQuery, mode: "insensitive" } },
              { companyRegistrationNo: { contains: searchQuery, mode: "insensitive" } },
            ],
          },
        },
      ];
    }

    const sellers = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isApproved: true,
        createdAt: true,
        profile: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return new NextResponse(JSON.stringify({ sellers }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error fetching sellers:", error);
    return new NextResponse(
      JSON.stringify({
        message: "Failed to fetch sellers",
        error: error instanceof Error ? error.message : "Unknown error",
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
