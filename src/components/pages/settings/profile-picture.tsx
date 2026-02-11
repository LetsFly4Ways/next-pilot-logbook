"use client";

import type React from "react";
import { useState, useRef } from "react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Camera, X, Loader2 } from "lucide-react";

interface ProfilePictureProps {
  src?: string;
  alt?: string;
  size?: "sm" | "md" | "lg" | "xl";
  onImageChange?: (file: File) => void;
  onImageDelete?: () => void;
  disabled?: boolean;
  isProcessing?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: "size-16",
  md: "size-18",
  lg: "size-24",
  xl: "size-32",
};

export function ProfilePicture({
  src,
  alt = "User",
  size = "lg",
  onImageChange,
  onImageDelete,
  disabled = false,
  isProcessing = false,
  className,
}: ProfilePictureProps) {
  const [isHovered, setIsHovered] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const initials = alt.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div
      className={cn("relative group", sizeClasses[size], className)}
      onMouseEnter={() => !disabled && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Avatar className="size-full shadow-sm border border-border">
        <AvatarImage src={src} alt={alt} className="object-cover" />
        <AvatarFallback className="bg-muted text-muted-foreground font-semibold text-xl">
          {initials || "?"}
        </AvatarFallback>
      </Avatar>

      {/* Loading Spinner Overlay */}
      {isProcessing && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/50 backdrop-blur-[1px] rounded-full">
          <Loader2 className="animate-spin size-6 text-primary" />
        </div>
      )}

      {!disabled && !isProcessing && (
        <>
          <div
            className={cn(
              "absolute inset-0 bg-black/40 rounded-full flex items-center justify-center transition-opacity duration-200 cursor-pointer",
              isHovered ? "opacity-100" : "opacity-0"
            )}
            onClick={() => fileInputRef.current?.click()}
          >
            <Camera className="text-white size-6" />
          </div>

          {src && isHovered && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onImageDelete?.();
              }}
              className="absolute -top-1 -right-1 size-7 rounded-full bg-destructive text-destructive-foreground shadow-md flex items-center justify-center hover:bg-destructive/90 transition-colors"
            >
              <X className="size-4" />
            </button>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => e.target.files?.[0] && onImageChange?.(e.target.files[0])}
            className="hidden"
          />
        </>
      )}
    </div>
  );
}