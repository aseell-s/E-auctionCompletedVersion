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

  const auction = await prisma.auction.findUnique({
    where: {
      id: params.id,
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
        <div id="certificate" className="certificate-container">
          {/* Decorative border */}
          <div className="absolute inset-0 border-[8px] sm:border-[12px] border-double border-gray-200 pointer-events-none"></div>

          <div className="certificate-content">
            {/* Header with decorative elements */}
            <div className="flex justify-center mb-4">
              <div className="h-0.5 bg-gradient-to-r from-transparent via-gray-400 to-transparent w-1/3"></div>
            </div>

            <div className="text-center mb-4 sm:mb-6">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 mb-2">
                Certificate of Auction
              </h1>
              <p className="text-sm sm:text-base text-gray-600 font-semibold">E-Auction Platform</p>
              <div className="mt-2 sm:mt-3 flex justify-center">
                <div className="h-0.5 bg-gradient-to-r from-transparent via-gray-400 to-transparent w-1/4"></div>
              </div>
            </div>

            {/* Logo Section */}
            <div className="absolute top-4 right-4 w-16 sm:w-20 md:w-24">
              <Image
                src="/e-aucitonLogo.png"
                alt="E-Auction Logo"
                width={100}
                height={100}
                style={{ objectFit: "contain" }}
              />
            </div>

            {/* Main content */}
            <div className="mb-4 sm:mb-6 text-center">
              <p className="text-sm sm:text-base">
                This certifies that the following auction was successfully
                completed:
              </p>
            </div>

            <div className="border-t border-b border-gray-200 py-4 sm:py-6 my-4">
              <div className="grid grid-cols-1 gap-4 sm:gap-6">
                <div>
                  <h2 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3 text-gray-700">
                    Auction Details
                  </h2>
                  <div className="space-y-2 text-gray-700 text-sm">
                    <p>
                      <span className="font-medium">Auction ID:</span>{" "}
                      <span className="font-mono text-xs break-all">{auction.id.slice(0, 12)}...</span>
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
                  <h2 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3 text-gray-700">
                    Participants
                  </h2>
                  <div className="space-y-2 text-gray-700 text-sm">
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

            {/* Decorative Element */}
            <div className="my-4 sm:my-6 flex justify-center">
              <div className="h-0.5 bg-gradient-to-r from-transparent via-gray-300 to-transparent w-2/3"></div>
            </div>

            {/* Footer */}
            <div className="text-center">
              <p className="text-gray-600 mb-4 text-xs sm:text-sm">
                This certificate verifies that the auction was conducted and
                completed according to the terms and conditions of the E-Auction
                platform.
              </p>

              {/* Signatures */}
              <div className="flex justify-between items-center mt-4 sm:mt-6">
                <div className="text-center">
                  <div className="border-b border-gray-400 w-24 sm:w-32 mx-auto"></div>
                  <p className="mt-1 text-gray-700 text-xs">Platform Administrator</p>
                </div>
                <div className="text-center">
                  <div className="border-b border-gray-400 w-24 sm:w-32 mx-auto"></div>
                  <p className="mt-1 text-gray-700 text-xs">Digital Seal</p>
                </div>
              </div>

              {/* Certificate ID and Date */}
              <div className="mt-6 sm:mt-8 flex justify-between text-[10px] text-gray-500">
                <div>Certificate ID: {auction.id.slice(0, 8)}-CERT</div>
                <div>Issued on: {formatDate(new Date())}</div>
              </div>
            </div>

            {/* Watermark */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 -rotate-45 text-[3rem] sm:text-[5rem] opacity-[0.03] pointer-events-none z-0 whitespace-nowrap font-bold text-gray-800">
              E-Auction
            </div>
          </div>
        </div>

        {/* Download button outside the certificate */}
        <div className="text-center mt-6 px-2">
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
