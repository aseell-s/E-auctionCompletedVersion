"use client";

import { Role } from "@prisma/client";
import { useApprovals } from "@/hooks/useApprovals";
import { BuyerDashboard } from "./components/BuyerDashboard";
import { SellerDashboard } from "./components/SellerDashboard";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface DashboardClientProps {
  user: {
    id: string;
    email: string;
    name?: string | null;
    role: Role;
    isApproved: boolean;
  };
}

export function DashboardClient({ user }: DashboardClientProps) {
  const { data, loading } = useApprovals();
  const [processingAuctions, setProcessingAuctions] = useState(false);
  const [processingResults, setProcessingResults] = useState<any>(null);

  const handleProcessAuctions = async () => {
    try {
      setProcessingAuctions(true);
      setProcessingResults(null);

      const response = await fetch("/api/auctions/process-ended", {
        method: "POST",
      });

      const result = await response.json();
      setProcessingResults(result);

      if (response.ok) {
        if (result.processed === 0) {
          toast("No auctions to process");
        } else if (result.successfulAuctions === 0) {
          toast(`Processed ${result.processed} auctions`);
        } else {
          toast(`Processed ${result.processed} auctions`);
        }
      } else {
        throw new Error(result.message || "Failed to process auctions");
      }
    } catch (error) {
      console.error("Error processing auctions:", error);
      toast("Failed to process auctions");
    } finally {
      setProcessingAuctions(false);
    }
  };

  const renderRoleSpecificContent = () => {
    switch (user.role) {
      case Role.SUPER_ADMIN:
        return (
          <div className="w-full">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-semibold text-indigo-800">
                Admin Overview
              </h2>
              <Button
                variant="outline"
                onClick={handleProcessAuctions}
                disabled={processingAuctions}
                className="flex items-center gap-2"
              >
                <RefreshCw
                  size={16}
                  className={processingAuctions ? "animate-spin" : ""}
                />
                {processingAuctions
                  ? "Processing..."
                  : "Process Ended Auctions"}
              </Button>
            </div>
            <div
              className="grid grid-cols-1 md:grid-cols-3 gap-6 p-5 
                bg-white/10 backdrop-blur-lg shadow-lg rounded-xl border border-white/20"
            >
              <div className="p-6 bg-blue-100/60 rounded-lg text-center shadow-md border border-blue-300">
                <h3 className="font-medium text-gray-800">Pending Sellers</h3>
                <p className="text-3xl font-bold text-blue-700">
                  {loading ? "..." : data.pendingSellers.length}
                </p>
              </div>
              <div className="p-6 bg-green-100/60 rounded-lg text-center shadow-md border border-green-300">
                <h3 className="font-medium text-gray-800">Pending Auctions</h3>
                <p className="text-3xl font-bold text-green-700">
                  {loading ? "..." : data.pendingAuctions.length}
                </p>
              </div>
              <div className="p-6 bg-purple-100/60 rounded-lg text-center shadow-md border border-purple-300">
                <h3 className="font-medium text-gray-800">Total Users</h3>
                <p className="text-3xl font-bold text-purple-700">
                  {loading ? "..." : data.totalUsers}
                </p>
              </div>
            </div>
          </div>
        );
      case Role.SELLER:
        return (
          <div className="w-full">
            <SellerDashboard />
          </div>
        );
      case Role.BUYER:
        return (
          <div className="w-full">
            <BuyerDashboard />
          </div>
        );
      default:
        return <div className="text-red-600">Access Denied</div>;
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-gray-100 px-8 py-6 flex flex-col">
        <main className="">{renderRoleSpecificContent()}</main>
      </div>
    </>
  );
}
