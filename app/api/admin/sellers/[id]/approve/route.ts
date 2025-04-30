/*
Lets admins approve sellers so they can use the platform.
Makes sure only SUPER_ADMIN users can do this action.
Checks if the seller exists and has the correct role before approving.
Supports admin tools used to manage seller approvals.
*/
import { NextResponse } from "next/server";
import { PrismaClient, Role } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const prisma = new PrismaClient();

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return new NextResponse(
        JSON.stringify({ message: "Not authenticated" }),
        { status: 401 }
      );
    }

    if (session.user.role !== Role.SUPER_ADMIN) {
      return new NextResponse(JSON.stringify({ message: "Not authorized" }), {
        status: 403,
      });
    }

    const body = await req.json();
    const sellerId = params.id;

    // Verify seller exists and is a seller
    const seller = await prisma.user.findUnique({
      where: {
        id: sellerId,
        role: Role.SELLER,
      },
    });

    if (!seller) {
      return new NextResponse(JSON.stringify({ message: "Seller not found" }), {
        status: 404,
      });
    }

    // Use transaction to ensure data consistency
    const updatedSeller = await prisma.$transaction(async (tx) => {
      // Update seller approval status
      const updated = await tx.user.update({
        where: {
          id: sellerId,
          role: Role.SELLER,
        },
        data: {
          isApproved: body.approve,
        },
        include: {
          profile: true,
        },
      });

      // If rejecting seller, cancel all their pending auctions
      if (!body.approve) {
        await tx.auction.updateMany({
          where: {
            sellerId: sellerId,
            status: "PENDING",
          },
          data: {
            status: "CANCELLED",
            isApproved: false,
          },
        });
      }

      return updated;
    });

    return new NextResponse(
      JSON.stringify({
        message: body.approve
          ? "Seller approved successfully"
          : "Seller rejected successfully",
        seller: updatedSeller,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error in seller approval:", error);
    return new NextResponse(
      JSON.stringify({
        message: "Failed to process seller approval",
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
