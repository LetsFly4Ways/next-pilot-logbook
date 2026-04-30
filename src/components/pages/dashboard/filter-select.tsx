"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { Loader2 } from "lucide-react";

const filterOptions = [
  { value: "all", label: "All Time" },
  { value: "rolling_12m", label: "Last 12 Months" },
  { value: "rolling_90d", label: "Last 90 Days" },
  { value: "rolling_30d", label: "Last 30 Days" },
];

export function FilterSelect() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const currentFilter = searchParams.get("filter") || "all";

  const handleChange = (value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value === "all") {
      params.delete("filter");
    } else {
      params.set("filter", value);
    }

    startTransition(() => {
      router.push(`?${params.toString()}`);
    });
  };

  return (
    <div className="relative">
      <select
        value={currentFilter}
        onChange={(e) => handleChange(e.target.value)}
        disabled={isPending}
        className="bg-transparent border-none rounded px-3 py-1 text-sm focus:outline-none focus:ring-none disabled:text-transparent disabled:cursor-not-allowed"
        aria-busy={isPending}
      >
        {filterOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {isPending && (
        <div className="absolute inset-0 flex items-center justify-center bg-top rounded">
          <Loader2 className="h-4 w-4 animate-spin" />
        </div>
      )}
    </div>
  );
}