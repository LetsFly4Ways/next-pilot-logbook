"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { SortBy } from "@/types/airports";

import { PageHeader } from "@/components/layout/page-header";
import { AirportsList } from "@/components/pages/airports/list";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { readSelectContext, writeSelectContext } from "@/components/pages/logs/select/select-context";

import { CircleX, ListFilter, Search, X } from "lucide-react";

export default function AirportSelectList() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortBy>("country");
  const [showSearch, setShowSearch] = useState(false);
  const [role] = useState<"departure" | "destination">(() => {
    const context = readSelectContext();
    return context?.role ?? "departure";
  });
  const [currentIcao] = useState<string | null>(() => {
    const context = readSelectContext();
    return context?.current ?? null;
  });
  const [returnHref] = useState<string>(() => {
    const context = readSelectContext();
    return context?.return ?? "/app/logs/flight/new";
  });

  const title =
    role === "departure" ? "Select departure airport" : "Select destination airport";

  const buildDetailUrl = (icao: string) => {
    // Update context with selected airport before navigating
    const context = readSelectContext();
    if (context) {
      writeSelectContext({
        ...context,
        current: icao,
        runway: null, // Clear runway when switching airports
      });
    }
    return `/app/logs/flight/airport-select/${icao}`;
  };

  return (
    <div className="flex flex-col">
      <PageHeader
        title={title}
        backHref={returnHref}
        showBackButton
        isTopLevelPage={false}
        actionButton={
          showSearch ? (
            <div className="relative flex items-center gap-2">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-8 w-48 md:w-64 pl-8 pr-8"
                  autoFocus
                />
                <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                {searchQuery && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-8 w-8 hover:bg-transparent cursor-pointer"
                    onClick={() => setSearchQuery("")}
                  >
                    <CircleX className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="text-primary-foreground font-medium hover:text-muted-foreground hover:bg-transparent w-8 h-8 cursor-pointer"
                onClick={() => {
                  setShowSearch(false);
                  setSearchQuery("");
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-primary-foreground font-medium hover:text-muted-foreground hover:bg-transparent w-8 h-8 cursor-pointer"
                >
                  <ListFilter className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-md"
                align="end"
                sideOffset={12}
              >
                <DropdownMenuLabel>Sort by</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuRadioGroup
                  value={sortBy}
                  onValueChange={(value) => setSortBy(value as SortBy)}
                >
                  <DropdownMenuRadioItem value="country">
                    Country
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="icao">
                    ICAO
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="iata">
                    IATA
                  </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          )
        }
      />
      <AirportsList
        searchQuery={searchQuery}
        sortBy={sortBy}
        showFavoritesOnly={false}
        selectedIcao={currentIcao}
        onSelect={(airport) => router.push(buildDetailUrl(airport.icao))}
      />
    </div>
  );
}
