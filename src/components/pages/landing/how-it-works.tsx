"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";

// Recommended Resolution: 1080 x 2220 px (roughly a 9:18.5 ratio).
const mobileScreens = [
  { id: 1, src: "/screenshots/mobile-log.png", alt: "Mobile Log View" },
  { id: 2, src: "/screenshots/mobile-sync.png", alt: "Mobile Sync View" },
  { id: 3, src: "/screenshots/mobile-export.png", alt: "Mobile Export View" },
];

// Recommended Resolution: 2560 x 1600 px or 1920 x 1200 px.
const desktopScreens = [
  { id: 1, src: "/screenshots/desktop-dashboard.png", alt: "Desktop Dashboard" },
  { id: 2, src: "/screenshots/desktop-logs.png", alt: "Desktop Logbook" },
];

export default function HowItWorks() {
  const [view, setView] = useState<"mobile" | "desktop">("mobile");
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  React.useEffect(() => {
    if (!api) return;
    setCurrent(api.selectedScrollSnap());
    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  const screens = view === "mobile" ? mobileScreens : desktopScreens;

  return (
    <section id="how-it-works" className="py-24 bg-muted/30 overflow-hidden">
      <div className="container grid lg:grid-cols-12 gap-12 lg:gap-20 items-center">

        {/* Leading Side: Descriptions (4 columns on large screens) */}
        <div className="lg:col-span-5 space-y-10">
          <div className="flex flex-col items-start text-center gap-4">
            <h2 className="text-primary font-bold tracking-widest text-sm uppercase">How It Works</h2>

            <h2 className="text-4xl font-bold tracking-tight">Built for Pilots</h2>
            <p className="text-muted-foreground text-xl italic">
              &quot;A picture is worth a thousand words.&quot;
            </p>
          </div>

          <div className="space-y-8">
            {[
              { num: 1, title: "Log your flight", text: "Quick entry for all flight times and conditions designed for post-flight flow." },
              { num: 2, title: "Auto-sync", text: "Your data backups automatically to the cloud and stays in sync across all devices." },
              { num: 3, title: "Export", text: "Generate professional PDF logs ready for checkrides or airline applications." }
            ].map((item) => (
              <div key={item.num} className="flex gap-5">
                <div className="h-10 w-10 shrink-0 rounded-full bg-secondary text-white flex items-center justify-center font-bold text-lg shadow-md">
                  {item.num}
                </div>
                <div className="space-y-1">
                  <p className="font-bold text-lg leading-tight">{item.title}</p>
                  <p className="text-muted-foreground leading-relaxed">{item.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Trailing Side: Switcher & Device Carousel (7 columns for more width) */}
        <div className="lg:col-span-7 flex flex-col items-center">

          {/* Pill Switcher */}
          <div className="inline-flex p-1 bg-muted rounded-full shadow-inner border border-border mb-12">
            <button
              onClick={() => { setView("mobile"); api?.scrollTo(0); }}
              className={cn(
                "px-8 py-2.5 text-sm font-semibold rounded-full transition-all duration-300",
                view === "mobile"
                  ? "bg-background dark:bg-muted-foreground/20 text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Mobile
            </button>
            <button
              onClick={() => { setView("desktop"); api?.scrollTo(0); }}
              className={cn(
                "px-8 py-2.5 text-sm font-semibold rounded-full transition-all duration-300",
                view === "desktop"
                  ? "bg-background dark:bg-muted-foreground/20 text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Desktop
            </button>
          </div>

          {/* Carousel Container */}
          <div className="w-full flex flex-col items-center gap-8">
            <div
              className={cn(
                "relative bg-background border-4 border-zinc-200 dark:border-zinc-800 shadow-2xl transition-all duration-500 overflow-hidden",
                view === "mobile"
                  ? "w-full max-w-85 max-h-162.5 aspect-9/19 rounded-[3rem]"
                  : "w-full max-w-4xl aspect-16/10 rounded-2xl"
              )}
            >
              {/* Browser Header for Desktop View */}
              {view === "desktop" && (
                <div className="h-8 border-b bg-muted/50 flex items-center px-4 gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-full bg-red-400" />
                  <div className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                  <div className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                </div>
              )}

              <Carousel setApi={setApi} className="w-full h-full">
                <CarouselContent className="h-full">
                  {screens.map((screen) => (
                    <CarouselItem key={screen.id} className="h-full flex items-center justify-center bg-zinc-50 dark:bg-zinc-900">
                      {/* Using a placeholder div; replace with <Image /> tag later */}
                      <div className="text-center p-10">
                        <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest">{screen.alt}</p>
                        <p className="text-xs text-muted-foreground/60 mt-2">Screenshot Placeholder</p>
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
              </Carousel>
            </div>

            {/* Pagination Dots */}
            <div className="flex gap-3">
              {screens.map((_, i) => (
                <button
                  key={i}
                  onClick={() => api?.scrollTo(i)}
                  className={cn(
                    "h-2 transition-all duration-300 rounded-full",
                    current === i ? "bg-secondary w-10" : "bg-muted-foreground/30 w-2 hover:bg-muted-foreground/50"
                  )}
                  aria-label={`Go to screenshot ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}