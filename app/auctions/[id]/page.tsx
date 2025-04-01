import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import AuctionDetailClient from "./components/AuctionDetailClient";
import { AuctionStatus } from "@prisma/client";

export default async function AuctionPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getServerSession(authOptions);
  const auction = await prisma.auction.findUnique({
    where: {
      id: params.id,
    },
    include: {
      seller: {
        select: {
          name: true,
          id: true,
        },
      },
      bids: {
        orderBy: {
          amount: "desc",
        },
        take: 5,
        include: {
          bidder: {
            select: {
              name: true,
              id: true,
              email: true,
            },
          },
        },
      },
      _count: {
        select: {
          bids: true,
        },
      },
    },
  });

  if (!auction) {
    notFound();
  }

  // Determine winner based on highest bid for ended auctions
  const auctionWithWinner = {
    ...auction,
    winner: undefined as
      | { id: string; name: string; email: string }
      | undefined,
  };

  if (auction.status === AuctionStatus.ENDED && auction.bids.length > 0) {
    // The highest bid is already the first one due to our sorting
    const highestBid = auction.bids[0];
    auctionWithWinner.winner = {
      id: highestBid.bidder.id,
      name: highestBid.bidder.name,
      email: highestBid.bidder.email,
    };
  }

  return <AuctionDetailClient auction={auctionWithWinner} session={session} />;
}
