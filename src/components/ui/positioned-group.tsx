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

interface PositionedItemProps extends React.HTMLAttributes<HTMLDivElement> {
  invalid?: boolean;
}

const PositionedItem = React.forwardRef<HTMLDivElement, PositionedItemProps>(
  ({ className, invalid, ...props }, ref) => {
    return (
      <div
        ref={ref}
        data-invalid={invalid || undefined}
        className={cn(
          "relative text-form-foreground hover:bg-muted/50 transition-colors h-12",
          // Red left border strip — subtle but clear
          "before:absolute before:inset-y-1 before:left-0.5 before:w-1 before:rounded-full before:transition-all before:duration-200",
          invalid
            ? "before:bg-destructive before:opacity-100"
            : "before:opacity-0",
          className
        )}
        {...props}
      />
    );
  }
);
PositionedItem.displayName = "PositionedItem";

export { PositionedGroup, PositionedItem };
