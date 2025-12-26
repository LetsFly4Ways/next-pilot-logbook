import {
  LayoutDashboard,
  Logs,
  Plane,
  Settings,
  TowerControl,
  User,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

export const navigation: NavSection[] = [
  {
    title: "Logbook",
    items: [
      {
        title: "Logs",
        href: "/app/logs",
        icon: Logs,
      },
      {
        title: "Crew",
        href: "/app/crew",
        icon: Users,
      },
      {
        title: "Fleet",
        href: "/app/fleet",
        icon: Plane,
      },
      {
        title: "Airports",
        href: "/app/airports",
        icon: TowerControl,
      },
    ],
  },
  {
    title: "Tools",
    items: [
      {
        title: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
      },
      // {
      //   title: "Map",
      //   href: "/map",
      //   icon: Map,
      // },
      // {
      //   title: "Qualifications",
      //   href: "/qualifications",
      //   icon: FileBadge,
      // },
    ],
  },
  {
    title: "Operations",
    items: [
      // {
      //   title: "Documentation",
      //   href: "/docs",
      //   icon: FileText,
      // },
      // {
      //   title: "Export & Import",
      //   href: "/docs",
      //   icon: FileText,
      // },
      {
        title: "Account",
        href: "/app/settings/account",
        icon: User,
      },
      {
        title: "Settings",
        href: "/app/settings",
        icon: Settings,
      },
    ],
  },
];
