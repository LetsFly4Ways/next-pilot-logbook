"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { CrewList } from "@/components/pages/crew/list";
import { PageHeader } from "@/components/layout/page-header";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  writeFlightFormSelection,
  crewToSelectionPayload,
  selfToSelectionPayload,
} from "@/components/pages/logs/select/flight-form-selection";
import { readSelectContext, clearSelectContext } from "@/components/pages/logs/select/select-context";

import { CircleX, Search, X } from "lucide-react";

export default function CrewSelect() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [currentId] = useState<string | null>(() => {
    const context = readSelectContext();
    return context?.current ?? null;
  });
  const [returnHref] = useState<string>(() => {
    const context = readSelectContext();
    return context?.return ?? "/app/logs/flight/new";
  });

  return (
    <div className="flex flex-col">
      <PageHeader
        title="Select PIC"
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
            <Button
              variant="ghost"
              size="icon"
              className="text-primary-foreground font-medium hover:text-muted-foreground hover:bg-transparent w-8 h-8 cursor-pointer"
              onClick={() => setShowSearch(true)}
            >
              <Search className="h-4 w-4" />
            </Button>
          )
        }
      />

      <div className="p-4 md:p-6 space-y-4">
        <Button
          variant="outline"
          className="w-full justify-start"
          onClick={() => {
            writeFlightFormSelection({
              type: "crew",
              payload: selfToSelectionPayload(),
            });
            clearSelectContext();
            router.back();
          }}
        >
          <span className="font-medium">Self</span>
        </Button>

        <CrewList
          searchQuery={searchQuery}
          selectedId={currentId ?? undefined}
          onSelect={(crew) => {
            writeFlightFormSelection({
              type: "crew",
              payload: crewToSelectionPayload(crew),
            });
            clearSelectContext();
            router.back();
          }}
        />
      </div>
    </div>
  );
}
