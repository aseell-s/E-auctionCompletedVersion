// - GET API to handle and finalize ended auctions.
// - Automates auction cleanup and status updates.
// - Returns how many auctions were processed.
// - Helps keep the auction system running smoothly.
import { NextResponse } from "next/server";
import { processEndedAuctions } from "@/lib/auctionScheduler";

// This endpoint should be secured in production
export async function GET() {
  try {
    const result = await processEndedAuctions();
    return NextResponse.json({
      success: true,
      processed: result.processed,
      message: `Successfully processed ${result.processed} auctions`,
    });
  } catch (error) {
    console.error("Error processing auctions:", error);
    return NextResponse.json(
      { success: false, error: "Failed to process auctions" },
      { status: 500 }
    );
  }
}
