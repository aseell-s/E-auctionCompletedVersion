"use client";

import { useState, useEffect } from "react";
import { Role } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  FiDollarSign,
  FiAward,
  FiUser,
  FiMail,
  FiPhone,
  FiMapPin,
  FiLock,
} from "react-icons/fi";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "sonner";

const passwordSchema = z
  .object({
    currentPassword: z
      .string()
      .min(1, { message: "Current password is required" }),
    newPassword: z
      .string()
      .min(8, { message: "Password must be at least 8 characters" })
      // lookahead for at least one digit and one special character
      .regex(
        /^(?=.*[0-9])(?=.*[!@#$%^&*()_\-+=\[{\]};:'",<.>/?\\|`~]).*$/,
        {
          message:
            "Password must include at least one number and one special character",
        }
      ),
    confirmPassword: z
      .string()
      .min(8, { message: "Confirm password is required" }),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });


interface UserProfile {
  id: string;
  name: string | null;
  email: string;
  role: Role;
  amount: number;
  points: number;
  isApproved: boolean;
  profile?: {
    phone?: string | null;
    address?: string | null;
    city?: string | null;
    state?: string | null;
    country?: string | null;
    pincode?: string | null;
  } | null;
}

interface ProfileClientProps {
  user: {
    id: string;
    name?: string | null;
    email: string;
    role: Role;
    isApproved: boolean;
    amount?: number;
    points?: number;
  };
}

export function ProfileClient({ user: initialUser }: ProfileClientProps) {
  const [user, setUser] = useState<UserProfile>({
    ...initialUser,
    // Make sure to use the initial values that come from the server
    amount: initialUser.amount || 0,
    points: initialUser.points || 0,
    name: initialUser.name || null,
  });
  const [loading, setLoading] = useState(true);
  const [changingPassword, setChangingPassword] = useState(false);

  // Password change form
  const form = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    console.log("Initial user data:", initialUser); // Log initial data for debugging

    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/user/profile");
        if (response.ok) {
          const data = await response.json();
          console.log("User Profile API response:", data);

          // Fix: Make sure to preserve the initialUser amount if API doesn't return it
          setUser((prevUser) => ({
            ...prevUser,
            ...data,
            // Prioritize API data, then initialUser data, then fallback to 0
            amount:
              data.amount !== undefined
                ? data.amount
                : initialUser.amount !== undefined
                ? initialUser.amount
                : 0,
            points:
              data.points !== undefined
                ? data.points
                : initialUser.points !== undefined
                ? initialUser.points
                : 0,
            profile: data.profile || null,
          }));
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        // If API fails, we should still show the amount from initial props
        setUser((prevUser) => ({
          ...prevUser,
          amount:
            initialUser.amount !== undefined
              ? initialUser.amount
              : prevUser.amount,
          points:
            initialUser.points !== undefined
              ? initialUser.points
              : prevUser.points,
        }));
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [initialUser]);

  // Handle password change submission
  const onPasswordSubmit = async (values: z.infer<typeof passwordSchema>) => {
    try {
      setChangingPassword(true);
      const response = await fetch("/api/user/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword: values.currentPassword,
          newPassword: values.newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to change password");
      }

      toast.success("Password changed successfully");
      form.reset();
    } catch (error: any) {
      toast.error("Failed to change password", {
        description: error.message,
      });
    } finally {
      setChangingPassword(false);
    }
  };

  // Calculate the badge color based on role
  const roleBadgeColor = () => {
    switch (user.role) {
      case Role.SUPER_ADMIN:
        return "bg-purple-100 text-purple-800 border-purple-200";
      case Role.SELLER:
        return "bg-blue-100 text-blue-800 border-blue-200";
      case Role.BUYER:
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <h1 className="text-3xl font-bold mb-8">My Profile</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column - User info card */}
        <div className="lg:col-span-1">
          <Card className="p-6 shadow-md">
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-3xl font-bold mb-4">
                {user.name?.charAt(0) || "U"}
              </div>
              <h2 className="text-2xl font-semibold">{user.name}</h2>
              <div
                className={`px-3 py-1 rounded-full text-sm font-medium border mt-2 ${roleBadgeColor()}`}
              >
                {user.role}
              </div>

              {/* Status badge */}
              {user.role === Role.SELLER && (
                <div
                  className={`mt-2 px-3 py-1 rounded-full text-sm font-medium ${
                    user.isApproved
                      ? "bg-green-100 text-green-800 border border-green-200"
                      : "bg-yellow-100 text-yellow-800 border border-yellow-200"
                  }`}
                >
                  {user.isApproved ? "Approved Seller" : "Pending Approval"}
                </div>
              )}

              {/* Balance or Points card - highlighted */}
              {user.role === Role.BUYER && (
                <div className="w-full mt-6 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-xl p-4 text-white shadow-lg">
                  <div className="flex items-center mb-2">
                    <FiDollarSign className="mr-2" size={20} />
                    <h3 className="text-lg font-medium">Your Balance</h3>
                  </div>
                  <p className="text-3xl font-bold">
                    ${user.amount.toFixed(2)}
                  </p>
                </div>
              )}

              {user.role === Role.SELLER && (
                <>
                  <div className="w-full mt-6 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl p-4 text-white shadow-lg">
                    <div className="flex items-center mb-2">
                      <FiAward className="mr-2" size={20} />
                      <h3 className="text-lg font-medium">Your Points</h3>
                    </div>
                    <p className="text-3xl font-bold">{user.points} points</p>
                  </div>

                  <div className="w-full mt-4 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-xl p-4 text-white shadow-lg">
                    <div className="flex items-center mb-2">
                      <FiDollarSign className="mr-2" size={20} />
                      <h3 className="text-lg font-medium">Your Balance</h3>
                    </div>
                    <p className="text-3xl font-bold">
                      ${user.amount.toFixed(2)}
                    </p>
                  </div>
                </>
              )}
            </div>

            <div className="space-y-3 mt-4">
              <div className="flex items-center text-gray-700">
                <FiMail className="mr-3 text-gray-500" />
                <span>{user.email}</span>
              </div>

              {user.profile?.phone && (
                <div className="flex items-center text-gray-700">
                  <FiPhone className="mr-3 text-gray-500" />
                  <span>{user.profile.phone}</span>
                </div>
              )}

              {user.profile?.address && (
                <div className="flex items-center text-gray-700">
                  <FiMapPin className="mr-3 text-gray-500" />
                  <span>{user.profile.address}</span>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Right column - Tabs with more content */}
        <div className="lg:col-span-2">
          <Card className="shadow-md">
            <Tabs defaultValue="details">
              <TabsList className="w-full border-b">
                <TabsTrigger value="details" className="flex-1">
                  Account Details
                </TabsTrigger>
                <TabsTrigger value="security" className="flex-1">
                  Security
                </TabsTrigger>
                {/* <TabsTrigger value="activity" className="flex-1">
                  Activity
                </TabsTrigger>
                {user.role === Role.BUYER && (
                  <TabsTrigger value="payments" className="flex-1">
                    Payment History
                  </TabsTrigger>
                )} */}
              </TabsList>

              {/* Tabs Content */}
              <TabsContent value="details" className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <p className="text-sm text-gray-500">Full Name</p>
                    <p className="font-medium">{user.name || "Not provided"}</p>
                  </div>

                  <div className="space-y-1">
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{user.email}</p>
                  </div>

                  {user.profile?.city && (
                    <div className="space-y-1">
                      <p className="text-sm text-gray-500">City</p>
                      <p className="font-medium">{user.profile.city}</p>
                    </div>
                  )}

                  {user.profile?.state && (
                    <div className="space-y-1">
                      <p className="text-sm text-gray-500">State</p>
                      <p className="font-medium">{user.profile.state}</p>
                    </div>
                  )}

                  {user.profile?.country && (
                    <div className="space-y-1">
                      <p className="text-sm text-gray-500">Country</p>
                      <p className="font-medium">{user.profile.country}</p>
                    </div>
                  )}

                  {user.profile?.pincode && (
                    <div className="space-y-1">
                      <p className="text-sm text-gray-500">Pincode</p>
                      <p className="font-medium">{user.profile.pincode}</p>
                    </div>
                  )}
                </div>

                {/* <div className="mt-8 flex justify-end">
                  <Button>Edit Profile</Button>
                </div> */}
              </TabsContent>

              <TabsContent value="security" className="p-6">
                <div className="mb-6">
                  <h3 className="text-lg font-medium mb-4 flex items-center">
                    <FiLock className="mr-2" /> Change Password
                  </h3>

                  <Form {...form}>
                    <form
                      onSubmit={form.handleSubmit(onPasswordSubmit)}
                      className="space-y-4"
                    >
                      <FormField
                        control={form.control}
                        name="currentPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Current Password</FormLabel>
                            <FormControl>
                              <Input type="password" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="newPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>New Password</FormLabel>
                            <FormControl>
                              <Input type="password" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Confirm New Password</FormLabel>
                            <FormControl>
                              <Input type="password" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="flex justify-end">
                        <Button
                          type="submit"
                          disabled={changingPassword}
                          className="mt-2"
                        >
                          {changingPassword ? "Updating..." : "Update Password"}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </div>
              </TabsContent>
              {/* 
              <TabsContent value="activity" className="p-6">
                <div className="text-center py-8 text-gray-500">
                  <p>Your activity history will appear here.</p>
                </div>
              </TabsContent> */}

              {user.role === Role.BUYER && (
                <TabsContent value="payments" className="p-6">
                  <div className="text-center py-8 text-gray-500">
                    <p>Your payment history will appear here.</p>
                  </div>
                </TabsContent>
              )}

              {/* Conditional Content for Contact */}

              {user.role != Role.SUPER_ADMIN && (
                <>
                  <div className="p-6 mt-8 border-t-2 border-gray-300">
                    <h3 className="text-2xl text-indigo-500 font-bold mb-2">
                      {user.role === Role.BUYER
                        ? "Contact to add Funds here"
                        : "Contact to Redeem Points here"}
                    </h3>
                    <p className="text-sm mb-4">
                      For{" "}
                      {user.role === Role.BUYER
                        ? "adding funds"
                        : "redeeming points"}{" "}
                      to your account, reach out to:
                    </p>
                    <a
                      href="mailto:admin@example.com"
                      className="text-blue-600 hover:underline"
                    >
                      admin@example.com
                    </a>
                  </div>
                </>
              )}
            </Tabs>
          </Card>
        </div>
      </div>
    </div>
  );
}
