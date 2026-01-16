"use client";

import { useRouter } from "next/navigation";

import { AircraftType } from "@/types/aircraft-type";

import { PositionedItem } from "@/components/ui/positioned-group";
import { saveSelectedAircraft } from "@/components/pages/fleet/type-select/selected-aircraft-type";

import { ChevronRight } from "lucide-react";

interface Props {
  type: AircraftType;
}

export default function AircraftTypeItem({ type }: Props) {
  const router = useRouter();

  const handleSelect = () => {
    saveSelectedAircraft(type);
    router.back();
  };

  return (
    <PositionedItem
      role="button"
      key={`${type.Manufacturer}-${type.Type}-${type.Model}`}
      className="px-4 py-2 h-fit grid grid-cols-[1fr_auto] items-center gap-2 w-full cursor-pointer"
      onClick={handleSelect}
    >
      <div>
        <div className="font-medium">{type.Type}</div>
        <div className="text-sm text-muted-foreground">
          {type.Manufacturer} · {type.Model}
        </div>
      </div>

      <ChevronRight className="h-4 w-4 text-muted-foreground" />
    </PositionedItem>
  );
}
