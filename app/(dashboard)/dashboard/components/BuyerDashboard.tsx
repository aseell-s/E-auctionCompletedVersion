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
import { Search, FilterX, Heart } from "lucide-react";
import { Toggle } from "@/components/ui/toggle";
import { toast } from "sonner";

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
  itemType?: string; // Changed from category to itemType
  isFavorite?: boolean; // Whether the current user has favorited this auction
}

export function BuyerDashboard() {
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [filteredAuctions, setFilteredAuctions] = useState<Auction[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  // New filter states
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000]);
  const [categories, setCategories] = useState<string[]>([]);
  const [maxPrice, setMaxPrice] = useState<number>(100000);

  useEffect(() => {
    const fetchAuctions = async () => {
      try {
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
        console.log("auctions: ", auctionsWithFavorites);
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
      } catch (error) {
        console.error("Error fetching auctions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAuctions();
  }, []);

  useEffect(() => {
    console.log("selectedCategory: ", selectedCategory);
  }, [selectedCategory]);

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

  if (loading) {
    return (
      <div className="text-center p-6">
        <p>Loading auctions...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
        <h2 className="text-2xl font-bold">Available Auctions</h2>
      </div>

      <Card className="p-3">
        <div className="flex flex-wrap gap-3">
          {/* Search input */}
          <div className="relative flex-grow min-w-[200px]">
            <Search
              className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={16}
            />
            <Input
              type="text"
              placeholder="Search auctions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9"
            />
          </div>

          {/* Category filter */}
          <div className="w-full md:w-auto min-w-[180px]">
            <Select
              value={selectedCategory || undefined}
              onValueChange={(value) =>
                setSelectedCategory(value === "all" ? null : value)
              }
            >
              <SelectTrigger className="h-9">
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

          {/* Favorites toggle */}
          <Toggle
            pressed={showFavoritesOnly}
            onPressedChange={setShowFavoritesOnly}
            className="h-9 px-3 data-[state=on]:text-rose-500 data-[state=on]:bg-rose-50 data-[state=on]:border-rose-200"
            aria-label="Show favorites only"
          >
            <Heart className="h-4 w-4 mr-2" />
            Favorites
          </Toggle>

          {/* Reset button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={resetFilters}
            className="flex items-center gap-1 h-9 px-3"
          >
            <FilterX size={14} />
            Reset
          </Button>
        </div>

        {/* Price range */}
        <div className="mt-3 px-1">
          <div className="flex justify-between text-sm text-muted-foreground mb-1.5">
            <span>Price: ${priceRange[0]}</span>
            <span>${priceRange[1]}</span>
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
          />
        </div>
      </Card>

      {filteredAuctions.length === 0 ? (
        <div className="text-center p-4 bg-muted rounded-lg mt-2">
          <p className="text-muted-foreground">
            No auctions match your search criteria. Try adjusting your filters.
          </p>
        </div>
      ) : (
        <div>
          <p className="text-xs text-muted-foreground my-2">
            Showing {filteredAuctions.length} of {auctions.length} auctions
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAuctions.map((auction) => (
              <div key={auction.id} className="relative">
                <Button
                  size="icon"
                  variant="ghost"
                  className="absolute top-2 right-2 z-10 bg-white/80 rounded-full h-8 w-8 hover:bg-white"
                  onClick={() => toggleFavorite(auction.id)}
                >
                  <Heart
                    className={`h-5 w-5 ${
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
        </div>
      )}
    </div>
  );
}
