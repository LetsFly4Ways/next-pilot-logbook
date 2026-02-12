"use client";

import { useTheme } from "next-themes";
import { ChevronsUpDown } from "lucide-react";
import { PositionedItem } from "@/components/ui/positioned-group";

type Theme = "light" | "dark" | "system";

export function ThemeSelect() {
  const { theme, setTheme } = useTheme();

  return (
    <PositionedItem className="p-3 flex items-center justify-between">
      <span className="text-sm font-medium w-36">
        Appearance
      </span>

      <div className="w-full ml-10 flex items-center justify-end">
        <select
          className="appearance-none rounded-md w-full max-w-48 bg-transparent text-sm pr-8 py-1 border-none focus:ring-0 focus:border-none text-foreground cursor-pointer"
          style={{ textAlign: "right" }}
          value={theme}
          onChange={(e) => setTheme(e.target.value as Theme)}
        >
          <option value="light">Light</option>
          <option value="dark">Dark</option>
          <option value="system">System</option>
        </select>
        <ChevronsUpDown className="absolute right-3 w-4 h-4 pointer-events-none text-muted-foreground" />
      </div>
    </PositionedItem>
  );
}