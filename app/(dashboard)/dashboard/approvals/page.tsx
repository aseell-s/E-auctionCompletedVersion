"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useApprovals } from "@/hooks/useApprovals";
import { Button } from "@/components/ui/button";
import { SellerDetailsModal } from "@/components/approvals/SellerDetailsModal";
import { AuctionDetailsModal } from "@/components/approvals/AuctionDetailsModal";
import { useState, useEffect } from "react";
import { User, Auction } from "@/types";
import { toast } from "sonner";

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
    return <div className="p-6">Loading...</div>;
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
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Approval Management</h2>
      <Tabs defaultValue="sellers" className="w-full">
        <TabsList>
          <TabsTrigger value="sellers">
            Pending Sellers ({data.pendingSellers.length})
          </TabsTrigger>
          <TabsTrigger value="auctions">
            Pending Auctions ({data.pendingAuctions.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sellers">
          {data.pendingSellers.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              No pending seller approvals
            </div>
          ) : (
            <div className="space-y-4">
              {data.pendingSellers.map((seller) => (
                <div
                  key={seller.id}
                  className="flex items-center justify-between p-4 bg-white rounded-lg shadow"
                >
                  <div>
                    <h3 className="font-medium">{seller.name}</h3>
                    <p className="text-sm text-gray-500">{seller.email}</p>
                  </div>
                  <div className="space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => openModal("seller", seller)}
                    >
                      View Details
                    </Button>
                    <Button
                      onClick={() => handleApprove("seller", seller.id)}
                      className="bg-green-500 hover:bg-green-600"
                    >
                      Approve
                    </Button>
                    <Button
                      onClick={() => handleReject("seller", seller.id)}
                      variant="destructive"
                    >
                      Reject
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="auctions">
          {data.pendingAuctions.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              No pending auction approvals
            </div>
          ) : (
            <div className="space-y-4">
              {data.pendingAuctions.map((auction) => (
                <div
                  key={auction.id}
                  className="flex items-center justify-between p-4 bg-white rounded-lg shadow"
                >
                  <div>
                    <h3 className="font-medium">{auction.title}</h3>
                    <p className="text-sm text-gray-500">
                      by {auction.seller.name}
                    </p>
                  </div>
                  <div className="space-x-2">
                    <Button
                      variant="ghost"
                      onClick={() => openModal("auction", auction)}
                    >
                      View Details
                    </Button>
                    <Button
                      onClick={() => handleApprove("auction", auction.id)}
                      className="bg-green-500 hover:bg-green-600"
                    >
                      Approve
                    </Button>
                    <Button
                      onClick={() => handleReject("auction", auction.id)}
                      variant="destructive"
                    >
                      Reject
                    </Button>
                  </div>
                </div>
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
