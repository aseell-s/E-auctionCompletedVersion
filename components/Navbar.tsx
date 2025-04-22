"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Role } from "@prisma/client";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { FiUser, FiX, FiDollarSign, FiAward } from "react-icons/fi";

interface NavbarProps {
  user: {
    name?: string | null;
    role: Role;
    amount?: number;
    points?: number;
  };
}

export function Navbar({ user }: NavbarProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/login" });
  };

  const navItems = {
    [Role.SUPER_ADMIN]: [
      { label: "Approvals", href: "/dashboard/approvals" },
      { label: "User Management", href: "/admin/users" },
    ],
    [Role.SELLER]: [
      { label: "Create Auction", href: "/auctions/create" },
      // { label: "My Auctions", href: "/auctions" },
    ],
    [Role.BUYER]: [
      // { label: 'My Auctions', href: '/auctions' },
    ],
  };

  return (
    <>
      {/* Navbar */}
      <nav className="bg-gradient-to-r from-indigo-50 to-gray-100/70 backdrop-blur-xl shadow-lg rounded-2xl p-5 flex items-center justify-between border border-gray-300 mx-4 mt-4">
        {/* Left Section - Welcome and Navigation */}
        <div className="flex flex-col">
          <span className="text-2xl font-bold text-gray-900">
            Welcome, {user.name || "User"}
          </span>
          <div className="flex space-x-6 mt-1">
            <Link
              href="/dashboard"
              className={`font-medium hover:underline ${
                pathname === "/dashboard" ? "text-indigo-600" : "text-gray-700"
              }`}
            >
              Dashboard
            </Link>
            {user.role &&
              navItems[user.role].map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`hover:underline transition ${
                    pathname === item.href ? "text-indigo-600" : "text-gray-700"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
          </div>
        </div>

        {/* Balance Display - Removed hidden md:flex to show on all screen sizes */}
        {user.role === Role.BUYER && typeof user.amount === "number" && (
          <div className="flex items-center bg-indigo-100 px-4 py-2 rounded-full shadow-sm border border-indigo-200 mr-4">
            <FiDollarSign className="text-indigo-600 mr-2" />
            <span className="font-semibold text-indigo-800">
              ${user.amount.toFixed(2)}
            </span>
          </div>
        )}

        {user.role === Role.SELLER && typeof user.points === "number" && (
          <div className="hidden md:flex items-center bg-amber-100 px-4 py-2 rounded-full shadow-sm border border-amber-200 mr-4">
            <FiAward className="text-amber-600 mr-2" />
            <span className="font-semibold text-amber-800">
              {user.points} points
            </span>
          </div>
        )}

        {/* Right Section - Profile Icon */}
        <button
          className="w-12 h-12 bg-indigo-600 text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-105 transition-all"
          onClick={toggleSidebar}
          aria-label="Toggle Menu"
        >
          <FiUser size={24} />
        </button>
      </nav>

      {/* Sidebar Menu */}
      <aside
        className={`fixed top-0 right-0 h-full w-72 bg-gradient-to-br from-indigo-50 to-white/70 backdrop-blur-lg shadow-xl rounded-l-2xl border border-gray-300 transform transition-transform duration-300 z-50 ${
          isSidebarOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Sidebar Header */}
        <div className="p-6 flex justify-between items-center border-b border-indigo-200/60">
          <span className="text-lg font-semibold text-gray-900">Menu</span>
          <button onClick={toggleSidebar} aria-label="Close Menu">
            <FiX
              size={24}
              className="text-gray-500 hover:text-gray-800 transition"
            />
          </button>
        </div>

        {/* Show balance/points in sidebar too */}
        {user.role === Role.BUYER && typeof user.amount === "number" && (
          <div className="px-6 pt-4 pb-2">
            <div className="flex items-center bg-indigo-100 px-4 py-3 rounded-lg">
              <FiDollarSign className="text-indigo-600 mr-2" size={18} />
              <div>
                <p className="text-xs text-indigo-600">Your Balance</p>
                <p className="font-semibold text-indigo-800">
                  ${user.amount.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        )}

        {user.role === Role.SELLER && typeof user.points === "number" && (
          <div className="px-6 pt-4 pb-2">
            <div className="flex items-center bg-amber-100 px-4 py-3 rounded-lg">
              <FiAward className="text-amber-600 mr-2" size={18} />
              <div>
                <p className="text-xs text-amber-600">Your Points</p>
                <p className="font-semibold text-amber-800">
                  {user.points} points
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Sidebar Links */}
        <ul className="mt-4 space-y-6 p-6">
          <li>
            <Link
              href="/profile"
              className={`block text-lg transition ${
                pathname === "/profile"
                  ? "font-bold text-indigo-700"
                  : "text-gray-700 hover:text-indigo-600"
              }`}
              onClick={() => setIsSidebarOpen(false)}
            >
              Profile
            </Link>
          </li>
          <li>
            <button
              onClick={handleLogout}
              className="block text-lg text-red-500 hover:text-red-700 transition w-full text-left"
            >
              Logout
            </button>
          </li>
        </ul>
      </aside>
    </>
  );
}
