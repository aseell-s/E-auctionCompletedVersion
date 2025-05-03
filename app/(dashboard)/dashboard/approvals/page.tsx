"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useApprovals } from "@/hooks/useApprovals";
import { Button } from "@/components/ui/button";
import { SellerDetailsModal } from "@/components/approvals/SellerDetailsModal";
import { AuctionDetailsModal } from "@/components/approvals/AuctionDetailsModal";
import { useState, useEffect } from "react";
import { User, Auction } from "@/types";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Eye, CheckCircle, XCircle } from "lucide-react";

interface ApprovalsData {
  pendingSellers: User[];
  pendingAuctions: Auction[];
  totalUsers: number;
}

export default function ApprovalsPage() {
  const { data, loading, handleApproval } = useApprovals() as {
    data: ApprovalsData;
    loading: boolean;
    handleApproval: (
      type: "seller" | "auction",
      id: string,
      approve: boolean
    ) => void;
  };
  const [selectedItem, setSelectedItem] = useState<User | Auction | null>(null);
  const [modalType, setModalType] = useState<"seller" | "auction" | null>(null);

  useEffect(() => {
    if (data) {
      console.log("Approvals Page - All Data:", {
        pendingSellers: data.pendingSellers,
        pendingAuctions: data.pendingAuctions,
        totalUsers: data.totalUsers,
      });
    }
  }, [data]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-6 min-h-[300px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  const openModal = (type: "seller" | "auction", item: User | Auction) => {
    console.log(`Opening ${type} modal with data:`, item);
    setModalType(type);
    setSelectedItem(item);
  };

  const closeModal = () => {
    setModalType(null);
    setSelectedItem(null);
  };

  const handleApprove = (type: "seller" | "auction", id: string) => {
    console.log(`Approving ${type} with ID:`, id);
    handleApproval(type, id, true);
    toast.success(
      type === "seller"
        ? "Seller approved successfully!"
        : "Auction approved successfully!"
    );
  };

  const handleReject = (type: "seller" | "auction", id: string) => {
    console.log(`Rejecting ${type} with ID:`, id);
    handleApproval(type, id, false);
    toast.error(type === "seller" ? "Seller rejected." : "Auction rejected.");
  };

  return (
    <div className="p-3 sm:p-6">
      <h2 className="text-lg sm:text-xl font-semibold mb-4">Approval Management</h2>
      <Tabs defaultValue="sellers" className="w-full">
        <TabsList className="w-full sm:w-auto grid grid-cols-2 sm:inline-flex mb-4">
          <TabsTrigger value="sellers" className="text-xs sm:text-sm">
            Pending Sellers ({data.pendingSellers.length})
          </TabsTrigger>
          <TabsTrigger value="auctions" className="text-xs sm:text-sm">
            Pending Auctions ({data.pendingAuctions.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sellers">
          {data.pendingSellers.length === 0 ? (
            <Card className="text-center py-8 text-gray-500">
              No pending seller approvals
            </Card>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {data.pendingSellers.map((seller) => (
                <Card
                  key={seller.id}
                  className="p-3 sm:p-4 bg-white rounded-lg shadow"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h3 className="font-medium">{seller.name}</h3>
                      <p className="text-xs sm:text-sm text-gray-500">{seller.email}</p>
                    </div>
                    <div className="flex flex-wrap gap-2 justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openModal("seller", seller)}
                        className="text-xs sm:text-sm h-8 sm:h-9 px-2 sm:px-3 flex items-center gap-1"
                      >
                        <Eye size={14} className="hidden sm:inline" />
                        View Details
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleApprove("seller", seller.id)}
                        className="bg-green-500 hover:bg-green-600 text-xs sm:text-sm h-8 sm:h-9 px-2 sm:px-3 flex items-center gap-1"
                      >
                        <CheckCircle size={14} className="hidden sm:inline" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleReject("seller", seller.id)}
                        variant="destructive"
                        className="text-xs sm:text-sm h-8 sm:h-9 px-2 sm:px-3 flex items-center gap-1"
                      >
                        <XCircle size={14} className="hidden sm:inline" />
                        Reject
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="auctions">
          {data.pendingAuctions.length === 0 ? (
            <Card className="text-center py-8 text-gray-500">
              No pending auction approvals
            </Card>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {data.pendingAuctions.map((auction) => (
                <Card
                  key={auction.id}
                  className="p-3 sm:p-4 bg-white rounded-lg shadow"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h3 className="font-medium line-clamp-1">{auction.title}</h3>
                      <p className="text-xs sm:text-sm text-gray-500">
                        by {auction.seller.name}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2 justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openModal("auction", auction)}
                        className="text-xs sm:text-sm h-8 sm:h-9 px-2 sm:px-3 flex items-center gap-1"
                      >
                        <Eye size={14} className="hidden sm:inline" />
                        View Details
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleApprove("auction", auction.id)}
                        className="bg-green-500 hover:bg-green-600 text-xs sm:text-sm h-8 sm:h-9 px-2 sm:px-3 flex items-center gap-1"
                      >
                        <CheckCircle size={14} className="hidden sm:inline" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleReject("auction", auction.id)}
                        variant="destructive"
                        className="text-xs sm:text-sm h-8 sm:h-9 px-2 sm:px-3 flex items-center gap-1"
                      >
                        <XCircle size={14} className="hidden sm:inline" />
                        Reject
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {selectedItem && modalType === "seller" && (
        <SellerDetailsModal
          isOpen={true}
          onClose={closeModal}
          seller={selectedItem as User}
          onApprove={(id) => handleApprove("seller", id)}
          onReject={(id) => handleReject("seller", id)}
        />
      )}

      {modalType === "auction" && selectedItem && (
        <AuctionDetailsModal
          isOpen={true}
          onClose={closeModal}
          auction={selectedItem as Auction}
          onApprove={(id) => handleApprove("auction", id)}
          onReject={(id) => handleReject("auction", id)}
        />
      )}
    </div>
  );
}
