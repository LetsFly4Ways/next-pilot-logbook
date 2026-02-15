"use client";

import { CarouselWithDots } from "@/components/layout/carousel";

import { Clock, Globe, Shield } from "lucide-react";

const features = [
  {
    title: "Open & Free",
    description: "Transparent, open-source code. No subscriptions, forever free. Start hosting it now!",
    icon: <Globe className="h-6 w-6" />
  },
  {
    title: "Smart Totals",
    description: "The things that really matter. Automatically calculate and track your flight hours, including night, IFR, and PIC time.",
    icon: <Clock className="h-6 w-6" />,
  },
  {
    title: "You Have Control",
    description: "Your data is yours to keep. Full privacy and control over your records.",
    icon: <Shield className="h-6 w-6" />,
  },
];

export default function Features() {
  // Desktop Items: Bold numbering and high-contrast separation
  const desktopItems = features.map((f, i) => (
    <div
      key={f.title}
      className="flex flex-col p-12 bg-muted/30 transition-colors rounded-xl hover:bg-muted/50"
    >
      <div className="flex justify-between items-start mb-6">
        <div className="text-primary p-3">
          {f.icon}
        </div>
        <span className="text-4xl font-black text-primary/10 select-none">
          0{i + 1}
        </span>
      </div>

      <h3 className="text-2xl font-bold tracking-tight text-foreground mb-4">
        {f.title}
      </h3>

      <p className="text-muted-foreground leading-relaxed text-base lg:text-lg">
        {f.description}
      </p>
    </div>
  ));

  // Mobile Items: Utilizing the same accent logic
  const mobileItems = features.map((f, i) => (
    <div key={f.title} className="p-10 bg-muted/30 border-t-4 border-primary rounded-xl h-full">
      <div className="flex justify-between items-center mb-6">
        <div className="text-primary">{f.icon}</div>
        <span className="font-mono text-sm font-bold text-primary">0{i + 1}</span>
      </div>
      <h3 className="font-bold text-xl mb-3">{f.title}</h3>
      <p className="text-muted-foreground leading-relaxed">{f.description}</p>
    </div>
  ));

  return (
    <section id="features" className="py-24 bg-background scroll-mt-20">
      <div className="container">
        {/* Header */}
        <div className="flex flex-col items-center text-center gap-4 mb-16">
          <h2 className="text-primary font-bold tracking-widest text-sm uppercase">Features</h2>
          <h3 className="text-3xl font-bold tracking-tight sm:text-5xl">
            Built on Your Feedback
          </h3>
        </div>

        {/* Mobile View */}
        <div className="md:hidden">
          <CarouselWithDots items={mobileItems} />
        </div>

        {/* Desktop View: Grid with 'Gap' separation instead of just borders */}
        <div className="hidden md:grid grid-cols-3 gap-6">
          {desktopItems}
        </div>
      </div>
    </section>
  );
}