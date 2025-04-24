"use client";

import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Check, Loader2 } from "lucide-react";

interface RedeemPointsFormProps {
  userId: string;
  userName: string;
  currentPoints: number;
  currentBalance: number;
  onSuccess?: (newPoints: number, newBalance: number) => void;
}

export default function RedeemPointsForm({
  userId,
  userName,
  currentPoints,
  currentBalance,
  onSuccess,
}: RedeemPointsFormProps) {
  const [points, setPoints] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [displayedPoints, setDisplayedPoints] = useState(currentPoints);
  const [displayedBalance, setDisplayedBalance] = useState(currentBalance);
  const { toast } = useToast();

  // Conversion rate: 10 points = $1
  const CONVERSION_RATE = 10;

  const handleRedeemPoints = async (e: React.FormEvent) => {
    e.preventDefault();

    if (points <= 0) {
      toast({
        title: "Invalid points",
        description: "Points must be greater than 0",
        variant: "destructive",
      });
      return;
    }

    if (points > currentPoints) {
      toast({
        title: "Insufficient points",
        description: "You don't have enough points to redeem",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setSuccess(false);

    try {
      const response = await fetch("/api/admin/users/redeem-points", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId, points }),
      });

      const data = await response.json();

      if (!response.ok)
        throw new Error(data.error || "Failed to redeem points");

      // Update displayed values
      setDisplayedPoints(data.newPoints);
      setDisplayedBalance(data.newBalance);

      // Show success state
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);

      const amountAdded = points / CONVERSION_RATE;

      // Toast notification
      toast({
        title: "Points redeemed successfully",
        description: `Converted ${points} points to ر.س${amountAdded.toFixed(2)}`,
        variant: "default", // Ensure correct variant
      });

      setPoints(0);

      // Ensure this callback is being called with the correct data
      if (onSuccess) {
        onSuccess(data.newPoints, data.newBalance);
      }
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to redeem points",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const pointsValue = points / CONVERSION_RATE;

  return (
    <div className="bg-white p-6 shadow-md rounded-lg border border-gray-200">
      <h3 className="text-xl font-semibold mb-4 text-gray-800">
        Redeem Points
      </h3>

      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-gray-600">Seller:</span>
          <span className="font-semibold text-gray-900">{userName}</span>
        </div>

        <div className="flex items-center justify-between mb-2">
          <span className="text-gray-600">Available Points:</span>
          <div className="flex items-center">
            <span
              className={`font-semibold text-xl ${
                success ? "text-green-600" : "text-gray-900"
              }`}
            >
              {displayedPoints}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-gray-600">Current Balance:</span>
          <div className="flex items-center">
            <span
              className={`font-semibold text-xl ${
                success ? "text-green-600" : "text-gray-900"
              }`}
            >
              ر.س{displayedBalance.toFixed(2)}
            </span>
            {success && (
              <Check size={16} className="text-green-500 ml-2 animate-pulse" />
            )}
          </div>
        </div>
      </div>

      <form onSubmit={handleRedeemPoints} className="space-y-4">
        <div className="space-y-2">
          <label
            htmlFor="points"
            className="block text-sm font-medium text-gray-700"
          >
            Points to Redeem
          </label>
          <input
            type="number"
            id="points"
            value={points}
            onChange={(e) => setPoints(Number(e.target.value))}
            className="mt-1 block w-full pl-3 pr-3 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            min="0"
            max={currentPoints}
            step="10"
            required
            placeholder="0"
          />
        </div>

        {points > 0 && (
          <div className="bg-gray-50 p-3 rounded-md">
            <div className="flex items-center justify-between text-sm">
              <span>Conversion value:</span>
              <span className="font-medium text-green-600">
                ر.س{pointsValue.toFixed(2)}
              </span>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Conversion rate: 10 points = ر.س1
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={loading || points <= 0 || points > currentPoints}
          className={`w-full py-3 px-4 border border-transparent rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all ${
            loading || points <= 0 || points > currentPoints
              ? "opacity-75 cursor-not-allowed"
              : ""
          }`}
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <Loader2 size={18} className="animate-spin mr-2" />
              Processing...
            </span>
          ) : (
            "Redeem Points"
          )}
        </button>
      </form>
    </div>
  );
}
