"use client";

import * as React from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";

interface CarouselWithDotsProps {
  items: React.ReactNode[];
  className?: string;
}

export function CarouselWithDots({
  items,
  className,
}: CarouselWithDotsProps) {
  const [api, setApi] = React.useState<CarouselApi>();
  const [current, setCurrent] = React.useState(0);

  React.useEffect(() => {
    if (!api) return;
    setCurrent(api.selectedScrollSnap());
    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  const scrollTo = (index: number) => api?.scrollTo(index);

  return (
    <div className={cn("flex flex-col w-full gap-8", className)}>
      <Carousel setApi={setApi} className="w-full">
        <CarouselContent>
          {items.map((item, index) => (
            <CarouselItem key={index} className="pl-4">
              {item}
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>

      {/* Minimalist Dots Indicator */}
      <div className="flex items-center justify-center gap-2">
        {items.map((_, index) => (
          <button
            key={index}
            onClick={() => scrollTo(index)}
            className={cn(
              "h-1.5 transition-all duration-300 rounded-full",
              current === index
                ? "bg-secondary w-8"
                : "bg-muted-foreground/20 w-2 hover:bg-muted-foreground/40"
            )}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}