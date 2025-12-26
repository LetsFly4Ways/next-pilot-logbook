"use client";

import type React from "react";
import { useState, useEffect } from "react";

import { useRouter, usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

import { useSidebar } from "@/components/ui/sidebar";

import { Menu, Plus, Logs, LayoutDashboard } from "lucide-react";

interface TabItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
  action?: "navigate" | "sidebar";
  path?: string;
}

const tabs: TabItem[] = [
  {
    id: "logs",
    label: "Logs",
    icon: Logs,
    action: "navigate",
    path: "/app/logs",
  },
  {
    id: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    action: "navigate",
    path: "/app/dashboard",
  },
  {
    id: "new",
    label: "New",
    icon: Plus,
    action: "navigate",
    path: "/app/flights/new",
  },
  //   { id: "menu", label: "Menu", icon: Menu, action: "sidebar" },
];

export function MobileNavBar() {
  const router = useRouter();
  const pathname = usePathname();
  const { setOpenMobile } = useSidebar();
  const [activeTab, setActiveTab] = useState("flights");

  // Update active tab based on current pathname
  useEffect(() => {
    const currentTab = tabs.find((tab) => {
      if (tab.action === "navigate" && tab.path) {
        // For the "new" tab, check if we're on the new flight page
        if (tab.id === "new") {
          return pathname === tab.path;
        }
        // For other tabs, check if the pathname starts with the tab path
        return pathname.startsWith(tab.path);
      }
      return false;
    });

    if (currentTab) {
      setActiveTab(currentTab.id);
    }
  }, [pathname]);

  const handleTabPress = (tab: TabItem) => {
    setActiveTab(tab.id);
    router.push(tab.path ?? "");
  };

  return (
    <>
      {/* Bottom Tab Bar - Only visible on mobile */}
      <div className="fixed bottom-4 left-4 right-4 md:hidden z-50">
        <div className="flex items-center gap-4">
          <div className="bg-sidebar/40 backdrop-blur-xl border border-border rounded-3xl shadow-lg flex-3">
            <div className="flex items-center justify-between py-2 px-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive =
                  activeTab === tab.id && tab.action === "navigate"; // Only show active state for navigation tabs

                return (
                  <button
                    key={tab.id}
                    onClick={() => handleTabPress(tab)}
                    className={cn(
                      "flex flex-col items-center justify-center min-w-0 flex-1 p-1 transition-colors duration-200",
                      "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                      "active:scale-95 transition-transform"
                    )}
                    aria-label={tab.label}
                    role="tab"
                    aria-selected={isActive}
                  >
                    {/* Icon container with badge support */}
                    <div className="relative">
                      <Icon
                        className={cn(
                          "w-6 h-6 transition-colors duration-200",
                          isActive
                            ? "text-primary fill-current"
                            : "text-muted-foreground"
                        )}
                      />

                      {tab.badge && (
                        <div className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-medium leading-none">
                            {tab.badge > 99 ? "99+" : tab.badge}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Label */}
                    {/* <span
                    className={cn(
                      "text-xs font-medium transition-colors duration-200 text-center leading-tight",
                      isActive ? "text-primary" : "text-muted-foreground"
                    )}
                  >
                    {tab.label}
                  </span> */}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="bg-sidebar/40 backdrop-blur-xl border border-border rounded-3xl shadow-lg flex-1">
            <button
              key={"menu"}
              onClick={() => setOpenMobile(true)}
              className={cn(
                "flex flex-col items-center justify-center min-w-0 w-full p-3 transition-colors duration-200",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                "active:scale-95 transition-transform"
              )}
              aria-label={"menu"}
              role="tab"
            >
              <Menu className="w-6 h-6 transition-colors duration-200 text-muted-foreground" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
