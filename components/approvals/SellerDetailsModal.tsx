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
      console.log('SellerDetailsModal - Received seller data:', {
        id: seller.id,
        name: seller.name,
        email: seller.email,
        profile: seller.profile
      });
    }
  }, [isOpen, seller]);

  const handleApprove = () => {
    console.log('SellerDetailsModal - Approving seller:', seller.id);
    onApprove(seller.id);
    onClose();
  };

  const handleReject = () => {
    console.log('SellerDetailsModal - Rejecting seller:', seller.id);
    onReject(seller.id);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Seller Registration Details</DialogTitle>
        </DialogHeader>
        <div className="mt-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold">Personal Information</h3>
              <div className="mt-2 space-y-2">
                <div className="flex gap-2">
                  <span className="font-medium">Name:</span>
                  <span>{seller.name}</span>
                </div>
                <div className="flex gap-2">
                  <span className="font-medium">Email:</span>
                  <span>{seller.email}</span>
                </div>
                {seller.profile && (
                  <>
                    <div className="flex gap-2">
                      <span className="font-medium">Phone:</span>
                      <span>{seller.profile.phone || "N/A"}</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="font-medium">DOB:</span>
                      <span>
                        {seller.profile.dob
                          ? formatDate(seller.profile.dob)
                          : "N/A"}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {seller.profile && (
              <div>
                <h3 className="font-semibold">Business Information</h3>
                <div className="mt-2 space-y-2">
                  <div className="flex gap-2">
                    <span className="font-medium">Company:</span>
                    <span>{seller.profile.company || "N/A"}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="font-medium">Company Reg No:</span>
                    <span>{seller.profile.companyRegNo || "N/A"}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="font-medium">Tax ID:</span>
                    <span>{seller.profile.taxId || "N/A"}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="font-medium">PAN No:</span>
                    <span>{seller.profile.panNo || "N/A"}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="font-medium">Nature of Business:</span>
                    <span>{seller.profile.natureOfBusiness || "N/A"}</span>
                  </div>
                  {seller.profile.establishedAt && (
                    <div className="flex gap-2">
                      <span className="font-medium">Established:</span>
                      <span>{formatDate(seller.profile.establishedAt)}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {seller.profile && (
              <div className="col-span-2">
                <h3 className="font-semibold">Contact Information</h3>
                <div className="mt-2 space-y-2">
                  <div className="flex gap-2">
                    <span className="font-medium">Address:</span>
                    <span>{seller.profile.address || "N/A"}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="font-medium">City:</span>
                    <span>{seller.profile.city || "N/A"}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="font-medium">State:</span>
                    <span>{seller.profile.state || "N/A"}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="font-medium">Country:</span>
                    <span>{seller.profile.country || "N/A"}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="font-medium">Pincode:</span>
                    <span>{seller.profile.pincode || "N/A"}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button onClick={handleApprove} className="bg-green-500 hover:bg-green-600">
              Approve Seller
            </Button>
            <Button onClick={handleReject} variant="destructive">
              Reject Seller
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
