"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import { User } from "@/types";
import { formatDate } from "@/lib/utils";
import { CheckCircle, XCircle } from "lucide-react";

interface SellerDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  seller: User;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

export function SellerDetailsModal({
  isOpen,
  onClose,
  seller,
  onApprove,
  onReject,
}: SellerDetailsModalProps) {
  useEffect(() => {
    if (isOpen && seller) {
      console.log("SellerDetailsModal - Received seller data:", {
        id: seller.id,
        name: seller.name,
        email: seller.email,
        profile: seller.profile,
      });
    }
  }, [isOpen, seller]);

  const handleApprove = () => {
    console.log("SellerDetailsModal - Approving seller:", seller.id);
    onApprove(seller.id);
    onClose();
  };

  const handleReject = () => {
    console.log("SellerDetailsModal - Rejecting seller:", seller.id);
    onReject(seller.id);
    onClose();
  };

  const InfoItem = ({ label, value }: { label: string; value: string | null | undefined }) => (
    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 py-1.5 border-b border-gray-100">
      <span className="text-xs sm:text-sm font-medium text-gray-600 sm:w-1/3">{label}:</span>
      <span className="text-sm sm:text-base text-gray-900">{value || "N/A"}</span>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">Seller Registration Details</DialogTitle>
        </DialogHeader>
        <div className="mt-2 sm:mt-4 space-y-4">
          <div className="bg-indigo-50 p-3 rounded-lg">
            <h3 className="font-semibold text-indigo-800 text-sm sm:text-base mb-2">Personal Information</h3>
            <div className="space-y-1">
              <InfoItem label="Name" value={seller.name} />
              <InfoItem label="Email" value={seller.email} />
              {seller.profile && (
                <>
                  <InfoItem label="Phone" value={seller.profile.phone} />
                  <InfoItem 
                    label="Date of Birth" 
                    value={seller.profile.dob ? formatDate(seller.profile.dob) : null} 
                  />
                </>
              )}
            </div>
          </div>

          {seller.profile && (
            <div className="bg-green-50 p-3 rounded-lg">
              <h3 className="font-semibold text-green-800 text-sm sm:text-base mb-2">Business Information</h3>
              <div className="space-y-1">
                <InfoItem label="Company" value={seller.profile.company} />
                <InfoItem label="Registration No" value={seller.profile.companyRegNo} />
                <InfoItem label="Nature of Business" value={seller.profile.natureOfBusiness} />
                <InfoItem 
                  label="Established" 
                  value={seller.profile.establishedAt ? formatDate(seller.profile.establishedAt) : null} 
                />
              </div>
            </div>
          )}

          {seller.profile && (
            <div className="bg-amber-50 p-3 rounded-lg">
              <h3 className="font-semibold text-amber-800 text-sm sm:text-base mb-2">Contact Information</h3>
              <div className="space-y-1">
                <InfoItem label="Address" value={seller.profile.address} />
                <InfoItem label="City" value={seller.profile.city} />
                <InfoItem label="State" value={seller.profile.state} />
                <InfoItem label="Country" value={seller.profile.country} />
                <InfoItem label="Postal Code" value={seller.profile.pincode} />
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-2 pt-4">
            <Button
              onClick={handleApprove}
              className="bg-green-500 hover:bg-green-600 flex items-center gap-2"
            >
              <CheckCircle size={16} />
              Approve Seller
            </Button>
            <Button 
              onClick={handleReject} 
              variant="destructive"
              className="flex items-center gap-2"
            >
              <XCircle size={16} />
              Reject Seller
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
