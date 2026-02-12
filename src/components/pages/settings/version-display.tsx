"use client";

import { useRouter } from "next/navigation";
import { getAppVersion } from "@/lib/version";
import { ChevronRight } from "lucide-react";
import { PositionedItem } from "@/components/ui/positioned-group";

export function VersionDisplay() {
  const router = useRouter();
  const version = getAppVersion();
  const isProduction = process.env.NODE_ENV === "production";

  const handleClick = () => {
    if (isProduction && version !== "Development") {
      router.push(`/app/settings/release-notes#${version}`);
    }
  };

  return (
    <PositionedItem
      className={`p-3 flex items-center justify-between select-none ${isProduction ? "cursor-pointer hover:bg-muted/70" : ""
        }`}
      onClick={handleClick}
    >
      <span className="text-sm font-medium text-foreground">Version</span>
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">{version}</span>
        {isProduction && version !== "Development" && (
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        )}
      </div>
    </PositionedItem>
  );
}