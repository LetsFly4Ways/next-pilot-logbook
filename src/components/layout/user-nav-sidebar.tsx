"use client";

import { useAuth } from "@/components/context/auth-provider";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";

import { User } from "lucide-react";

export function NavUserSidebar() {
  const { user, loading } = useAuth();

  const userName =
    user?.user_metadata?.name || user?.email?.split("@")[0] || "User";
  const userEmail = user?.email || "";
  const userAvatar = user?.user_metadata?.avatar_url;

  if (loading) {
    return <NavUserSidebarSkeleton />;
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          size="lg"
          className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
        >
          <Avatar className="h-8 w-8 rounded-lg">
            <AvatarImage src={userAvatar} alt={userName} />
            <AvatarFallback className="rounded-lg bg-sidebar-primary text-sidebar-accent">
              <User />
            </AvatarFallback>
          </Avatar>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">{userName}</span>
            <span className="truncate text-xs">{userEmail}</span>
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

export function NavUserSidebarSkeleton() {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          size="lg"
          className="flex data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
        >
          <Skeleton className="h-8 w-8 rounded-lg" />
          <div className="grid flex-1 gap-2">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-2 w-full" />
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
