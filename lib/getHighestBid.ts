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
