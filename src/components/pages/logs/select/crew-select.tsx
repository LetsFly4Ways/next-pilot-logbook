"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { CrewList } from "@/components/pages/crew/list";
import { PageHeader } from "@/components/layout/page-header";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  writeFlightFormSelection,
  crewToSelectionPayload as flightCrewToSelectionPayload,
  selfToSelectionPayload as flightSelfToSelectionPayload,
} from "@/components/pages/logs/select/flight-form-selection";
import {
  writeSimulatorFormSelection,
  crewToSelectionPayload as simulatorCrewToSelectionPayload,
  selfToSelectionPayload as simulatorSelfToSelectionPayload,
} from "@/components/pages/logs/select/simulator-form-selection";
import { readSelectContext, clearSelectContext } from "@/components/pages/logs/select/select-context";
import { PositionedGroup, PositionedItem } from "@/components/ui/positioned-group";

import { CircleX, Search, X, Check, ChevronRight } from "lucide-react";

interface CrewSelectProps {
  logType: "flight" | "simulator";
}

export default function CrewSelect({ logType }: CrewSelectProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [currentId, setCurrentId] = useState<string | null>(() => {
    const context = readSelectContext(logType);
    return context?.current ?? null;
  });

  useEffect(() => {
    const t = setInterval(() => {
      const context = readSelectContext(logType);
      const val = context?.current ?? null;
      if (val !== currentId) setCurrentId(val);
    }, 100);
    const timeout = setTimeout(() => clearInterval(t), 2000);
    return () => {
      clearInterval(t);
      clearTimeout(timeout);
    };
  }, [logType, currentId]);
  const [returnHref] = useState<string>(() => {
    const context = readSelectContext(logType);
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
              if (logType === "simulator") {
                writeSimulatorFormSelection({
                  type: "crew",
                  payload: simulatorSelfToSelectionPayload(),
                });
              } else {
                writeFlightFormSelection({
                  type: "crew",
                  payload: flightSelfToSelectionPayload(),
                });
              }
              clearSelectContext(logType);
              router.push(returnHref);
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
            if (logType === "simulator") {
              writeSimulatorFormSelection({
                type: "crew",
                payload: simulatorCrewToSelectionPayload(crew),
              });
            } else {
              writeFlightFormSelection({
                type: "crew",
                payload: flightCrewToSelectionPayload(crew),
              });
            }
            clearSelectContext(logType);
            router.push(returnHref);
          }}
        />
      </div>
    </div>
  );
}
