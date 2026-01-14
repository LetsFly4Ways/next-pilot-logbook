"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

const PositionedGroup = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "relative flex flex-col rounded-lg overflow-hidden bg-form divide-y divide-y-form-border",
        className
      )}
      {...props}
    />
  );
});
PositionedGroup.displayName = "PositionedGroup";

const PositionedItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn("relative text-form-foreground h-12", className)}
      {...props}
    />
  );
});
PositionedItem.displayName = "PositionedItem";

export { PositionedGroup, PositionedItem };
