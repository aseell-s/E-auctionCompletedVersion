"use client";

import { useState, useEffect } from "react";
import { MdClose } from "react-icons/md";
import Chat from "@/components/Chat";
import { Button } from "@/components/ui/button";
import { AuctionDetail } from "./AuctionDetail";
import { Session } from "next-auth";
import Link from "next/link";
import { AuctionStatus } from "@prisma/client";

interface AuctionDetailClientProps {
  auction: any; // Use a proper type definition matching your auction data
  session: Session | null;
}

export default function AuctionDetailClient({
  auction,
  session,
}: AuctionDetailClientProps) {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState<number>(
    typeof window !== "undefined" ? window.innerWidth : 0
  );

  // Track window size for responsive design
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Check if the current user is not the seller
  const isNotSeller = session?.user?.id === auction.sellerId;
  const isUserWinner = session?.user?.email === auction.winner?.email;
  const isAuctionEnded = auction.status === AuctionStatus.ENDED;
  const isSeller = session?.user?.id === auction.sellerId;

  // Show certificate button if the auction has ended and user is either the seller or the winner
  const showCertificateButton = isAuctionEnded && (isSeller || isUserWinner);
  const showChatButton = isSeller || isUserWinner;

  // Determine if we're on mobile
  const isMobile = windowWidth < 640;

  return (
    <div className="container mx-auto py-4 sm:py-8 px-2 sm:px-4">
      <AuctionDetail auction={auction} session={session} />

      <div className="mt-4 sm:mt-6 flex flex-wrap gap-2 sm:gap-4">
        {/* Chat button */}
        {showChatButton && (
          <Button
            variant="secondary"
            size={isMobile ? "default" : "lg"}
            onClick={() => setIsChatOpen(true)}
            className="flex-1 sm:flex-none"
          >
            {isSeller ? "Chat with Winner" : "Chat with Seller"}
          </Button>
        )}

        {/* Certificate button */}
        {showCertificateButton && (
          <Link href={`/auctions/${auction.id}/certificate`} className="flex-1 sm:flex-none">
            <Button variant="outline" size={isMobile ? "default" : "lg"} className="w-full">
              View Certificate
            </Button>
          </Link>
        )}
      </div>

      {isChatOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 sm:bg-transparent sm:items-end sm:justify-end sm:inset-auto sm:bottom-4 sm:right-4"
          onClick={(e) => e.stopPropagation()}
        >
          <div 
            className={`
              bg-white rounded-lg shadow-xl flex flex-col
              w-[95%] h-[90vh] max-w-[450px] max-h-[600px]
              sm:max-w-[400px] sm:h-[500px]
            `}
          >
            <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 rounded-t-lg flex justify-between items-center p-3 text-white">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-indigo-600 font-bold mr-2">
                  {auction.seller.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-semibold truncate text-sm sm:text-base">{auction.seller.name}</h3>
                  <p className="text-xs text-indigo-100 truncate max-w-[200px]">{auction.title}</p>
                </div>
              </div>
              <button
                onClick={() => setIsChatOpen(false)}
                className="p-1.5 hover:bg-indigo-500 rounded-full transition-colors"
                title="Close Chat"
              >
                <MdClose size={windowWidth < 640 ? 18 : 20} />
              </button>
            </div>
            <div className="flex-grow overflow-hidden">
              <Chat
                seller={{
                  id: auction.seller.id,
                  name: auction.seller.name,
                }}
                auctionTitle={auction.title}
                auctionId={auction.id}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
