"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Users, ArrowLeft, Search, Filter, ChevronDown, ChevronUp, MoreHorizontal } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { Role } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  isApproved: boolean;
  amount: number;
  points: number;
  createdAt: string;
}

interface UserManagementClientProps {
  initialUsers: User[];
}

export default function UserManagementClient({ initialUsers }: UserManagementClientProps) {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [filteredUsers, setFilteredUsers] = useState<User[]>(initialUsers);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [sortField, setSortField] = useState<string>("createdAt");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [windowWidth, setWindowWidth] = useState<number>(
    typeof window !== "undefined" ? window.innerWidth : 1024
  );

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    let result = [...users];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (user) =>
          user.name.toLowerCase().includes(query) ||
          user.email.toLowerCase().includes(query)
      );
    }

    // Apply role filter
    if (roleFilter) {
      result = result.filter((user) => user.role === roleFilter);
    }

    // Apply status filter
    if (statusFilter) {
      const isApproved = statusFilter === "approved";
      result = result.filter((user) => user.isApproved === isApproved);
    }

    // Apply sorting
    result.sort((a, b) => {
      let valueA: any = a[sortField as keyof User];
      let valueB: any = b[sortField as keyof User];

      // Handle string comparison
      if (typeof valueA === "string" && typeof valueB === "string") {
        return sortDirection === "asc"
          ? valueA.localeCompare(valueB)
          : valueB.localeCompare(valueA);
      }

      // Handle number comparison
      return sortDirection === "asc" ? valueA - valueB : valueB - valueA;
    });

    setFilteredUsers(result);
  }, [users, searchQuery, roleFilter, statusFilter, sortField, sortDirection]);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const resetFilters = () => {
    setSearchQuery("");
    setRoleFilter(null);
    setStatusFilter(null);
  };

  const getRoleBadgeColor = (role: Role) => {
    switch (role) {
      case "SUPER_ADMIN":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "SELLER":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "BUYER":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusBadgeColor = (isApproved: boolean) => {
    return isApproved
      ? "bg-green-100 text-green-800 border-green-200"
      : "bg-yellow-100 text-yellow-800 border-yellow-200";
  };

  const getAvatarColor = (name: string) => {
    const colors = [
      "bg-blue-500",
      "bg-green-500",
      "bg-purple-500",
      "bg-pink-500",
      "bg-yellow-500",
      "bg-red-500",
      "bg-indigo-500",
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  // Determine if we're on mobile view
  const isMobile = windowWidth < 768;
  const isTablet = windowWidth >= 768 && windowWidth < 1024;

  return (
    <div className="container mx-auto py-4 sm:py-6 px-3 sm:px-4">
      <Link
        href="/dashboard"
        className="inline-flex items-center text-indigo-600 hover:text-indigo-800 mb-4 text-sm sm:text-base"
      >
        <ArrowLeft size={16} className="mr-1" />
        Back to Dashboard
      </Link>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div className="flex items-center">
          <Users size={24} className="text-indigo-700 mr-2 sm:mr-3" />
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            User Management
          </h1>
        </div>

        {/* Desktop Filter Controls */}
        <div className="hidden md:flex items-center gap-3 w-full md:w-auto">
          <div className="relative">
            <Search
              size={16}
              className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400"
            />
            <Input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 w-[200px]"
            />
          </div>

          <select
            value={roleFilter || ""}
            onChange={(e) => setRoleFilter(e.target.value || null)}
            className="h-9 rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="">All Roles</option>
            <option value="SUPER_ADMIN">Admin</option>
            <option value="SELLER">Seller</option>
            <option value="BUYER">Buyer</option>
          </select>

          <select
            value={statusFilter || ""}
            onChange={(e) => setStatusFilter(e.target.value || null)}
            className="h-9 rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="">All Status</option>
            <option value="approved">Approved</option>
            <option value="pending">Pending</option>
          </select>

          {(searchQuery || roleFilter || statusFilter) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={resetFilters}
              className="h-9"
            >
              Reset
            </Button>
          )}
        </div>

        {/* Mobile Filter Button */}
        <div className="md:hidden flex items-center gap-2 w-full">
          <div className="relative flex-grow">
            <Search
              size={16}
              className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400"
            />
            <Input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9"
            />
          </div>

          <Button variant="outline" size="sm" onClick={() => {}} className="h-9 px-3">
            <Filter size={16} className="mr-1" />
            Filter
          </Button>
        </div>
      </div>

      {/* User count */}
      <div className="text-sm text-gray-500 mb-3">
        Showing {filteredUsers.length} of {users.length} users
      </div>

      {/* Desktop Table View */}
      {!isMobile && (
        <div className="bg-white shadow-lg rounded-xl overflow-hidden border border-gray-200">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort("name")}
                  >
                    <div className="flex items-center">
                      <span>Name</span>
                      {sortField === "name" && (
                        <span className="ml-1">
                          {sortDirection === "asc" ? (
                            <ChevronUp size={14} />
                          ) : (
                            <ChevronDown size={14} />
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                  <th
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort("email")}
                  >
                    <div className="flex items-center">
                      <span>Email</span>
                      {sortField === "email" && (
                        <span className="ml-1">
                          {sortDirection === "asc" ? (
                            <ChevronUp size={14} />
                          ) : (
                            <ChevronDown size={14} />
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                  <th
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort("role")}
                  >
                    <div className="flex items-center">
                      <span>Role</span>
                      {sortField === "role" && (
                        <span className="ml-1">
                          {sortDirection === "asc" ? (
                            <ChevronUp size={14} />
                          ) : (
                            <ChevronDown size={14} />
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                  <th
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort("isApproved")}
                  >
                    <div className="flex items-center">
                      <span>Status</span>
                      {sortField === "isApproved" && (
                        <span className="ml-1">
                          {sortDirection === "asc" ? (
                            <ChevronUp size={14} />
                          ) : (
                            <ChevronDown size={14} />
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                  {!isTablet && (
                    <>
                      <th
                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => handleSort("amount")}
                      >
                        <div className="flex items-center">
                          <span>Balance</span>
                          {sortField === "amount" && (
                            <span className="ml-1">
                              {sortDirection === "asc" ? (
                                <ChevronUp size={14} />
                              ) : (
                                <ChevronDown size={14} />
                              )}
                            </span>
                          )}
                        </div>
                      </th>
                      <th
                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => handleSort("points")}
                      >
                        <div className="flex items-center">
                          <span>Points</span>
                          {sortField === "points" && (
                            <span className="ml-1">
                              {sortDirection === "asc" ? (
                                <ChevronUp size={14} />
                              ) : (
                                <ChevronDown size={14} />
                              )}
                            </span>
                          )}
                        </div>
                      </th>
                    </>
                  )}
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user, index) => (
                  <tr
                    key={user.id}
                    className={`hover:bg-gray-50 transition-colors ${
                      index % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                    }`}
                  >
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center">
                        <div
                          className={`h-8 w-8 ${getAvatarColor(
                            user.name
                          )} rounded-full flex items-center justify-center text-white`}
                        >
                          <span className="text-xs font-medium">
                            {user.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">
                            {user.name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      {user.email}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleBadgeColor(user.role)}`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(user.isApproved)}`}
                      >
                        {user.isApproved ? "Approved" : "Pending"}
                      </span>
                    </td>
                    {!isTablet && (
                      <>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            ﷼{user.amount.toFixed(2)}
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {user.points}
                          </div>
                        </td>
                      </>
                    )}
                    <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                      <Link
                        href={`/admin/users/${user.id}`}
                        className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 px-3 py-1 rounded-md transition-colors"
                      >
                        Manage
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Mobile Card View */}
      {isMobile && (
        <div className="space-y-3">
          {filteredUsers.map((user) => (
            <Card key={user.id} className="overflow-hidden">
              <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`h-10 w-10 ${getAvatarColor(
                      user.name
                    )} rounded-full flex items-center justify-center text-white`}
                  >
                    <span className="text-sm font-medium">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <CardTitle className="text-base">{user.name}</CardTitle>
                    <CardDescription className="text-xs">
                      {user.email}
                    </CardDescription>
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreHorizontal size={16} />
                </Button>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-xs text-gray-500">Role</p>
                    <span
                      className={`mt-1 px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleBadgeColor(user.role)}`}
                    >
                      {user.role}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Status</p>
                    <span
                      className={`mt-1 px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(user.isApproved)}`}
                    >
                      {user.isApproved ? "Approved" : "Pending"}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Balance</p>
                    <p className="font-medium">﷼{user.amount.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Points</p>
                    <p className="font-medium">{user.points}</p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="p-4 pt-0 flex justify-end">
                <Link
                  href={`/admin/users/${user.id}`}
                  className="text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-md text-sm transition-colors"
                >
                  Manage
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {filteredUsers.length === 0 && (
        <div className="bg-gray-50 text-center p-8 rounded-lg border border-gray-200">
          <p className="text-gray-500">No users found matching your filters</p>
          <Button
            variant="outline"
            onClick={resetFilters}
            className="mt-4"
          >
            Reset Filters
          </Button>
        </div>
      )}
    </div>
  );
}
