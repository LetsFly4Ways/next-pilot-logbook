import { Runway } from "@/types/airports";

import { PositionedGroup, PositionedItem } from "@/components/ui/positioned-group";
import { Skeleton } from "@/components/ui/skeleton";

import { Check, ChevronRight } from "lucide-react";

interface RunwaySelectRowProps {
  runway: Runway;
  selected: boolean;
  onSelect: () => void;
}

export default function RunwaySelectRow({
  runway,
  selected,
  onSelect,
}: RunwaySelectRowProps) {
  // Convert feet to meters and vice versa
  const convertUnit = (
    value: number | null,
    toMetric: boolean
  ): number | null => {
    if (value === null) return null;
    if (toMetric) {
      // Feet to meters
      return Math.round(value * 0.3048);
    } else {
      // Meters to feet
      return Math.round(value / 0.3048);
    }
  };

  return (
    <PositionedItem
      role="button"
      className="px-4 py-3 h-fit grid grid-cols-[auto_1fr_auto] items-center gap-3 w-full cursor-pointer"
      onClick={onSelect}
    >
      {/* Runway ident */}
      <div className="font-semibold text-lg min-w-15">
        {runway.ident}
      </div>

      {/* Runway Details */}
      <div className="min-w-0">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>{convertUnit(parseInt(runway.length_ft), true)}m × {convertUnit(parseInt(runway.width_ft), true)}m</span>
          <span>•</span>
          <span>{runway.surface}</span>
        </div>
      </div>

      {selected && (
        <Check className="w-4 h-4 text-blue-500 shrink-0" />
      )}
    </PositionedItem>
  );
}

export function RunwaySelectRowSkeleton() {
  return (
    <PositionedGroup>
      {Array.from({ length: 2 }).map((_, index) => (
        <PositionedItem
          className="px-4 py-2 h-15 flex items-center justify-between gap-2 cursor-pointer hover:bg-muted/50 transition-colors w-full"
          key={index}
        >
          <div className="flex-1 min-w-0 space-y-2">
            <Skeleton className="h-4 w-32" />
          </div>
          <div className="font-medium text-sm flex items-center gap-2 shrink-0">
            <Skeleton className="h-4 w-4" />
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </div>
        </PositionedItem>
      ))}

    </PositionedGroup>
  )
}