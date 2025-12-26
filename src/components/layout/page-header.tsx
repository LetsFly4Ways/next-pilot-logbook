"use client";

import { useEffect } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { useBannerTrailing } from "@/app/(protected)/app/layout";

import { ChevronLeft } from "lucide-react";

interface PageHeaderProps {
  title: string;
  backHref?: string;
  showBackButton?: boolean;
  isTopLevelPage?: boolean;
  actionButton?: React.ReactNode;
}

export function PageHeader({
  title,
  backHref = "/app/flights",
  showBackButton = true,
  isTopLevelPage = false,
  actionButton,
}: PageHeaderProps) {
  const setBannerContent = useBannerTrailing();

  // Set the top banner content with structured layout
  useEffect(() => {
    setBannerContent({
      left:
        !isTopLevelPage && showBackButton ? (
          <Button
            variant="ghost"
            size="icon"
            className="text-primary-foreground font-medium hover:text-muted-foreground hover:bg-transparent w-8 h-8"
            asChild
          >
            <Link href={backHref}>
              <ChevronLeft className="h-6 w-6" />
            </Link>
          </Button>
        ) : undefined,
      center: (
        <h2
          className="text-base font-semibold text-center overflow-hidden mx-2"
          style={{
            display: "-webkit-box",
            WebkitLineClamp: 1,
            WebkitBoxOrient: "vertical",
          }}
        >
          {title}
        </h2>
      ),
      right: actionButton || undefined,
    });
    return () => setBannerContent(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    title,
    backHref,
    showBackButton,
    isTopLevelPage,
    actionButton,
    setBannerContent,
  ]);

  return null;
}
