import { useRouter } from "next/navigation";

import { Fleet } from "@/types/fleet";

import { PositionedItem } from "@/components/ui/positioned-group";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

import { ChevronRight } from "lucide-react";

interface ListItemProps {
  fleet: Fleet;
}

export default function FleetListItem({ fleet }: ListItemProps) {
  const router = useRouter();

  return (
    <PositionedItem
      className="px-4 py-2 h-fit grid grid-cols-[1fr_auto] items-center gap-2 w-full cursor-pointer"
      onClick={() => router.push(`/app/fleet/${fleet.id}`)}
    >
      {/* LEFT COLUMN */}
      <div className="flex gap-2 min-w-0">
        <span className="font-medium shrink-0">{fleet.registration}</span>
        {fleet.model && <Badge
          variant="outline"
          className="rounded flex items-center"
        >{fleet.model}</Badge>}
      </div>

      {/* RIGHT COLUMN */}
      <ChevronRight className="w-4 h-4 text-muted-foreground" />
    </PositionedItem>
  );
}

export function FleetListItemSkeleton() {
  return (
    <PositionedItem className="px-4 py-2 flex items-center justify-between gap-2 cursor-pointer hover:bg-muted/50 transition-colors w-full">
      <div className="flex-1 min-w-0">
        <Skeleton className="h-4 w-1/2" />
      </div>
      <ChevronRight className="w-4 h-4 text-muted-foreground" />
    </PositionedItem>
  );
}
