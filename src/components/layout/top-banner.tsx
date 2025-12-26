import React from "react";

import { cn } from "@/lib/utils";

import { useSidebar } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

import { X } from "lucide-react";

interface BannerContent {
  left?: React.ReactNode;
  center?: React.ReactNode;
  right?: React.ReactNode;
}

interface TopBannerProps {
  leading?: React.ReactNode;
  content?: BannerContent | null;
  className?: string;
}

export const TopBanner: React.FC<TopBannerProps> = ({
  leading,
  content,
  className,
}) => {
  const { state, isMobile } = useSidebar();
  const isCollapsed = state === "collapsed" && !isMobile;

  // Determine grid template - always use 3 columns for proper centering
  const getGridTemplate = () => {
    if (!content) return "";
    return "grid-cols-[auto_1fr_auto]";
  };

  return (
    <div
      className={cn(
        "w-full flex items-center h-12 bg-top text-primary-foreground",
        className
      )}
      style={{ minHeight: "3rem" }}
    >
      <div
        className={cn(
          "hidden md:flex items-center justify-start h-full transition-all duration-200",
          isCollapsed ? "w-auto min-w-0 px-2" : "w-64 min-w-64 max-w-64 px-4"
        )}
      >
        {leading}
      </div>
      <div
        className={cn(
          "flex-1 h-full w-full px-2 md:px-4 overflow-x-auto transition-all duration-200 relative",
          isCollapsed
            ? "flex items-center justify-between"
            : cn("grid items-center gap-2", getGridTemplate())
        )}
      >
        {content ? (
          <>
            {/* Left content - always visible, or empty spacer if no left content */}
            <div className={cn("flex items-center", !content.left && "w-8")}>
              {content.left}
            </div>
            {/* Center content - always visible, centered */}
            {content.center && (
              <div
                className={cn(
                  "flex items-center justify-center min-w-0",
                  isCollapsed && "absolute left-0 right-0 pointer-events-none"
                )}
              >
                <div className="pointer-events-auto">{content.center}</div>
              </div>
            )}
            {/* Right content - always visible, or empty spacer if no right content */}
            <div className={cn("flex items-center", !content.right && "w-8")}>
              {content.right}
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
};

interface MobileSidebarHeaderProps {
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
}

export const MobileSidebarHeader: React.FC<MobileSidebarHeaderProps> = ({
  leading,
  trailing,
}) => {
  const { setOpenMobile } = useSidebar();

  return (
    <div
      className="w-full flex items-center h-12 bg-top text-primary-foreground border-b border-border"
      style={{ minHeight: "3rem" }}
    >
      <div className="flex items-center justify-between h-full w-full px-4">
        <div className="flex items-center gap-2">{leading}</div>
        <div className="flex items-center gap-2">
          {trailing}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setOpenMobile(false)}
            className="h-10 w-10 text-primary-foreground"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close sidebar</span>
          </Button>
        </div>
      </div>
    </div>
  );
};
