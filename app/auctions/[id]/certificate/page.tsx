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
    <div className="container mx-auto py-8 px-4 flex flex-col items-center">
      <div className="max-w-3xl w-full">
        {/* Certificate Container - This will be captured for PDF */}
        <div id="certificate" className="certificate-container">
          {/* Decorative border */}
          <div className="absolute inset-0 border-[12px] border-double border-gray-200 pointer-events-none"></div>

          <div className="certificate-content">
            {/* Header with decorative elements */}
            <div className="flex justify-center mb-6">
              <div className="h-0.5 bg-gradient-to-r from-transparent via-gray-400 to-transparent w-1/3"></div>
            </div>

            <div className="text-center mb-8">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-3">
                Certificate of Auction
              </h1>
              <p className="text-gray-600 font-semibold">E-Auction Platform</p>
              <div className="mt-4 flex justify-center">
                <div className="h-0.5 bg-gradient-to-r from-transparent via-gray-400 to-transparent w-1/4"></div>
              </div>
            </div>

            {/* Logo Section */}
            <div className="absolute top-10 right-6 opacity-100 w-40 h-40 flex items-center justify-center">
              {/* Replacing Seal with Custom Logo */}
              <Image
                src="/e-aucitonLogo.png" // Path to the logo image in the public folder
                alt="E-Auction Logo"
                width={160} // Reduced width
                height={160} // Reduced height
                objectFit="contain" // Ensures the logo fits within the bounds
              />
            </div>

            {/* Main content with improved typography */}
            <div className="mb-8 text-center">
              <p className="text-lg">
                This certifies that the following auction was successfully
                completed:
              </p>
            </div>

            <div className="border-t border-b border-gray-200 py-8 my-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h2 className="text-xl font-semibold mb-4 text-gray-700">
                    Auction Details
                  </h2>
                  <div className="space-y-3 text-gray-700">
                    <p>
                      <span className="font-medium">Auction ID:</span>{" "}
                      <span className="font-mono">{auction.id}</span>
                    </p>
                    <p>
                      <span className="font-medium">Title:</span>{" "}
                      {auction.title}
                    </p>
                    <p>
                      <span className="font-medium">Final Price:</span>{" "}
                      <span className="font-semibold">
                        {/* Changed to Saudi Riyal (SAR) */}﷼
                        {finalPrice.toLocaleString("en-SA")}
                      </span>
                    </p>
                    <p>
                      <span className="font-medium">End Date:</span>{" "}
                      {formatDate(auction.endTime)}
                    </p>
                  </div>
                </div>
                <div>
                  <h2 className="text-xl font-semibold mb-4 text-gray-700">
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

            {/* Decorative Element */}
            <div className="my-8 flex justify-center">
              <div className="h-0.5 bg-gradient-to-r from-transparent via-gray-300 to-transparent w-2/3"></div>
            </div>

            {/* Footer */}
            <div className="text-center mt-auto">
              <p className="text-gray-600 mb-6">
                This certificate verifies that the auction was conducted and
                completed according to the terms and conditions of the E-Auction
                platform.
              </p>

              {/* Signatures */}
              <div className="flex justify-between items-center mt-8">
                <div className="text-center">
                  <div className="border-b border-gray-400 w-40 mx-auto"></div>
                  <p className="mt-2 text-gray-700">Platform Administrator</p>
                </div>
                <div className="text-center">
                  <div className="border-b border-gray-400 w-40 mx-auto"></div>
                  <p className="mt-2 text-gray-700">Digital Seal</p>
                </div>
              </div>

              {/* Certificate ID and Date */}
              <div className="mt-10 flex justify-between text-xs text-gray-500">
                <div>Certificate ID: {auction.id}-CERT</div>
                <div>Issued on: {formatDate(new Date())}</div>
              </div>
            </div>

            {/* Watermark */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 -rotate-45 text-[8rem] opacity-[0.03] pointer-events-none z-0 whitespace-nowrap font-bold text-gray-800">
              E-Auction Certificate
            </div>
          </div>
        </div>

        {/* Download button outside the certificate (won't be included in PDF) */}
        <div className="text-center mt-8">
          <CertificateDownloadButton
            auctionId={auction.id}
            auctionTitle={auction.title}
          />
        </div>
      </div>
    </div>
  );
}
