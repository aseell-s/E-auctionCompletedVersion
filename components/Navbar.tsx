"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Role } from "@prisma/client";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { FiUser, FiX, FiAward, FiMenu, FiHome, FiPackage, FiPlus, FiUsers } from "react-icons/fi";

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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const [windowWidth, setWindowWidth] = useState<number>(
    typeof window !== "undefined" ? window.innerWidth : 0
  );

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/login" });
  };

  const navItems = {
    [Role.SUPER_ADMIN]: [
      { label: "Dashboard", href: "/dashboard", icon: <FiHome size={18} /> },
      { label: "Approvals", href: "/dashboard/approvals", icon: <FiPackage size={18} /> },
      { label: "User Management", href: "/admin/users", icon: <FiUsers size={18} /> },
    ],
    [Role.SELLER]: [
      { label: "Dashboard", href: "/dashboard", icon: <FiHome size={18} /> },
      { label: "Create Auction", href: "/auctions/create", icon: <FiPlus size={18} /> },
    ],
    [Role.BUYER]: [
      { label: "Dashboard", href: "/dashboard", icon: <FiHome size={18} /> },
    ],
  };

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const sidebar = document.getElementById('sidebar');
      const mobileMenu = document.getElementById('mobile-menu');
      
      if (sidebar && !sidebar.contains(event.target as Node) && isSidebarOpen) {
        setIsSidebarOpen(false);
      }
      
      if (mobileMenu && !mobileMenu.contains(event.target as Node) && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isSidebarOpen, isMobileMenuOpen]);

  // Close menus when route changes
  useEffect(() => {
    setIsSidebarOpen(false);
    setIsMobileMenuOpen(false);
  }, [pathname]);

  return (
    <>
      {/* Navbar */}
      <nav className="bg-gradient-to-r from-indigo-50 to-gray-100/70 backdrop-blur-xl shadow-lg rounded-2xl p-4 sm:p-5 flex items-center justify-between border border-gray-300 mx-2 sm:mx-4 mt-2 sm:mt-4">
        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-gray-700 hover:text-indigo-600 transition"
          onClick={toggleMobileMenu}
          aria-label="Toggle Mobile Menu"
        >
          <FiMenu size={24} />
        </button>

        {/* Left Section - Welcome and Navigation */}
        <div className="flex flex-col">
          <span className="text-xl sm:text-2xl font-bold text-gray-900 truncate max-w-[180px] sm:max-w-none">
            Welcome, {user.name || "User"}
          </span>
          <div className="hidden md:flex space-x-6 mt-1">
            {user.role &&
              navItems[user.role].map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`hover:underline transition flex items-center gap-1.5 ${
                    pathname === item.href ? "text-indigo-600" : "text-gray-700"
                  }`}
                >
                  {item.icon}
                  {item.label}
                </Link>
              ))}
          </div>
        </div>

        {/* Balance Display */}
        <div className="flex items-center gap-2">
          {user.role === Role.BUYER && typeof user.amount === "number" && (
            <div className="hidden sm:flex items-center bg-indigo-100 px-3 sm:px-4 py-2 rounded-full shadow-sm border border-indigo-200">
              <span className="text-indigo-600 mr-1 sm:mr-2 text-lg sm:text-xl font-bold">﷼</span>
              <span className="font-semibold text-indigo-800 text-sm sm:text-base">
                {user.amount.toFixed(2)}
              </span>
            </div>
          )}

          {user.role === Role.SELLER && typeof user.points === "number" && (
            <div className="hidden sm:flex items-center bg-amber-100 px-3 sm:px-4 py-2 rounded-full shadow-sm border border-amber-200">
              <FiAward className="text-amber-600 mr-1 sm:mr-2" />
              <span className="font-semibold text-amber-800 text-sm sm:text-base">
                {user.points} pts
              </span>
            </div>
          )}

          {/* Right Section - Profile Icon */}
          <button
            className="w-10 h-10 sm:w-12 sm:h-12 bg-indigo-600 text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-105 transition-all"
            onClick={toggleSidebar}
            aria-label="Toggle Menu"
          >
            <FiUser size={windowWidth < 640 ? 20 : 24} />
          </button>
        </div>
      </nav>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div 
          id="mobile-menu"
          className="fixed inset-0 z-40 bg-black bg-opacity-50 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <div 
            className="absolute top-0 left-0 w-3/4 max-w-xs h-full bg-white shadow-xl p-4 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6 border-b pb-4">
              <h2 className="text-lg font-semibold">Navigation</h2>
              <button onClick={() => setIsMobileMenuOpen(false)} title="Close Menu">
                <FiX size={24} />
              </button>
            </div>
            
            <ul className="space-y-4">
              {user.role && navItems[user.role].map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 p-2 rounded-lg ${
                      pathname === item.href 
                        ? "bg-indigo-50 text-indigo-700" 
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {item.icon}
                    {item.label}
                  </Link>
                </li>
              ))}
              
              <li className="pt-4 border-t">
                <Link
                  href="/profile"
                  className={`flex items-center gap-3 p-2 rounded-lg ${
                    pathname === "/profile" 
                      ? "bg-indigo-50 text-indigo-700" 
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <FiUser size={18} />
                  Profile
                </Link>
              </li>
              
              <li>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 p-2 rounded-lg text-red-500 hover:bg-red-50 w-full text-left"
                >
                  <FiX size={18} />
                  Logout
                </button>
              </li>
            </ul>
            
            {/* Show balance/points in mobile menu too */}
            {user.role === Role.BUYER && typeof user.amount === "number" && (
              <div className="mt-6 p-3 bg-indigo-50 rounded-lg">
                <div className="flex items-center">
                  <span className="text-indigo-600 mr-2 text-xl font-bold">﷼</span>
                  <div>
                    <p className="text-xs text-indigo-600">Your Balance</p>
                    <p className="font-semibold text-indigo-800">{user.amount.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            )}

            {user.role === Role.SELLER && typeof user.points === "number" && (
              <div className="mt-6 p-3 bg-amber-50 rounded-lg">
                <div className="flex items-center">
                  <FiAward className="text-amber-600 mr-2" size={18} />
                  <div>
                    <p className="text-xs text-amber-600">Your Points</p>
                    <p className="font-semibold text-amber-800">{user.points} points</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Sidebar Menu */}
      <aside
        id="sidebar"
        className={`fixed top-0 right-0 h-full w-[280px] sm:w-72 bg-gradient-to-br from-indigo-50 to-white/70 backdrop-blur-lg shadow-xl rounded-l-2xl border border-gray-300 transform transition-transform duration-300 z-50 ${
          isSidebarOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Sidebar Header */}
        <div className="p-4 sm:p-6 flex justify-between items-center border-b border-indigo-200/60">
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
          <div className="px-4 sm:px-6 pt-4 pb-2">
            <div className="flex items-center bg-indigo-100 px-4 py-3 rounded-lg">
              <span className="text-indigo-600 mr-2 text-xl font-bold">﷼</span>
              <div>
                <p className="text-xs text-indigo-600">Your Balance</p>
                <p className="font-semibold text-indigo-800">
                  {user.amount.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        )}

        {user.role === Role.SELLER && typeof user.points === "number" && (
          <div className="px-4 sm:px-6 pt-4 pb-2">
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
        <ul className="mt-4 space-y-4 p-4 sm:p-6">
          <li>
            <Link
              href="/profile"
              className={`block text-base sm:text-lg transition flex items-center gap-2 p-2 rounded-lg ${
                pathname === "/profile"
                  ? "font-bold text-indigo-700 bg-indigo-50"
                  : "text-gray-700 hover:text-indigo-600 hover:bg-gray-50"
              }`}
              onClick={() => setIsSidebarOpen(false)}
            >
              <FiUser size={18} />
              Profile
            </Link>
          </li>
          <li>
            <button
              onClick={handleLogout}
              className="block text-base sm:text-lg text-red-500 hover:text-red-700 transition w-full text-left flex items-center gap-2 p-2 rounded-lg hover:bg-red-50"
            >
              <FiX size={18} />
              Logout
            </button>
          </li>
        </ul>
      </aside>
    </>
  );
}
