import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

// POST: Create a new message
export async function POST(req: NextRequest) {
  try {
    const session = await getAuthSession();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json(
        { error: "You must be logged in to send messages" },
        { status: 401 }
      );
    }

    const { text, recipientId, auctionId } = await req.json();

    if (!text || !recipientId || !auctionId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create new message
    const message = await prisma.message.create({
      data: {
        text,
        senderId: userId,
        recipientId,
        auctionId,
      },
    });

    return NextResponse.json(message, { status: 201 });
  } catch (error) {
    console.error("Error creating message:", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}
