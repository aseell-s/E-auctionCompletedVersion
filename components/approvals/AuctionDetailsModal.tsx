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
import { Auction } from "@/types";
import { formatDate, formatCurrency } from "@/lib/utils";
import Image from "next/image";
import { CheckCircle, XCircle } from "lucide-react";

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
  const handleApprove = () => {
    onApprove(auction.id);
    onClose();
  };

  const handleReject = () => {
    onReject(auction.id);
    onClose();
  };

  const InfoItem = ({ label, value }: { label: string; value: string | number | null | undefined }) => (
    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 py-1.5 border-b border-gray-100">
      <span className="text-xs sm:text-sm font-medium text-gray-600 sm:w-1/3">{label}:</span>
      <span className="text-sm sm:text-base text-gray-900">{value !== null && value !== undefined ? value : "N/A"}</span>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">Auction Details</DialogTitle>
        </DialogHeader>
        
        <div className="mt-2 sm:mt-4 space-y-4">
          {/* Image Gallery */}
          {auction.images && auction.images.length > 0 && (
            <div className="bg-gray-50 p-2 rounded-lg">
              <h3 className="font-semibold text-gray-800 text-sm sm:text-base mb-2">Images</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {auction.images.map((image, index) => (
                  <div key={index} className="relative aspect-square rounded-md overflow-hidden">
                    <Image
                      src={image}
                      alt={`Auction image ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Auction Details */}
          <div className="bg-indigo-50 p-3 rounded-lg">
            <h3 className="font-semibold text-indigo-800 text-sm sm:text-base mb-2">Auction Information</h3>
            <div className="space-y-1">
              <InfoItem label="Title" value={auction.title} />
              <InfoItem label="Item Type" value={auction.itemType} />
              <InfoItem label="Start Price" value={formatCurrency(auction.startPrice)} />
              <InfoItem label="Current Price" value={formatCurrency(auction.currentPrice)} />
              <InfoItem label="End Date" value={formatDate(auction.endTime)} />
            </div>
          </div>
          
          {/* Seller Information */}
          <div className="bg-green-50 p-3 rounded-lg">
            <h3 className="font-semibold text-green-800 text-sm sm:text-base mb-2">Seller Information</h3>
            <div className="space-y-1">
              <InfoItem label="Seller Name" value={auction.seller?.name} />
              <InfoItem label="Seller Email" value={auction.seller?.email} />
            </div>
          </div>
          
          {/* Description */}
          <div className="bg-amber-50 p-3 rounded-lg">
            <h3 className="font-semibold text-amber-800 text-sm sm:text-base mb-2">Description</h3>
            <p className="text-sm sm:text-base whitespace-pre-wrap">{auction.description}</p>
          </div>
          
          <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-2 pt-4">
            <Button
              onClick={handleApprove}
              className="bg-green-500 hover:bg-green-600 flex items-center gap-2"
            >
              <CheckCircle size={16} />
              Approve Auction
            </Button>
            <Button 
              onClick={handleReject} 
              variant="destructive"
              className="flex items-center gap-2"
            >
              <XCircle size={16} />
              Reject Auction
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
