import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { notFound, redirect } from "next/navigation";
import { AuctionStatus } from "@prisma/client";
import CertificateDownloadButton from "./CertificateDownloadButton";
import { formatDate } from "@/lib/utils";
import Image from "next/image";

export default async function CertificatePage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/api/auth/signin");
  }

  // Ensure params.id is properly awaited
  const auctionId = params?.id;
  if (!auctionId) {
    notFound();
  }

  const auction = await prisma.auction.findUnique({
    where: {
      id: auctionId,
    },
    include: {
      seller: {
        select: {
          name: true,
          id: true,
          email: true,
        },
      },
      bids: {
        orderBy: {
          amount: "desc",
        },
        take: 1,
        include: {
          bidder: {
            select: {
              name: true,
              email: true,
              id: true,
            },
          },
        },
      },
    },
  });

  if (!auction) {
    notFound();
  }

  // Only allow access if the auction has ended and user is seller or winner
  if (
    auction.status !== AuctionStatus.ENDED ||
    (session.user.id !== auction.sellerId &&
      (auction.bids.length === 0 ||
        session.user.email !== auction.bids[0].bidder.email))
  ) {
    redirect("/auctions");
  }

  const winner = auction.bids.length > 0 ? auction.bids[0].bidder : null;
  const finalPrice =
    auction.bids.length > 0 ? auction.bids[0].amount : auction.startPrice;

  return (
    <div className="container mx-auto py-4 sm:py-6 px-2 sm:px-4">
      <div className="w-full max-w-3xl mx-auto">
        <div className="mb-4 sm:mb-6 px-2">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Auction Certificate</h1>
          <p className="text-sm text-gray-500 mt-1">
            This certificate confirms the completion of auction: {auction.title}
          </p>
        </div>
        
        {/* Certificate Container */}
        <div id="certificate" className="bg-white border-8 border-double border-gray-200 rounded-lg shadow-lg p-8 sm:p-10 md:p-12 relative">
          {/* Header with logo on right */}
          <div className="flex justify-between items-start mb-8">
            {/* Title and subtitle */}
            <div className="max-w-[75%]">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-2">
                Certificate of Auction
              </h1>
              <p className="text-sm sm:text-base text-gray-600 font-medium">
                E-Auction Platform
              </p>
              
              {/* Decorative line */}
              <div className="w-full h-0.5 bg-gradient-to-r from-gray-300 to-transparent mt-4"></div>
            </div>
            
            {/* Logo on right */}
            <div className="w-20 sm:w-24 md:w-28">
              <img
                src="/e-aucitonLogo.png"
                alt="E-Auction Logo"
                className="w-full h-auto"
              />
            </div>
          </div>

          {/* Main content */}
          <div className="mb-6 text-center">
            <p className="text-base sm:text-lg">
              This certifies that the following auction was successfully completed:
            </p>
          </div>

          {/* Auction details */}
          <div className="border-t border-b border-gray-200 py-6 my-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <h2 className="text-lg sm:text-xl font-semibold mb-3 text-gray-700">
                  Auction Details
                </h2>
                <div className="space-y-3 text-gray-700">
                  <p>
                    <span className="font-medium">Auction ID:</span>{" "}
                    <span className="font-mono text-xs break-all">{auction.id}</span>
                  </p>
                  <p>
                    <span className="font-medium">Title:</span>{" "}
                    {auction.title}
                  </p>
                  <p>
                    <span className="font-medium">Final Price:</span>{" "}
                    <span className="font-semibold">
                      ﷼{finalPrice.toLocaleString("en-SA")}
                    </span>
                  </p>
                  <p>
                    <span className="font-medium">End Date:</span>{" "}
                    {formatDate(auction.endTime)}
                  </p>
                </div>
              </div>
              
              <div>
                <h2 className="text-lg sm:text-xl font-semibold mb-3 text-gray-700">
                  Participants
                </h2>
                <div className="space-y-3 text-gray-700">
                  <p>
                    <span className="font-medium">Seller:</span>{" "}
                    {auction.seller.name}
                  </p>
                  <p>
                    <span className="font-medium">Winner:</span>{" "}
                    <span className="font-semibold">
                      {winner ? winner.name : "No winner"}
                    </span>
                  </p>
                  <p>
                    <span className="font-medium">Item Type:</span>{" "}
                    {auction.itemType}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Auction Description */}
          <div className="my-6">
            <h2 className="text-lg sm:text-xl font-semibold mb-3 text-gray-700">
              Item Description
            </h2>
            <p className="text-base text-gray-700 border p-4 rounded-md bg-gray-50">
              {auction.description.length > 200 
                ? `${auction.description.substring(0, 200)}...` 
                : auction.description}
            </p>
          </div>

          {/* Decorative line */}
          <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-gray-300 to-transparent my-6"></div>

          {/* Footer */}
          <div className="text-center mt-8">
            <p className="text-gray-600 mb-6 text-sm sm:text-base">
              This certificate verifies that the auction was conducted and
              completed according to the terms and conditions of the E-Auction
              platform.
            </p>

            {/* Signatures */}
            <div className="flex justify-between items-center mt-8">
              <div className="text-center">
                <div className="border-b border-gray-400 w-28 sm:w-36 mx-auto"></div>
                <p className="mt-2 text-gray-700 text-sm">Platform Administrator</p>
              </div>
              <div className="text-center">
                <div className="border-b border-gray-400 w-28 sm:w-36 mx-auto"></div>
                <p className="mt-2 text-gray-700 text-sm">Digital Seal</p>
              </div>
            </div>

            {/* Certificate ID and Date */}
            <div className="mt-10 flex justify-between text-xs text-gray-500">
              <div>Certificate ID: {auction.id.slice(0, 8)}-CERT</div>
              <div>Issued on: {formatDate(new Date())}</div>
            </div>
          </div>

          {/* Watermark */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 -rotate-45 text-[4rem] sm:text-[6rem] opacity-[0.03] pointer-events-none z-0 whitespace-nowrap font-bold text-gray-800">
            E-Auction
          </div>
        </div>

        {/* Download button outside the certificate */}
        <div className="text-center mt-8 px-2">
          <CertificateDownloadButton
            auctionId={auction.id}
            auctionTitle={auction.title}
          />
          <p className="text-xs text-gray-500 mt-2">
            Download this certificate as a PDF document for your records.
          </p>
        </div>
      </div>
    </div>
  );
}
