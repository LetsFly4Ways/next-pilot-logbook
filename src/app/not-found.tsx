"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="fixed inset-0 flex flex-col bg-background text-foreground">

      {/* Main content — centered in remaining space */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 gap-2 text-center">
        <span className="text-8xl font-semibold tabular-nums tracking-tight text-muted-foreground/30 select-none">
          404
        </span>
        <h1 className="text-base font-semibold -mt-2">Page not found</h1>
        <p className="text-sm text-muted-foreground max-w-65">
          This route doesn&apos;t exist in your logbook.
        </p>
      </div>

      {/* Actions pinned to bottom — safe for mobile nav bar */}
      <div className="px-4 pb-24 md:pb-8 flex flex-col gap-2 w-full max-w-sm mx-auto">
        <button
          onClick={() => router.back()}
          className="flex items-center justify-center gap-2 w-full h-11 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 active:scale-[0.98] transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Go back
        </button>
      </div>
    </div>
  );
}
