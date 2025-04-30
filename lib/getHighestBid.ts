"use server"; // This tells Next.js it's a server function

import { prisma } from "@/lib/prisma";

export async function getHighestBidder(auctionId : string, amt: any) {
  const highestBid = await prisma.bid.findMany({
    where: { auctionId, amount: amt },
    orderBy: { amount: "desc" }, // Get the highest bid
    include: {
      bidder: true, // Include bidder details
    },
  });

  return highestBid;
}
// This file defines a server-side function `getHighestBidder`.
// It retrieves the highest bid for a specific auction from the database using Prisma ORM.
// The function:
// 1. Accepts an `auctionId` and an `amt` (amount) as parameters.
// 2. Queries the `bid` table to find bids matching the given `auctionId` and `amt`.
// 3. Orders the results by the bid amount in descending order to get the highest bid.
// 4. Includes the bidder's details in the result.
// 5. Returns the highest bid along with the bidder's information.