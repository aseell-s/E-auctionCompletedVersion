import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { processEndedAuctions } from "@/lib/auctionScheduler";

export async function POST(request: NextRequest) {
  try {
    // Check if the user is an admin
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    console.log("Processing auctions started by admin:", session.user.id);

    // Process ended auctions
    const result = await processEndedAuctions();

    console.log("Processing result:", JSON.stringify(result, null, 2));

    return NextResponse.json({
      success: true,
      processed: result.processed,
      pointsAwarded: result.pointsAwarded,
      successfulAuctions: result.successfulAuctions,
      details: result.details,
      message: `Successfully processed ${result.processed} auctions (${result.successfulAuctions} with points awarded)`,
    });
  } catch (error) {
    console.error("Error processing auctions:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to process auctions",
        error: String(error),
      },
      { status: 500 }
    );
  }
}
