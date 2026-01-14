"use client";

import { useState } from "react";

import { toggleFavoriteAirport } from "@/actions/pages/airports/favorites";

import { Button } from "@/components/ui/button";

import { Star } from "lucide-react";

interface FavoriteButtonProps {
  icao: string;
  initialIsFavorited: boolean;
}

export function FavoriteButton({
  icao,
  initialIsFavorited,
}: FavoriteButtonProps) {
  const [isFavorited, setIsFavorited] = useState(initialIsFavorited);
  const [isLoading, setIsLoading] = useState(false);

  const handleToggle = async () => {
    setIsLoading(true);

    // Optimistic update
    setIsFavorited(!isFavorited);

    try {
      const result = await toggleFavoriteAirport(icao);

      if (result.success) {
        setIsFavorited(result.isFavorited);
      } else {
        // Revert on error
        setIsFavorited(isFavorited);
        console.error("Failed to toggle favorite:", result.error);
      }
    } catch (error) {
      // Revert on error
      setIsFavorited(isFavorited);
      console.error("Error toggling favorite:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleToggle}
      disabled={isLoading}
      className="text-primary-foreground font-medium hover:text-muted-foreground hover:bg-transparent w-8 h-8 cursor-pointer disabled:opacity-50"
      title={isFavorited ? "Remove from favorites" : "Add to favorites"}
    >
      <Star
        className={`h-4 w-4 ${
          isFavorited ? "fill-yellow-400 text-yellow-400" : ""
        }`}
      />
    </Button>
  );
}
