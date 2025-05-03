"use client";

import { AuctionCard } from "@/components/auctions/AuctionCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Search, FilterX, Heart, Filter, ChevronDown, Loader2 } from "lucide-react";
import { Toggle } from "@/components/ui/toggle";
import { toast } from "sonner";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

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
  isFavorite?: boolean;
}

export function BuyerDashboard() {
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [filteredAuctions, setFilteredAuctions] = useState<Auction[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000]);
  const [categories, setCategories] = useState<string[]>([]);
  const [maxPrice, setMaxPrice] = useState<number>(100000);
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [windowWidth, setWindowWidth] = useState<number>(
    typeof window !== "undefined" ? window.innerWidth : 0
  );

  // Track window size for responsive design
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
        setError(null);
        
        const response = await fetch("/api/auctions/approved");
        if (!response.ok) throw new Error("Failed to fetch auctions");
        const data = await response.json();

        // Fetch user's favorites to mark favorite auctions
        const favoritesResponse = await fetch("/api/user/favorites");
        let favoriteIds: string[] = [];

        if (favoritesResponse.ok) {
          const favoritesData = await favoritesResponse.json();
          favoriteIds = favoritesData.map((fav: any) => fav.auctionId);
        }

        // Mark auctions that are favorites
        const auctionsWithFavorites = data.map((auction: Auction) => ({
          ...auction,
          isFavorite: favoriteIds.includes(auction.id),
        }));

        setAuctions(auctionsWithFavorites);
        setFilteredAuctions(auctionsWithFavorites);

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
      } catch (error: any) {
        console.error("Error fetching auctions:", error);
        setError(error.message || "Failed to load auctions");
      } finally {
        setLoading(false);
      }
    };

    fetchAuctions();
  }, []);

  useEffect(() => {
    // Apply all filters (search query, category, price range, favorites)
    const filtered = auctions.filter((auction) => {
      const matchesSearch = auction.title
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesCategory =
        selectedCategory === null || auction.itemType === selectedCategory;
      const matchesPrice =
        auction.currentPrice >= priceRange[0] &&
        auction.currentPrice <= priceRange[1];
      const matchesFavorite = !showFavoritesOnly || auction.isFavorite;

      return (
        matchesSearch && matchesCategory && matchesPrice && matchesFavorite
      );
    });

    setFilteredAuctions(filtered);
  }, [searchQuery, auctions, selectedCategory, priceRange, showFavoritesOnly]);

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedCategory(null);
    setPriceRange([0, maxPrice]);
    setShowFavoritesOnly(false);
    setIsFilterSheetOpen(false);
  };

  const toggleFavorite = async (auctionId: string) => {
    try {
      const auction = auctions.find((a) => a.id === auctionId);
      if (!auction) return;

      const newFavoriteStatus = !auction.isFavorite;

      // Optimistically update the UI
      setAuctions(
        auctions.map((a) =>
          a.id === auctionId ? { ...a, isFavorite: newFavoriteStatus } : a
        )
      );

      const response = await fetch(`/api/user/favorites/${auctionId}`, {
        method: newFavoriteStatus ? "POST" : "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Add this to ensure cookies are sent
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update favorite status");
      }

      toast.success(
        newFavoriteStatus ? "Added to favorites" : "Removed from favorites"
      );
    } catch (error: any) {
      console.error("Error toggling favorite:", error);

      // If unauthorized, redirect to login
      if (error.message === "Unauthorized") {
        toast.error("Please login to add favorites");
        return;
      }

      // Revert the optimistic update
      setAuctions((prevAuctions) =>
        prevAuctions.map((a) =>
          a.id === auctionId ? { ...a, isFavorite: !a.isFavorite } : a
        )
      );

      toast.error("Error updating favorites", {
        description: error.message || "Please try again later",
      });
    }
  };

  // Group auctions by status
  const activeAuctions = filteredAuctions.filter(auction => auction.status === "ACTIVE");
  const endedAuctions = filteredAuctions.filter(auction => auction.status === "ENDED");
  const favoriteAuctions = filteredAuctions.filter(auction => auction.isFavorite);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-6 min-h-[300px]">
        <div className="flex flex-col items-center">
          <Loader2 className="h-12 w-12 animate-spin text-indigo-500 mb-2" />
          <p className="text-gray-500">Loading auctions...</p>
        </div>
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

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h2 className="text-xl sm:text-2xl font-bold">Available Auctions</h2>
        
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200">
            {auctions.length} Total Auctions
          </Badge>
          <Badge variant="outline" className="bg-rose-50 text-rose-700 border-rose-200">
            {favoriteAuctions.length} Favorites
          </Badge>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
        <Card className="p-3 sm:p-4 bg-blue-50 border-blue-200">
          <h3 className="text-xs sm:text-sm font-medium text-blue-700">Active Auctions</h3>
          <p className="text-xl sm:text-2xl font-bold text-blue-800">
            {activeAuctions.length}
          </p>
        </Card>
        <Card className="p-3 sm:p-4 bg-amber-50 border-amber-200">
          <h3 className="text-xs sm:text-sm font-medium text-amber-700">Ended Auctions</h3>
          <p className="text-xl sm:text-2xl font-bold text-amber-800">
            {endedAuctions.length}
          </p>
        </Card>
        <Card className="p-3 sm:p-4 bg-rose-50 border-rose-200 col-span-2 sm:col-span-1">
          <h3 className="text-xs sm:text-sm font-medium text-rose-700">My Favorites</h3>
          <p className="text-xl sm:text-2xl font-bold text-rose-800">
            {favoriteAuctions.length}
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
                placeholder="Search auctions..."
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

              <div className="flex gap-2 w-full sm:w-1/2">
                {/* Favorites toggle */}
                <Toggle
                  pressed={showFavoritesOnly}
                  onPressedChange={setShowFavoritesOnly}
                  className="h-9 px-3 flex-1 data-[state=on]:text-rose-500 data-[state=on]:bg-rose-50 data-[state=on]:border-rose-200"
                  aria-label="Show favorites only"
                >
                  <Heart className="h-4 w-4 mr-2" />
                  Favorites
                </Toggle>

                {/* Reset button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetFilters}
                  className="flex items-center gap-1 h-9 px-3"
                >
                  <FilterX size={14} />
                  Reset
                </Button>
              </div>
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

      {/* Tabs for different auction views */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="w-full sm:w-auto grid grid-cols-3 sm:inline-flex mb-4">
          <TabsTrigger value="all" className="text-xs sm:text-sm">
            All ({filteredAuctions.length})
          </TabsTrigger>
          <TabsTrigger value="active" className="text-xs sm:text-sm">
            Active ({activeAuctions.length})
          </TabsTrigger>
          <TabsTrigger value="favorites" className="text-xs sm:text-sm">
            Favorites ({favoriteAuctions.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          {filteredAuctions.length === 0 ? (
            <div className="text-center p-6 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-gray-500">No auctions match your search criteria.</p>
              <Button
                variant="outline"
                onClick={resetFilters}
                className="mt-4"
              >
                Reset Filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {filteredAuctions.map((auction) => (
                <div key={auction.id} className="relative">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="absolute top-2 right-2 z-10 bg-white/80 rounded-full h-8 w-8 hover:bg-white shadow-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      toggleFavorite(auction.id);
                    }}
                  >
                    <Heart
                      className={`h-4 w-4 ${
                        auction.isFavorite
                          ? "fill-rose-500 text-rose-500"
                          : "text-gray-600"
                      }`}
                    />
                  </Button>
                  <AuctionCard auction={auction} />
                </div>
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
                <div key={auction.id} className="relative">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="absolute top-2 right-2 z-10 bg-white/80 rounded-full h-8 w-8 hover:bg-white shadow-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      toggleFavorite(auction.id);
                    }}
                  >
                    <Heart
                      className={`h-4 w-4 ${
                        auction.isFavorite
                          ? "fill-rose-500 text-rose-500"
                          : "text-gray-600"
                      }`}
                    />
                  </Button>
                  <AuctionCard auction={auction} />
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="favorites">
          {favoriteAuctions.length === 0 ? (
            <div className="text-center p-6 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-gray-500">You haven't added any auctions to your favorites yet.</p>
              <p className="text-sm text-gray-400 mt-2">Click the heart icon on any auction to add it to your favorites.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {favoriteAuctions.map((auction) => (
                <div key={auction.id} className="relative">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="absolute top-2 right-2 z-10 bg-white/80 rounded-full h-8 w-8 hover:bg-white shadow-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      toggleFavorite(auction.id);
                    }}
                  >
                    <Heart
                      className={`h-4 w-4 fill-rose-500 text-rose-500`}
                    />
                  </Button>
                  <AuctionCard auction={auction} />
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
