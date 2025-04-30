// 1. Displays a modal dialog to show detailed information about an auction.
// 2. Accepts props:
//    - isOpen: Controls whether the modal is visible.
//    - onClose: Function to close the modal.
//    - auction: The auction object containing details like title, description, prices, seller info, etc.
//    - onApprove: Function to handle auction approval.
//    - onReject: Function to handle auction rejection.
// 3. Logs auction details to the console when the modal is opened.
// 4. Provides handlers for:
//    - Approving the auction (calls onApprove and closes the modal).
//    - Rejecting the auction (calls onReject and closes the modal).
// 5. Displays auction details, including:
//    - Title, description, start price, current price, creation date, end time, and status.
//    - Seller information (name, email, company, phone, location).
//    - Auction images in a grid layout.
//    - List of bids with bidder name, bid amount, and bid date.
//    - Comments with commenter name, text, and date.
// 6. Includes action buttons for:
//    - Canceling (closes the modal).
//    - Rejecting the auction.
//    - Approving the auction.
// 7. Uses Tailwind CSS for styling the modal and its content.
"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import Image from "next/image";
import { useEffect } from "react";
import { Auction } from "@/types";

interface AuctionDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  auction: Auction;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

export function AuctionDetailsModal({
  isOpen,
  onClose,
  auction,
  onApprove,
  onReject,
}: AuctionDetailsModalProps) {
  useEffect(() => {
    if (isOpen && auction) {
      console.log("AuctionDetailsModal - Received auction data:", {
        id: auction.id,
        title: auction.title,
        description: auction.description,
        startPrice: auction.startPrice,
        currentPrice: auction.currentPrice,
        status: auction.status,
        seller: auction.seller,
        images: auction.images,
        bids: auction.bids,
      });
    }
  }, [isOpen, auction]);

  const handleApprove = () => {
    console.log("AuctionDetailsModal - Approving auction:", auction.id);
    onApprove(auction.id);
    onClose();
  };

  const handleReject = () => {
    console.log("AuctionDetailsModal - Rejecting auction:", auction.id);
    onReject(auction.id);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Auction Details</DialogTitle>
        </DialogHeader>

        <div className="mt-4 space-y-6">
          <div>
            <h3 className="font-semibold text-lg">{auction.title}</h3>
            <p className="text-gray-600 mt-1">{auction.description}</p>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold">Auction Information</h3>
              <div className="mt-2 space-y-2">
                <p>
                  <span className="text-gray-600">Start Price:</span> ﷼
                  {auction.startPrice.toFixed(2)}
                </p>
                <p>
                  <span className="text-gray-600">Current Price:</span> ﷼
                  {auction.currentPrice.toFixed(2)}
                </p>
                <p>
                  <span className="text-gray-600">Created:</span>{" "}
                  {formatDate(auction.createdAt)}
                </p>
                <p>
                  <span className="text-gray-600">End Time:</span>{" "}
                  {formatDate(auction.endTime)}
                </p>
                <p>
                  <span className="text-gray-600">Status:</span>{" "}
                  {auction.status}
                </p>
              </div>
            </div>

            <div>
              <h3 className="font-semibold">Seller Information</h3>
              <div className="mt-2 space-y-2">
                <p>
                  <span className="text-gray-600">Name:</span>{" "}
                  {auction.seller.name}
                </p>
                <p>
                  <span className="text-gray-600">Email:</span>{" "}
                  {auction.seller.email}
                </p>
                {auction.seller.profile && (
                  <>
                    <p>
                      <span className="text-gray-600">Company:</span>{" "}
                      {auction.seller.profile.company || "N/A"}
                    </p>
                    <p>
                      <span className="text-gray-600">Phone:</span>{" "}
                      {auction.seller.profile.phone || "N/A"}
                    </p>
                    <p>
                      <span className="text-gray-600">Location:</span>{" "}
                      {auction.seller.profile.city &&
                      auction.seller.profile.state
                        ? `${auction.seller.profile.city}, ${auction.seller.profile.state}`
                        : "N/A"}
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>

          {auction.images && auction.images.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">Images</h3>
              <div className="grid grid-cols-3 gap-4">
                {auction.images.map((image, index) => (
                  <Image
                    key={index}
                    src={image}
                    alt={`Auction image ${index + 1}`}
                    className="w-full h-32 object-cover rounded-md"
                    width={300}
                    height={200}
                  />
                ))}
              </div>
            </div>
          )}

          {auction.bids && auction.bids.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">Bids</h3>
              <div className="space-y-2">
                {auction.bids.map((bid) => (
                  <div
                    key={bid.id}
                    className="flex justify-between items-center p-2 bg-gray-50 rounded"
                  >
                    <span>
                      {bid.bidder.name} bid ﷼{bid.amount.toFixed(2)}
                    </span>
                    <span className="text-sm text-gray-500">
                      {formatDate(bid.createdAt)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-4 pt-4">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleReject}>
              Reject
            </Button>
            <Button onClick={handleApprove}>Approve</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
