"use client";

import { FleetAssetType, FleetGroupBy } from "@/types/fleet";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { usePreferences } from "@/components/context/preferences-provider";

import { ListFilter } from "lucide-react";

interface FleetFilterDropdownProps {
  assetTypes: FleetAssetType[];
  onAssetTypesChange: (types: FleetAssetType[]) => void;

  /**
 * Optional: If set, the asset type is locked to this value
 * User cannot change it
 */
  lockedAssetType?: FleetAssetType;
}

export function FleetFilterDropdown({
  assetTypes,
  onAssetTypesChange,
  lockedAssetType,
}: FleetFilterDropdownProps) {
  const { preferences, updatePreferences } = usePreferences();

  // Grouping persisted in user preferences
  const groupBy: FleetGroupBy = preferences.fleet.grouping || "type";

  const handleGroupChange = async (value: FleetGroupBy) => {
    try {
      await updatePreferences({
        fleet: {
          ...preferences.fleet,
          grouping: value,
        },
      });
    } catch (error) {
      console.error("Failed to update group preference:", error);
    }
  };

  // Checkbox toggle (only works if not locked)
  const toggleAssetType = (type: FleetAssetType) => {
    if (lockedAssetType) return; // ignore toggle if locked

    onAssetTypesChange(
      assetTypes.includes(type)
        ? assetTypes.filter((t) => t !== type)
        : [...assetTypes, type]
    );
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="w-8 h-8">
          <ListFilter className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" sideOffset={12} className="min-w-56">
        {/* ================= GROUPING (radio) ================= */}
        <DropdownMenuLabel>Group by</DropdownMenuLabel>
        <DropdownMenuRadioGroup
          value={groupBy}
          onValueChange={(v) => handleGroupChange(v as FleetGroupBy)}
        >
          <DropdownMenuRadioItem value="type">Type</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="operator">Operator</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="icaoType">Aircraft Type</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>

        <DropdownMenuSeparator />

        {/* ================= ASSET TYPE (checkbox) ================= */}
        <DropdownMenuLabel>Fleet type</DropdownMenuLabel>
        <DropdownMenuCheckboxItem
          checked={assetTypes.includes("aircraft")}
          onCheckedChange={() => toggleAssetType("aircraft")}
          disabled={lockedAssetType !== undefined} // disable if locked
        >
          Aircraft
        </DropdownMenuCheckboxItem>

        <DropdownMenuCheckboxItem
          checked={assetTypes.includes("simulator")}
          onCheckedChange={() => toggleAssetType("simulator")}
          disabled={lockedAssetType !== undefined} // disable if locked
        >
          Simulator
        </DropdownMenuCheckboxItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}