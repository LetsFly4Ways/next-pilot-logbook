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
import { readSelectContext, clearSelectContext, writeSelectContext } from "@/components/pages/logs/select/select-context";
import { PositionedGroup, PositionedItem } from "@/components/ui/positioned-group";

import { CircleX, Search, X, Check, ChevronRight } from "lucide-react";

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
        <PositionedGroup>
          <PositionedItem
            className="px-4 py-2 h-fit grid grid-cols-[1fr_auto] items-center gap-2 w-full cursor-pointer hover:bg-muted/50"
            onClick={() => {
              writeFlightFormSelection({
                type: "crew",
                payload: selfToSelectionPayload(),
              });
              // Update context to mark SELF as selected
              const context = readSelectContext();
              if (context) {
                writeSelectContext({
                  ...context,
                  current: "__SELF__",
                });
              }
              clearSelectContext();
              router.back();
            }}
          >
            <div className="min-w-0">
              <span className="font-medium shrink-0">SELF</span>
            </div>

            <div className="flex gap-2">
              {currentId === "__SELF__" && (
                <Check className="w-4 h-4 text-blue-500 shrink-0" />
              )}
              <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
            </div>
          </PositionedItem>
        </PositionedGroup>

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
