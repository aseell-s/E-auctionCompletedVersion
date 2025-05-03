"use client";

import { AuctionCard } from "@/components/auctions/AuctionCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Card } from "@/components/ui/card";
import { Search, FilterX, Plus, ChevronDown } from "lucide-react";
import { showPointsEarnedToast } from "@/components/ui/PointsNotification";
import { FiAward, FiTrendingUp } from "react-icons/fi";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Auction {
  id: string;
  title: string;
  description: string;
  currentPrice: number;
  images: string[];
  status: string;
  endTime: Date;
  seller: {
    name: string;
    id: string;
  };
  _count: {
    bids: number;
  };
  itemType?: string;
}

export function SellerDashboard() {
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [filteredAuctions, setFilteredAuctions] = useState<Auction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [recentlyEndedAuctions, setRecentlyEndedAuctions] = useState<any[]>([]);
  const [shownNotifications, setShownNotifications] = useState<Set<string>>(
    new Set()
  );

  // Filter states
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000]);
  const [categories, setCategories] = useState<string[]>([]);
  const [maxPrice, setMaxPrice] = useState<number>(100000);
  
  // Mobile filter state
  const [showFilters, setShowFilters] = useState(false);
  const [windowWidth, setWindowWidth] = useState<number>(
    typeof window !== "undefined" ? window.innerWidth : 0
  );

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      if (window.innerWidth >= 768) {
        setShowFilters(true);
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const fetchAuctions = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/auctions/approved");
        if (!response.ok) {
          const text = await response.text();
          throw new Error(`HTTP ${response.status}: ${text}`);
        }
        const data = await response.json();
        setAuctions(data);
        setFilteredAuctions(data);

        // Extract unique categories
        const uniqueCategories = Array.from(
          new Set(
            data.map((auction: Auction) => auction.itemType).filter(Boolean)
          )
        );
        setCategories(uniqueCategories as string[]);

        // Find the maximum price
        const highestPrice = Math.max(
          ...data.map((auction: Auction) => auction.currentPrice),
          100000
        );
        setMaxPrice(highestPrice);
        setPriceRange([0, highestPrice]);

        // Fetch recently ended auctions (last 24 hours)
        const recentlyEndedResponse = await fetch(
          "/api/auctions/recently-ended"
        );
        if (recentlyEndedResponse.ok) {
          const recentlyEnded = await recentlyEndedResponse.json();
          setRecentlyEndedAuctions(recentlyEnded);

          // Show notifications for auctions we haven't shown yet
          recentlyEnded.forEach(
            (auction: {
              id: string;
              title: string;
              sellerPoints: number;
              pointsAwardedValue: boolean;
            }) => {
              if (
                auction.pointsAwardedValue &&
                auction.sellerPoints > 0 &&
                !shownNotifications.has(auction.id)
              ) {
                showPointsEarnedToast(auction.title, auction.sellerPoints);
                setShownNotifications((prev) => new Set(prev).add(auction.id));
              }
            }
          );
        }
      } catch (error) {
        console.error("Error fetching auctions:", error);
        setError("Failed to load auctions. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchAuctions();
  }, [shownNotifications]);

  // Apply filters whenever filter criteria change
  useEffect(() => {
    // Apply all filters (search query, category, price range)
    const filtered = auctions.filter((auction) => {
      const matchesSearch = auction.title
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesCategory =
        selectedCategory === null || auction.itemType === selectedCategory;
      const matchesPrice =
        auction.currentPrice >= priceRange[0] &&
        auction.currentPrice <= priceRange[1];

      return matchesSearch && matchesCategory && matchesPrice;
    });

    setFilteredAuctions(filtered);
  }, [searchQuery, auctions, selectedCategory, priceRange]);

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedCategory(null);
    setPriceRange([0, maxPrice]);
  };

  // Group auctions by status
  const activeAuctions = filteredAuctions.filter(auction => auction.status === "ACTIVE");
  const endedAuctions = filteredAuctions.filter(auction => auction.status === "ENDED");
  const pendingAuctions = filteredAuctions.filter(auction => auction.status === "PENDING");

  if (loading) {
    return (
      <div className="flex items-center justify-center p-6 min-h-[300px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-6 bg-red-50 border border-red-200 text-red-600 rounded-lg">
        <p>{error}</p>
        <Button 
          variant="outline" 
          className="mt-4"
          onClick={() => window.location.reload()}
        >
          Try Again
        </Button>
      </div>
    );
  }

  if (auctions.length === 0) {
    return (
      <div className="text-center p-6 sm:p-12 bg-gray-50 rounded-lg border border-gray-200">
        <h3 className="text-lg sm:text-xl font-medium mb-4">Create your first auction</h3>
        <p className="text-gray-500 mb-6">
          You haven't created any auctions yet. Start selling by creating your
          first auction.
        </p>
        <Link href="/auctions/create">
          <Button size="lg" className="flex items-center gap-2">
            <Plus size={16} />
            Create New Auction
          </Button>
        </Link>
      </div>
    );
  }

  const renderPointsEarnedHeader = () => {
    if (recentlyEndedAuctions.length === 0) return null;

    // Sum sellerPoints from recently ended auctions
    const totalRecentPoints = recentlyEndedAuctions.reduce(
      (sum, auction) =>
        auction.pointsAwarded && auction.sellerPoints > 0
          ? sum + auction.sellerPoints
          : sum,
      0
    );

    if (totalRecentPoints <= 0) return null;

    return (
      <div className="mb-4 sm:mb-6">
        <motion.div
          className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200 p-3 sm:p-4 shadow-sm"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center">
              <div className="h-8 w-8 sm:h-10 sm:w-10 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center shadow-md mr-3">
                <FiAward className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-amber-800">
                  Recently Earned Points
                </h3>
                <p className="text-xs sm:text-sm text-amber-600">
                  From your recently ended auctions
                </p>
              </div>
            </div>
            <div className="flex items-center bg-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-full shadow border border-amber-200">
              <FiTrendingUp className="text-amber-500 mr-2" />
              <span className="text-lg sm:text-xl font-bold text-amber-700">
                +{totalRecentPoints}
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    );
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <h2 className="text-xl sm:text-2xl font-bold">My Listed Auctions</h2>
        <Link href="/auctions/create">
          <Button className="w-full sm:w-auto flex items-center gap-1.5">
            <Plus size={16} />
            Create New Auction
          </Button>
        </Link>
      </div>

      {renderPointsEarnedHeader()}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
        <Card className="p-3 sm:p-4 bg-blue-50 border-blue-200">
          <h3 className="text-xs sm:text-sm font-medium text-blue-700">Active</h3>
          <p className="text-xl sm:text-2xl font-bold text-blue-800">
            {activeAuctions.length}
          </p>
        </Card>
        <Card className="p-3 sm:p-4 bg-amber-50 border-amber-200">
          <h3 className="text-xs sm:text-sm font-medium text-amber-700">Ended</h3>
          <p className="text-xl sm:text-2xl font-bold text-amber-800">
            {endedAuctions.length}
          </p>
        </Card>
        <Card className="p-3 sm:p-4 bg-purple-50 border-purple-200 col-span-2 sm:col-span-1">
          <h3 className="text-xs sm:text-sm font-medium text-purple-700">Pending</h3>
          <p className="text-xl sm:text-2xl font-bold text-purple-800">
            {pendingAuctions.length}
          </p>
        </Card>
      </div> 

      {/* Filter Section */}
      <Card className="p-3 sm:p-4">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-medium text-sm sm:text-base">Filter Auctions</h3>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setShowFilters(!showFilters)}
            className="md:hidden flex items-center gap-1"
          >
            {showFilters ? "Hide" : "Show"} Filters
            <ChevronDown size={16} className={`transition-transform ${showFilters ? "rotate-180" : ""}`} />
          </Button>
        </div>

        {showFilters && (
          <div className="space-y-3">
            {/* Search input */}
            <div className="relative w-full">
              <Search
                className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={16}
              />
              <Input
                type="text"
                placeholder="Search your auctions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 w-full"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              {/* Category filter */}
              <div className="w-full sm:w-1/2">
                <Select
                  value={selectedCategory || undefined}
                  onValueChange={(value) =>
                    setSelectedCategory(value === "all" ? null : value)
                  }
                >
                  <SelectTrigger className="h-9 w-full">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Reset button */}
              <Button
                variant="outline"
                size="sm"
                onClick={resetFilters}
                className="flex items-center gap-1 h-9 px-3 w-full sm:w-auto"
              >
                <FilterX size={14} />
                Reset Filters
              </Button>
            </div>

            {/* Price range */}
            <div className="px-1">
              <div className="flex justify-between text-xs sm:text-sm text-gray-500 mb-1.5">
                <span>Price: ﷼{priceRange[0].toLocaleString()}</span>
                <span>﷼{priceRange[1].toLocaleString()}</span>
              </div>
              <Slider
                defaultValue={[0, maxPrice]}
                min={0}
                max={maxPrice}
                step={100}
                value={priceRange}
                onValueChange={(value: number[]) =>
                  setPriceRange(value as [number, number])
                }
                className="mt-2 w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>﷼0</span>
                <span>﷼{maxPrice.toLocaleString()}</span>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Results count */}
      <p className="text-xs text-gray-500 my-2">
        Showing {filteredAuctions.length} of {auctions.length} auctions
      </p>

      {/* Tabs for different auction statuses */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="w-full sm:w-auto grid grid-cols-4 sm:inline-flex mb-4">
          <TabsTrigger value="all" className="text-xs sm:text-sm">
            All ({filteredAuctions.length})
          </TabsTrigger>
          <TabsTrigger value="active" className="text-xs sm:text-sm">
            Active ({activeAuctions.length})
          </TabsTrigger>
          <TabsTrigger value="ended" className="text-xs sm:text-sm">
            Ended ({endedAuctions.length})
          </TabsTrigger>
          <TabsTrigger value="pending" className="text-xs sm:text-sm">
            Pending ({pendingAuctions.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          {filteredAuctions.length === 0 ? (
            <div className="text-center p-6 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-gray-500">No auctions match your search.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {filteredAuctions.map((auction) => (
                <AuctionCard key={auction.id} auction={auction} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="active">
          {activeAuctions.length === 0 ? (
            <div className="text-center p-6 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-gray-500">No active auctions found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {activeAuctions.map((auction) => (
                <AuctionCard key={auction.id} auction={auction} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="ended">
          {endedAuctions.length === 0 ? (
            <div className="text-center p-6 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-gray-500">No ended auctions found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {endedAuctions.map((auction) => (
                <AuctionCard key={auction.id} auction={auction} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="pending">
          {pendingAuctions.length === 0 ? (
            <div className="text-center p-6 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-gray-500">No pending auctions found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {pendingAuctions.map((auction) => (
                <AuctionCard key={auction.id} auction={auction} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
