// 1. Imports necessary dependencies, including React hooks, UI components, and forms for adding funds and redeeming points.
// 2. Defines the User interface to represent user data, including:
//    - id, name, email, role, approval status, balance, points, and profile details (phone, address, etc.).
// 3. Accepts a user object as a prop through the UserProfileClientProps interface.
// 4. Manages state for:
//    - currentBalance: Tracks the user's current monetary balance.
//    - points: Tracks the user's current points.
// 5. Displays a debug toast notification when the component mounts (for testing purposes).
// 6. Provides handlers for:
//    - handleSuccessfulFundsAdd: Updates the balance and shows a success toast when funds are added.
//    - handleSuccessfulPointsRedeem: Updates points and balance, and shows a success toast when points are redeemed.
// 7. Renders the user profile UI:
//    - Displays the user's name, role, email, account status, balance, points, and creation date.
//    - Shows additional profile details (phone and address) if available.
// 8. Uses tabs to organize content:
//    - "User Details" tab: Displays user information.
//    - "Activity" tab: Placeholder for user activity logs.
// 9. Conditionally renders forms based on the user's role:
//    - If the user is a "BUYER", displays the AddFundsForm to add funds.
//    - If the user is a "SELLER", displays the RedeemPointsForm to redeem points.
// 10. Uses Tailwind CSS for styling the layout and components.
"use client";

import { useEffect, useState } from "react";
import AddFundsForm from "@/components/admin/AddFundsForm";
import RedeemPointsForm from "@/components/admin/RedeemPointsForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "../ui/button";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  isApproved: boolean;
  amount: number;
  points: number;
  createdAt: Date;
  profile?: {
    phone?: string | null;
    address?: string | null;
    // Add other profile fields as needed
  } | null;
}

interface UserProfileClientProps {
  user: User;
}

export default function UserProfileClient({ user }: UserProfileClientProps) {
  const [currentBalance, setCurrentBalance] = useState(user.amount);
  const [points, setPoints] = useState(user.points);
  const { toast } = useToast();

  // Debug toast functionality
  useEffect(() => {
    // Test toast on component mount
    toast({
      title: "Debug toast",
      description: "Testing toast visibility",
      variant: "default",
    });
  }, [toast]);

  const handleSuccessfulFundsAdd = (newBalance: number) => {
    setCurrentBalance(newBalance);

    // Fixed toast to use correct variant
    toast({
      title: "Funds added successfully",
      description: `New balance: $${newBalance.toFixed(2)}`,
      variant: "default", // Changed from "success" to "default"
    });
  };

  const handleSuccessfulPointsRedeem = (
    newPoints: number,
    newBalance: number
  ) => {
    setPoints(newPoints);
    setCurrentBalance(newBalance);

    // Fixed toast to use correct variant
    toast({
      title: "Points redeemed successfully",
      description: `New points: ${newPoints}, New balance: $${newBalance.toFixed(
        2
      )}`,
      variant: "default", // Changed from "success" to "default"
    });
  };

  return (
    <>
      <div className="flex flex-col md:flex-row items-start justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          User Profile: {user.name}
        </h1>
        <div className="mt-2 md:mt-0 bg-white px-4 py-2 rounded-full shadow-sm border border-gray-200">
          <span className="text-sm font-medium text-gray-500">Role: </span>
          <span className="text-indigo-700 font-semibold">{user.role}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <div className="bg-white shadow rounded-lg border border-gray-200">
            <Tabs defaultValue="details" className="w-full">
              <div className="px-6 pt-6 border-b border-gray-200">
                <TabsList className="mb-0">
                  <TabsTrigger value="details">User Details</TabsTrigger>
                  <TabsTrigger value="activity">Activity</TabsTrigger>
                </TabsList>
              </div>

              <div className="p-6">
                <TabsContent value="details" className="mt-0">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="bg-gray-50 p-4 rounded-md">
                      <p className="text-sm font-medium text-gray-500 mb-1">
                        Email
                      </p>
                      <p className="text-gray-900">{user.email}</p>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-md">
                      <p className="text-sm font-medium text-gray-500 mb-1">
                        Account Status
                      </p>
                      <div className="flex items-center">
                        <span
                          className={`inline-block w-2 h-2 rounded-full mr-2 ${
                            user.isApproved ? "bg-green-500" : "bg-yellow-500"
                          }`}
                        ></span>
                        <span>
                          {user.isApproved ? "Approved" : "Pending Approval"}
                        </span>
                      </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-md">
                      <p className="text-sm font-medium text-gray-500 mb-1">
                        Balance
                      </p>
                      <p className="text-xl font-semibold text-gray-900">
                        ${currentBalance.toFixed(2)}
                      </p>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-md">
                      <p className="text-sm font-medium text-gray-500 mb-1">
                        Points
                      </p>
                      <p className="text-xl font-semibold text-gray-900">
                        {points}
                      </p>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-md">
                      <p className="text-sm font-medium text-gray-500 mb-1">
                        Created
                      </p>
                      <p className="text-gray-900">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </p>
                    </div>

                    {user.profile && (
                      <>
                        {user.profile.phone && (
                          <div className="bg-gray-50 p-4 rounded-md">
                            <p className="text-sm font-medium text-gray-500 mb-1">
                              Phone
                            </p>
                            <p className="text-gray-900">
                              {user.profile.phone}
                            </p>
                          </div>
                        )}

                        {user.profile.address && (
                          <div className="bg-gray-50 p-4 rounded-md col-span-2">
                            <p className="text-sm font-medium text-gray-500 mb-1">
                              Address
                            </p>
                            <p className="text-gray-900">
                              {user.profile.address}
                            </p>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="activity" className="mt-0">
                  <div className="bg-gray-50 p-4 rounded-md text-center">
                    <p className="text-gray-500">
                      User activity logs will be displayed here.
                    </p>
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </div>
        {user.role === "BUYER" ? (
          <div>
            <AddFundsForm
              userId={user.id}
              userName={user.name}
              currentBalance={currentBalance}
              onSuccess={handleSuccessfulFundsAdd}
            />
          </div>
        ) : user.role === "SELLER" ? (
          <div>
            <RedeemPointsForm
              userId={user.id}
              userName={user.name}
              currentPoints={points}
              currentBalance={currentBalance}
              onSuccess={handleSuccessfulPointsRedeem}
            />
          </div>
        ) : (
          <></>
        )}
      </div>
    </>
  );
}
