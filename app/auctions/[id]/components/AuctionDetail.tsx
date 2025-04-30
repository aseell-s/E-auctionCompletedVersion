"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { formatDistanceToNow } from "date-fns";
import { Session } from "next-auth";
import Image from "next/image";
import { useState } from "react";
import { toast } from "sonner";

interface AuctionDetailProps {
  auction: {
    id: string;
    title: string;
    description: string;
    currentPrice: number;
    images: string[];
    status: string;
    endTime: Date;
    sellerId: string;
    seller: {
      name: string;
      id: string;
    };
    bids: {
      id: string;
      amount: number;
      bidder: {
        name: string;
      };
    }[];
    _count: {
      bids: number;
    };
  };
  session:
    | (Session & {
        user: {
          id: string;
          amount?: number;
        };
      })
    | null;
}

export function AuctionDetail({ auction, session }: AuctionDetailProps) {
  const [bidAmount, setBidAmount] = useState(auction.currentPrice + 1);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPrice, setCurrentPrice] = useState(auction.currentPrice);
  const [bidCount, setBidCount] = useState(auction._count.bids);
  const [bids, setBids] = useState(auction.bids);

  const handleBid = async () => {
    if (!session) {
      toast.error("Please sign in to place a bid");
      return;
    }

    if (bidAmount <= auction.currentPrice) {
      toast.error("Bid amount must be higher than current price");
      return;
    }

    if (auction.status !== "ACTIVE") {
      toast.error("This auction is not active");
      return;
    }

    if (new Date(auction.endTime) < new Date()) {
      toast.error("This auction has ended");
      return;
    }

    if (session.user.id === auction.sellerId) {
      toast.error("You cannot bid on your own auction");
      return;
    }

    // Check if user has sufficient balance before sending request
    if (session.user.amount !== undefined && bidAmount > session.user.amount) {
      toast.error("Insufficient funds to place this bid");
      return;
    }

    setIsLoading(true);
    console.log("session", session);

    try {
      const response = await fetch("/api/bids", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          auctionId: auction.id,
          amount: bidAmount,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || "Failed to place bid");
      }

      toast.success("Bid placed successfully!");

      // Update state instead of reloading the page
      setCurrentPrice(bidAmount);
      setBidCount((prev) => prev + 1);
      setBids([
        ...bids,
        {
          id: Math.random().toString(36).slice(2), // Temporary ID for UI
          amount: bidAmount,
          bidder: { name: session.user.name || "You" },
        },
      ]);
      setBidAmount(bidAmount + 1);
    } catch (error: unknown) {
      console.error(error);
      toast.error(
        error instanceof Error ? error.message : "Failed to place bid"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid md:grid-cols-2 gap-8">
      <div className="space-y-4">
        <div className="relative aspect-square">
          <Image
            src={auction.images[0] || "/placeholder-auction.jpeg"}
            alt={auction.title}
            fill
            className="object-cover rounded-lg"
          />
        </div>
        {auction.images.length > 1 && (
          <div className="grid grid-cols-4 gap-2">
            {auction.images.slice(1).map((image, index) => (
              <div key={index} className="relative aspect-square">
                <Image
                  src={image}
                  alt={`${auction.title} - Image ${index + 2}`}
                  fill
                  className="object-cover rounded-lg"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">{auction.title}</h1>
          <p className="text-muted-foreground">
            Listed by {auction.seller.name}
          </p>
        </div>

        <p className="text-lg">{auction.description}</p>

        <Card className="p-6">
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Current Price</p>
              <p className="text-2xl font-bold"> SAR{auction.currentPrice}</p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Time Remaining</p>
              <p className="text-lg">
                {formatDistanceToNow(new Date(auction.endTime), {
                  addSuffix: true,
                })}
              </p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Total Bids</p>
              <p className="text-lg">{bidCount}</p>
            </div>

            {auction.status === "ACTIVE" &&
              new Date(auction.endTime) > new Date() &&
              session?.user.id !== auction.sellerId && (
                <div className="space-y-2">
                  {/* Display user's balance */}
                  {session?.user.amount !== undefined && (
                    <div className="flex items-center justify-between mb-2 text-sm">
                      <span className="text-muted-foreground">
                        Your balance:
                      </span>
                      <span className="font-medium text-indigo-600">
                        SAR{session.user.amount.toFixed(2)}
                      </span>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Input
                      type="number"
                      value={bidAmount}
                      onChange={(e) => setBidAmount(Number(e.target.value))}
                      min={currentPrice + 1}
                      step="1"
                    />
                    <Button onClick={handleBid} disabled={isLoading}>
                      Place Bid
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Minimum bid: SAR{auction.currentPrice + 1}
                  </p>
                </div>
              )}

            {/* Optionally, show the latest bids */}
            {/* {bids.length > 0 && (
              <div className="mt-4">
                <p className="text-sm text-muted-foreground mb-1">
                  Recent Bids:
                </p>
                <ul className="text-sm">
                  {bids
                    .slice(-5)
                    .reverse()
                    .map((bid) => (
                      <li key={bid.id}>
                        ₹{bid.amount} by {bid.bidder.name}
                      </li>
                    ))}
                </ul>
              </div>
            )} */}
          </div>
        </Card>
      </div>
    </div>
  );
}
