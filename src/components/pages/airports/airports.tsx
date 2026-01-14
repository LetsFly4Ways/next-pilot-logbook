"use client";

import { useState } from "react";

import { SortBy } from "@/types/airports";

import { PageHeader } from "@/components/layout/page-header";
import { AirportsList } from "@/components/pages/airports/list";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";

import { CircleX, ListFilter, Search, X } from "lucide-react";

export default function AirportsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortBy>("country");
  const [showSearch, setShowSearch] = useState(false);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  return (
    <div className="flex flex-col">
      <PageHeader
        title="Airports"
        backHref="/"
        showBackButton={false}
        isTopLevelPage={true}
        actionButton={
          <div className="">
            {/* Search Button/Input */}
            {showSearch ? (
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
              <div className="flex gap-2 items-center">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-primary-foreground font-medium hover:text-muted-foreground hover:bg-transparent w-8 h-8 cursor-pointer"
                  onClick={() => setShowSearch(true)}
                >
                  <Search className="h-4 w-4" />
                </Button>

                {/* Filter Dropdown */}
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
                    <DropdownMenuGroup>
                      <DropdownMenuLabel>Sort by</DropdownMenuLabel>

                      <DropdownMenuSeparator />

                      <DropdownMenuRadioGroup
                        value={sortBy}
                        onValueChange={(value) => setSortBy(value as SortBy)}
                      >
                        <DropdownMenuRadioItem
                          value="country"
                          className="hover:bg-primary-foreground/60"
                        >
                          Country
                        </DropdownMenuRadioItem>
                        <DropdownMenuRadioItem
                          value="icao"
                          className="hover:bg-primary-foreground/60"
                        >
                          ICAO
                        </DropdownMenuRadioItem>
                        <DropdownMenuRadioItem
                          value="iata"
                          className="hover:bg-primary-foreground/60"
                        >
                          IATA
                        </DropdownMenuRadioItem>
                      </DropdownMenuRadioGroup>
                    </DropdownMenuGroup>

                    {/* Future: Add filter options */}
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                      <DropdownMenuCheckboxItem
                        checked={showFavoritesOnly}
                        onCheckedChange={setShowFavoritesOnly}
                      >
                        Favourites
                      </DropdownMenuCheckboxItem>
                    </DropdownMenuGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </div>
        }
      />
      <AirportsList
        searchQuery={searchQuery}
        sortBy={sortBy}
        showFavoritesOnly={showFavoritesOnly}
      />
    </div>
  );
}
