"use client";

import React, {
  createContext,
  useContext,
  useCallback,
  useState,
  Suspense,
} from "react";

import { AuthProvider } from "@/components/context/auth-provider";

import { TopBanner } from "@/components/layout/top-banner";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/sidebar";
import { MobileNavBar } from "@/components/layout/mobile-navbar";
import { PreferencesProvider } from "@/components/context/preferences-provider";

interface BannerContent {
  left?: React.ReactNode;
  center?: React.ReactNode;
  right?: React.ReactNode;
}

const BannerTrailingContext = createContext<{
  setContent: (content: BannerContent | null) => void;
} | null>(null);

export function useBannerTrailing() {
  const ctx = useContext(BannerTrailingContext);
  if (!ctx)
    throw new Error(
      "useBannerTrailing must be used within BannerTrailingContext"
    );
  return ctx.setContent;
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [content, setContent] = useState<BannerContent | null>(null);

  // Memoize to avoid infinite loops
  const setContentMemo = useCallback(
    (newContent: BannerContent | null) => setContent(newContent),
    []
  );

  return (
    <AuthProvider>
      <PreferencesProvider>
        <BannerTrailingContext.Provider value={{ setContent: setContentMemo }}>
          <main className="w-screen h-screen">
            <SidebarProvider>
              <TopBanner
                leading={
                  <div className="flex items-center gap-2">
                    <SidebarTrigger className="hidden md:inline-flex" />
                  </div>
                }
                content={content}
                className="fixed top-0 left-0 right-0 z-30"
              />

              <div className="pt-12 flex w-full">
                <Suspense fallback={<div className="w-64" />}>
                  <AppSidebar className="inset-y-12 h-calc(100vh-3rem)" />
                </Suspense>
                <div className="flex-1 ml-0 h-calc(100vh-3rem)">
                  <SidebarInset className="flex h-full flex-col overflow-auto mobile-bottom-spacing">
                    {children}
                  </SidebarInset>
                </div>
              </div>

              <Suspense fallback={null}>
                <MobileNavBar />
              </Suspense>
            </SidebarProvider>
          </main>
        </BannerTrailingContext.Provider>
      </PreferencesProvider>
    </AuthProvider>
  );
}
