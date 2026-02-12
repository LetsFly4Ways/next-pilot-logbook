"use client";

import type React from "react";
import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Camera, X, Loader2, AlertCircle } from "lucide-react";

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

// 3MB Limit
const MAX_FILE_SIZE = 3;

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
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Clear error automatically after 4 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const initials = alt
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 1. Check File Size
    if (file.size > (MAX_FILE_SIZE * 1024 * 1024)) {
      setError(`Image must be smaller than ${MAX_FILE_SIZE}MB`);
      // Reset input so the same file can be picked again later
      e.target.value = "";
      return;
    }

    // 2. Clear previous errors and propagate
    setError(null);
    onImageChange?.(file);
    e.target.value = "";
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        className={cn("relative group", sizeClasses[size], className)}
        onMouseEnter={() => !disabled && setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Avatar className={cn(
          "size-full shadow-sm border transition-colors",
          error ? "border-destructive" : "border-border"
        )}>
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
            {/* Hover Overlay */}
            <div
              className={cn(
                "absolute inset-0 bg-black/40 rounded-full flex items-center justify-center transition-opacity duration-200 cursor-pointer",
                isHovered ? "opacity-100" : "opacity-0"
              )}
              onClick={() => fileInputRef.current?.click()}
            >
              <Camera className="text-white size-6" />
            </div>

            {/* Delete Button */}
            {src && isHovered && (
              <button
                type="button"
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
              onChange={handleFileChange}
              className="hidden"
            />
          </>
        )}
      </div>

      {/* Error Message Div */}
      {error && (
        <div className="flex items-center gap-1.5 text-destructive animate-in fade-in slide-in-from-top-1">
          <AlertCircle className="size-3.5" />
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}
    </div>
  );
}