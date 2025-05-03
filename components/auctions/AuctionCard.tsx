"use client";

import { formatDistanceToNow } from "date-fns";
import Image from "next/image";
import { useState, useEffect } from "react";
import { MdClose } from "react-icons/md";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Chat from "../Chat";
import { useAuthStore } from "@/store/authStore";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { AuctionStatus } from "@prisma/client";

interface AuctionCardProps {
  auction: {
    id: string;
    title: string;
    description: string;
    currentPrice: number;
    images: string[];
    status: string;
    endTime: Date;
    _count: {
      bids: number;
    };
    seller: {
      id: string;
      name: string;
    };
    winner?: {
      id: string;
      name: string;
      email: string;
    } | null;
  };
}

export function AuctionCard({ auction }: AuctionCardProps) {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState<number>(
    typeof window !== "undefined" ? window.innerWidth : 0
  );
  const { data: session } = useSession();
  const router = useRouter();
  const { user } = useAuthStore();
  const userRole = user?.role;

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleViewDetails = (e: React.MouseEvent) => {
    e.preventDefault();
    router.push(`/auctions/${auction.id}`);
  };

  const isAuctionEnded = auction.status == AuctionStatus.ENDED;
  const isUserNotSeller = userRole !== "SELLER";
  const isUserWinner = session?.user?.email === auction.winner?.email;
  const isUserSeller = userRole === "SELLER";

  const handleChatClick = (e: { stopPropagation: () => void }) => {
    e.stopPropagation();
    if (!isAuctionEnded) {
      toast.error(
        "Auction is still active. You can chat with the seller only after the auction has ended."
      );
      return;
    }
    setIsChatOpen(true);
  };

  return (
    <Card
      className="overflow-hidden cursor-pointer h-full flex flex-col"
      onClick={handleViewDetails}
    >
      <div className="relative h-36 sm:h-48 w-full">
        <Image
          src={auction.images[0] || "/placeholder-auction.jpeg"}
          alt={auction.title}
          fill
          className="object-cover"
        />
      </div>
      <CardHeader className="p-3 sm:p-4 md:p-6">
        <CardTitle className="text-base sm:text-lg md:text-xl line-clamp-1">{auction.title}</CardTitle>
        <CardDescription className="line-clamp-2 text-xs sm:text-sm">
          {auction.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-3 sm:p-4 md:p-6 pt-0 flex-grow">
        <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm">
          <p>
            <span className="font-medium">Current Price:</span> ﷼
            {auction.currentPrice}
          </p>
          <p>
            <span className="font-medium">Bids:</span> {auction._count.bids}
          </p>
          <p>
            <span className="font-medium">Status:</span>{" "}
            <span
              className={
                auction.status === "ACTIVE" ? "text-green-600" : "text-red-600"
              }
            >
              {auction.status}
            </span>
          </p>
          <p>
            <span className="font-medium">WINNER:</span>{" "}
            <span
              className={isAuctionEnded ? "text-red-600" : "text-green-600"}
            >
              {auction.status === "ACTIVE"
                ? "Yet to Be Announced"
                : auction.winner?.name || "No bids placed"}
            </span>
          </p>
          <p>
            <span className="font-medium">Ends:</span>{" "}
            {formatDistanceToNow(new Date(auction.endTime), {
              addSuffix: true,
            })}
          </p>
        </div>
      </CardContent>
      <CardFooter className="p-3 sm:p-4 md:p-6 pt-0 flex flex-col sm:flex-row gap-2">
        <Button
          variant="outline"
          className="w-full text-xs sm:text-sm"
          onClick={handleViewDetails}
        >
          View Details
        </Button>

        {isAuctionEnded && isUserNotSeller && isUserWinner ? (
          <Button
            variant="secondary"
            className="w-full text-xs sm:text-sm"
            onClick={handleChatClick}
          >
            Chat With Seller
          </Button>
        ) : isUserSeller && auction.winner ? (
          <Button
            variant="secondary"
            className="w-full text-xs sm:text-sm"
            onClick={handleChatClick}
          >
            Chat With Winner
          </Button>
        ) : null}
      </CardFooter>

      {isChatOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={(e) => e.stopPropagation()}
        >
          <div 
            className={`
              bg-white rounded-lg shadow-xl flex flex-col
              w-[95%] h-[90vh] max-w-[450px] max-h-[600px]
              sm:max-w-[400px] sm:h-[500px]
              md:max-w-[450px] md:h-[550px]
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
    </Card>
  );
}
