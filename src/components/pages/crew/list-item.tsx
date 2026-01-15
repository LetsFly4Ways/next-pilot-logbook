import { useRouter } from "next/navigation";

import { Crew } from "@/types/crew";
import { PositionedItem } from "@/components/ui/positioned-group";
import { ChevronRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface ListItemProps {
  crew: Crew;
  nameDisplay: "first-last" | "last-first";
}

export default function CrewListItem({ crew, nameDisplay }: ListItemProps) {
  const router = useRouter();

  // Format name based on preference
  const fullName =
    nameDisplay === "last-first"
      ? `${crew.last_name}, ${crew.first_name}`.trim()
      : `${crew.first_name} ${crew.last_name}`.trim();

  return (
    <PositionedItem
      className="px-4 py-2 h-fit grid grid-cols-[1fr_auto] items-center gap-2 w-full cursor-pointer"
      onClick={() => router.push(`/app/crew/${crew.id}`)}
    >
      {/* LEFT COLUMN */}
      <div className="min-w-0">
        <span className="font-medium shrink-0">{fullName}</span>
      </div>

      {/* RIGHT COLUMN */}
      <ChevronRight className="w-4 h-4 text-muted-foreground" />
    </PositionedItem>
  );
}

export function CrewListItemSkeleton() {
  return (
    <PositionedItem className="px-4 py-2 flex items-center justify-between gap-2 cursor-pointer hover:bg-muted/50 transition-colors w-full">
      <div className="flex-1 min-w-0">
        <Skeleton className="h-4 w-1/3" />
      </div>
      <ChevronRight className="w-4 h-4 text-muted-foreground" />
    </PositionedItem>
  );
}
