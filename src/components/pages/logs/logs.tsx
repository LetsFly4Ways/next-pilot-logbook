"use client";

import { useState } from "react";
import Link from "next/link";


import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { CircleX, Plus, Search, X } from "lucide-react";
import { LogList } from "./list";

export default function LogsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);

  return (
    <div className="flex flex-col">
      <PageHeader title="Logs" showBackButton={false} isTopLevelPage={true} actionButton={
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
            {/* <DropdownMenu>
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
                    value={groupBy}
                    onValueChange={handleGroupChange}
                  >
                    <DropdownMenuRadioItem
                      value="type"
                      className="hover:bg-primary-foreground/60"
                    >
                      Type
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem
                      value="operator"
                      className="hover:bg-primary-foreground/60"
                    >
                      Operator
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem
                      value="icaoType"
                      className="hover:bg-primary-foreground/60"
                    >
                      Aircraft Type
                    </DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu> */}

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
      } />

      <div className="p-4 md:p-6">
        <LogList searchQuery={searchQuery} />
      </div>
    </div>
  )
}