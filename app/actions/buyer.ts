import { prisma } from "@/lib/prisma";

export async function getApprovedAuctions() {
  return prisma.auction.findMany({
    where: {
      status: "ACTIVE",
      seller: {
        isApproved: true,
      },
    },
    include: {
      seller: {
        select: {
          name: true,
          id: true,
        },
      },
      _count: {
        select: {
          bids: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}
