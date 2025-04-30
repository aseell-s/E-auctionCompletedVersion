import prisma from "./prisma";
import { awardSellerPoints, recordPointsTransaction } from "./pointsService";
import { AuctionStatus } from "@prisma/client";

interface ProcessingResult {
  processed: number;
  pointsAwarded: number;
  successfulAuctions: number;
  noActivityAuctions: number;
  details: Array<{
    auctionId: string;
    title: string;
    sellerId: string;
    pointsAwarded?: number;
    bidCount: number;
    status: string;
    previousStatus: string;
  }>;
}

/**
 * Process all auctions that have ended but still have ACTIVE status
 */
export async function processEndedAuctions(): Promise<ProcessingResult> {
  try {
    const now = new Date();
    console.log(
      `Finding expired auctions (current time: ${now.toISOString()})`
    );

    const expiredAuctions = await prisma.auction.findMany({
      where: {
        endTime: {
          lt: now, // Where the end time is in the past
        },
      },
      include: {
        _count: {
          select: { bids: true },
        },
        bids: {
          take: 1,
          orderBy: { amount: "desc" },
        },
        seller: {
          select: {
            id: true,
            name: true,
            points: true,
          },
        },
        // Include pointsAwarded field
      },
      orderBy: {
        endTime: "desc",
      },
    });

    console.log(`Found ${expiredAuctions.length} auction(s) to process`);

    // Log the auctions found for debugging
    if (expiredAuctions.length > 0) {
      console.log(
        "Auctions to process:",
        expiredAuctions.map((a) => ({
          id: a.id,
          title: a.title,
          endTime: a.endTime.toISOString(),
          status: a.status,
          bidCount: a._count.bids,
          sellerId: a.sellerId,
          sellerPoints: a.seller.points,
        }))
      );
    }

    let totalPointsAwarded = 0;
    let successfulAuctions = 0;
    let noActivityAuctions = 0;
    const details = [];

    // Process each auction
    for (const auction of expiredAuctions) {
      const previousStatus = auction.status;

      // Update to ENDED status
      const updatedAuction = await prisma.auction.update({
        where: { id: auction.id },
        data: { status: "ENDED" },
      });

      console.log(
        `Updated auction ${auction.id} from ${previousStatus} to ${updatedAuction.status}`
      );

      const auctionDetail: {
        auctionId: string;
        title: string;
        sellerId: string;
        bidCount: number;
        status: string;
        previousStatus: string;
        pointsAwarded?: number;
      } = {
        auctionId: auction.id,
        title: auction.title,
        sellerId: auction.sellerId,
        bidCount: auction._count.bids,
        status: updatedAuction.status,
        previousStatus,
      };

      // Only award points if not already awarded and auction had bids
      if (!auction.pointsAwarded && auction._count.bids > 0) {
        try {
          // This function updates the seller's points in the DB
          const pointsAwarded = await awardSellerPoints(
            auction.sellerId,
            auction.id
          );

          await recordPointsTransaction(
            auction.sellerId,
            auction.id,
            pointsAwarded
          );

          // Mark auction as points awarded
          await prisma.auction.update({
            where: { id: auction.id },
            data: { pointsAwarded: true },
          });

          totalPointsAwarded += pointsAwarded;
          successfulAuctions++;
          auctionDetail.pointsAwarded = pointsAwarded;

          console.log(
            `SUCCESS: Auction ${auction.id} processed: ${pointsAwarded} points awarded to seller ${auction.sellerId}`
          );
        } catch (error) {
          console.error(
            `ERROR awarding points for auction ${auction.id}:`,
            error
          );
          auctionDetail.pointsAwarded = 0;
        }
      } else if (auction._count.bids === 0) {
        noActivityAuctions++;
        console.log(
          `Auction ${auction.id} ended with no bids - no points awarded`
        );
      } else if (auction.pointsAwarded) {
        console.log(
          `Auction ${auction.id} already had points awarded, skipping`
        );
      }

      details.push(auctionDetail);
    }

    return {
      processed: expiredAuctions.length,
      pointsAwarded: totalPointsAwarded,
      successfulAuctions,
      noActivityAuctions,
      details,
    };
  } catch (error) {
    console.error("Error processing ended auctions:", error);
    throw error;
  }
}
