"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";

import { APPROACHES } from "@/lib/approach-types";

import { PageHeader } from "@/components/layout/page-header";
import { PositionedGroup, PositionedItem } from "@/components/ui/positioned-group";
import { writeFlightFormSelection } from "@/components/pages/logs/select/flight-form-selection";
import { readSelectContext, clearSelectContext } from "@/components/pages/logs/select/select-context";
import { Button } from "@/components/ui/button";

import { Check, ChevronRight } from "lucide-react";

export default function ApproachSelect() {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(() => {
    const context = readSelectContext("flight");
    if (context?.selected) {
      const titles = context.selected.split("|").filter(Boolean);
      return new Set(titles);
    }
    return new Set();
  });
  const [returnHref] = useState<string>(() => {
    const context = readSelectContext("flight");
    return context?.return ?? "/app/logs/flight/new";
  });

  const toggle = (title: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(title)) {
        next.delete(title);
      } else {
        next.add(title);
      }
      return next;
    });
  };

  const handleSelect = () => {
    writeFlightFormSelection({
      type: "approaches",
      payload: Array.from(selected),
    });
    clearSelectContext("flight");
    router.push(returnHref);
  };

  const grouped = useMemo(() => {
    const byType: Record<string, typeof APPROACHES> = {};
    for (const a of APPROACHES) {
      const t = a.type ?? "other";
      if (!byType[t]) byType[t] = [];
      byType[t].push(a);
    }
    return byType;
  }, []);

  const typeOrder = ["precision", "non-precision", "visual", "other"];

  return (
    <div className="flex flex-col">
      <PageHeader
        title="Select approaches"
        backHref={returnHref}
        showBackButton
        isTopLevelPage={false}
        actionButton={
          <Button
            variant="ghost"
            className="text-primary-foreground font-medium hover:text-muted-foreground hover:bg-transparent w-8 h-8 cursor-pointer"
            onClick={handleSelect}
          >
            Select
          </Button>
        }
      />

      <div className="p-4 md:p-6 space-y-6">
        {typeOrder.map((typeKey) => {
          const list = grouped[typeKey];
          if (!list?.length) return null;
          const label =
            typeKey === "non-precision"
              ? "Non-precision"
              : typeKey.charAt(0).toUpperCase() + typeKey.slice(1);
          return (
            <div key={typeKey}>
              <h3 className="text-sm font-semibold mb-2 text-muted-foreground uppercase tracking-wide sticky top-0 bg-background py-1">
                {label}
              </h3>
              <PositionedGroup>
                {list.map((a) => (
                  <PositionedItem
                    key={a.title}
                    role="button"
                    className="px-4 py-2 h-fit grid grid-cols-[1fr_auto] items-center gap-2 w-full cursor-pointer hover:bg-muted/50"
                    onClick={() => toggle(a.title)}
                  >
                    <span className="font-medium">{a.title}</span>

                    <div className="flex gap-2">
                      {selected.has(a.title) && (
                        <Check className="w-4 h-4 text-blue-500 shrink-0" />
                      )}
                      <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                    </div>
                  </PositionedItem>
                ))}
              </PositionedGroup>
            </div>
          );
        })}
      </div>
    </div>
  );
}
