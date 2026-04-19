"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import CenterSpinner from "@/components/ui/center-spinner";

interface DashboardLoadingWrapperProps {
  children: React.ReactNode;
}

export function DashboardLoadingWrapper({ children }: DashboardLoadingWrapperProps) {
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [previousFilter, setPreviousFilter] = useState<string | null>(null);

  const currentFilter = searchParams.get("filter") || "all";

  useEffect(() => {
    if (previousFilter !== null && previousFilter !== currentFilter) {
      setIsLoading(true);
      // Keep loading for at least 500ms to ensure smooth transition
      const timer = setTimeout(() => setIsLoading(false), 500);
      return () => clearTimeout(timer);
    }
    setPreviousFilter(currentFilter);
  }, [currentFilter, previousFilter]);

  if (isLoading) {
    return (
      <div className="relative">
        <div className="absolute inset-0 bg-background/50 backdrop-blur-sm z-10 flex items-center justify-center rounded-lg">
          <CenterSpinner />
        </div>
        <div className="opacity-50 pointer-events-none">
          {children}
        </div>
      </div>
    );
  }

  return <>{children}</>;
}