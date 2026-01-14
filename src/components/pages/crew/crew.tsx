"use client";

import { useState } from "react";

import { PageHeader } from "@/components/layout/page-header";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { CircleX, Plus, Search, X } from "lucide-react";
import { CrewList } from "./list";
import Link from "next/link";

export default function CrewPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);

  return (
    <div className="flex flex-col">
      <PageHeader
        title="Crew"
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

              <Button
                variant="ghost"
                className="text-primary-foreground font-medium hover:text-muted-foreground hover:bg-transparent w-8 h-8 cursor-pointer"
              >
                <Link href="/app/crew/new">
                  <Plus className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          )
        }
      />

      <div className="p-4 md:p-6">
        <CrewList searchQuery={searchQuery} />
      </div>
    </div>
  );
}
