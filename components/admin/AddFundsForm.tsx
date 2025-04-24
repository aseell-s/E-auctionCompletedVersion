// 1. Imports React hooks, a toast notification system, and icons for UI feedback.
// 2. Defines props for the component:
//    - userId: User's ID.
//    - userName: User's name.
//    - currentBalance: User's current balance (default is 0).
//    - onSuccess: Callback for successful fund addition.
// 3. Manages state for:
//    - amount: Amount to add.
//    - loading: Tracks if the form is processing.
//    - success: Tracks if funds were added successfully.
//    - displayedBalance: Updates the user's balance in the UI.
// 4. handleAddFunds function:
//    - Validates the amount input.
//    - Sends a POST request to add funds.
//    - Updates the balance and shows success or error notifications.
//    - Resets the input field and calls the onSuccess callback if provided.
// 5. Renders the form:
//    - Displays the user's name and current balance.
//    - Input field for the amount to add.
//    - Submit button with loading and validation states.
//    - Success indicator and toast notifications.
// 6. Uses Tailwind CSS for styling.
"use client";

import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Check, Loader2 } from "lucide-react";

interface AddFundsFormProps {
  userId: string;
  userName: string;
  currentBalance?: number;
  onSuccess?: (newBalance: number) => void;
}

export default function AddFundsForm({
  userId,
  userName,
  currentBalance = 0,
  onSuccess,
}: AddFundsFormProps) {
  const [amount, setAmount] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [displayedBalance, setDisplayedBalance] = useState(currentBalance);
  const { toast } = useToast();

  const handleAddFunds = async (e: React.FormEvent) => {
    e.preventDefault();

    if (amount <= 0) {
      toast({
        title: "Invalid amount",
        description: "Amount must be greater than 0",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setSuccess(false);

    try {
      const response = await fetch("/api/admin/users/funds", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId, amount }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || "Failed to add funds");

      // Update displayed balance
      setDisplayedBalance(data.newBalance);

      // Show success state
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);

      // Toast notification with correct variant
      toast({
        title: "Funds added successfully",
        description: `Added ${amount.toFixed(2)} to ${userName}'s account`,
        variant: "default", // Changed to default
      });

      setAmount(0);

      // Ensure this callback is called properly
      if (onSuccess && data.newBalance) {
        onSuccess(data.newBalance);
      }
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to add funds",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 shadow-md rounded-lg border border-gray-200">
      <h3 className="text-xl font-semibold mb-4 text-gray-800">
        Add Funds to Account
      </h3>

      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-gray-600">User:</span>
          <span className="font-semibold text-gray-900">{userName}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-gray-600">Current Balance:</span>
          <div className="flex items-center">
            <span
              className={`font-semibold text-xl ${
                success ? "text-green-600" : "text-gray-900"
              }`}
            >
              ${displayedBalance.toFixed(2)}
            </span>
            {success && (
              <Check size={16} className="text-green-500 ml-2 animate-pulse" />
            )}
          </div>
        </div>
      </div>

      <form onSubmit={handleAddFunds} className="space-y-4">
        <div className="space-y-2">
          <label
            htmlFor="amount"
            className="block text-sm font-medium text-gray-700"
          >
            Amount to Add
          </label>
          <div className="relative rounded-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500 sm:text-sm">$</span>
            </div>
            <input
              type="number"
              id="amount"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="mt-1 block w-full pl-7 pr-3 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              min="0"
              step="any"
              required
              placeholder="0.00"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3 px-4 border border-transparent rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all ${
            loading ? "opacity-75 cursor-not-allowed" : ""
          }`}
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <Loader2 size={18} className="animate-spin mr-2" />
              Processing...
            </span>
          ) : (
            "Add Funds"
          )}
        </button>
      </form>
    </div>
  );
}
