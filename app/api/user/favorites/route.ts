import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET /api/user/favorites - Get all favorites for current user
export async function GET() {
  try {
    const session = await getAuthSession();

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const userId = session.user.id;

    const favorites = await prisma.userFavorite.findMany({
      where: { userId },
      include: {
        auction: true,
      },
    });

    return NextResponse.json(favorites);
  } catch (error) {
    console.error("Error fetching favorites:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
