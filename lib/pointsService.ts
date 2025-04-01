import prisma from "./prisma";

/**
 * Calculate points to award to a seller based on auction results
 * @param finalPrice - The final price of the auction
 * @param bidCount - Number of bids placed on the auction
 * @returns The number of points to award
 */
export const calculatePoints = (
  finalPrice: number,
  bidCount: number
): number => {
  // Base points from auction value - 1 point per $100
  const pricePoints = Math.floor(finalPrice / 100);

  // Additional points from engagement (bids) - 20 points per bid
  const bidPoints = bidCount * 20;

  // Bonus points for highly contested auctions (5+ bids)
  const bonusPoints = bidCount >= 5 ? 200 : 0;

  const totalPoints = pricePoints + bidPoints + bonusPoints;

  console.log(
    `Points calculation: ${finalPrice}$ = ${pricePoints} points, ${bidCount} bids = ${bidPoints} points, bonus = ${bonusPoints}, total = ${totalPoints}`
  );

  return totalPoints;
};

/**
 * Award points to a seller for a successful auction
 * @param sellerId - ID of the seller to award points to
 * @param auctionId - ID of the completed auction
 */
export const awardSellerPoints = async (
  sellerId: string,
  auctionId: string
): Promise<number> => {
  try {
    // Get auction details with bid count
    const auction = await prisma.auction.findUnique({
      where: { id: auctionId },
      include: {
        _count: {
          select: { bids: true },
        },
      },
    });

    if (!auction) {
      throw new Error("Auction not found");
    }

    // Calculate points to award
    const pointsToAward = calculatePoints(
      auction.currentPrice,
      auction._count.bids
    );

    console.log(
      `Awarding ${pointsToAward} points to seller ${sellerId} for auction ${auctionId}`
    );
    console.log(
      `Auction final price: ${auction.currentPrice}, bids: ${auction._count.bids}`
    );

    // Get seller's current points for logging
    const seller = await prisma.user.findUnique({
      where: { id: sellerId },
      select: { points: true },
    });

    if (!seller) {
      throw new Error(`Seller with ID ${sellerId} not found`);
    }

    console.log(`Current seller points: ${seller.points || 0}`);

    // CRITICAL FIX: Make sure the update is properly executed and committed
    const updatedUser = await prisma.user.update({
      where: { id: sellerId },
      data: {
        points: {
          increment: pointsToAward,
        },
      },
    });

    if (!updatedUser) {
      throw new Error("Failed to update seller points");
    }

    console.log(
      `Updated seller points: ${updatedUser.points} (was ${seller.points}, added ${pointsToAward})`
    );

    // Verify the update worked by checking the difference
    if (updatedUser.points !== seller.points + pointsToAward) {
      console.warn(
        `Points update verification failed: Expected ${
          seller.points + pointsToAward
        }, got ${updatedUser.points}`
      );
    }

    return pointsToAward;
  } catch (error) {
    console.error(`Error awarding points to seller ${sellerId}:`, error);
    throw error;
  }
};

/**
 * Add a record of points earned to track history (optional)
 */
export const recordPointsTransaction = async (
  sellerId: string,
  auctionId: string,
  points: number
) => {
  // This could be implemented with a new "PointsTransaction" model
  // For now, we'll just log it
  console.log(
    `Seller ${sellerId} earned ${points} points from auction ${auctionId}`
  );
};
