"use client";

import { useState } from "react";
import Link from "next/link";

import { FleetAssetType } from "@/types/fleet";

import { usePreferences } from "@/components/context/preferences-provider";

import { PageHeader } from "@/components/layout/page-header";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FleetList } from "@/components/pages/fleet/list";
import { FleetFilterDropdown } from "@/components/pages/fleet/fleet-filter-dropdown";


import { CircleX, Plus, Search, X } from "lucide-react";

export default function FleetPage() {
  const { preferences } = usePreferences();
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);

  const [assetTypes, setAssetTypes] = useState<FleetAssetType[]>([
    "aircraft",
    "simulator",
  ]);

  return (
    <div className="flex flex-col">
      <PageHeader
        title="Fleet"
        backHref="/"
        showBackButton={false}
        isTopLevelPage={true}
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
            <div className="relative flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="text-primary-foreground font-medium hover:text-muted-foreground hover:bg-transparent w-8 h-8 cursor-pointer"
                onClick={() => setShowSearch(true)}
              >
                <Search className="h-4 w-4" />
              </Button>

              {/* Filter Dropdown */}
              <FleetFilterDropdown
                assetTypes={assetTypes}
                onAssetTypesChange={setAssetTypes}
              />

              <Button
                variant="ghost"
                className="text-primary-foreground font-medium hover:text-muted-foreground hover:bg-transparent w-8 h-8 cursor-pointer"
              >
                <Link href="/app/fleet/new">
                  <Plus className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          )
        }
      />

      <div className="p-4 md:p-6">
        <FleetList searchQuery={searchQuery} groupBy={preferences.fleet.grouping || "type"} assetTypes={assetTypes} />
      </div>
    </div>
  );
}
