"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { useAuth } from "@/components//context/auth-provider";

import { User, Settings, LogOut } from "lucide-react";
import { logout } from "@/actions/auth/logout";

export function UserNav() {
  const { user } = useAuth();

  // If no user is found, returns null -- button disappears for split second on loading
  // if (!user) return null;

  const userName =
    user?.user_metadata?.name || user?.email?.split("@")[0] || "User";
  const userEmail = user?.email || "";
  const userAvatar = user?.user_metadata?.avatar_url;

  const handleLogout = async () => {
    try {
      // Server-side signout and get redirect info
      const data = await logout();
      // Use the redirect URL from server action
      if (data?.redirectTo) {
        window.location.href = data.redirectTo;
      }
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  return (
    <DropdownMenu>
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 hover:bg-secondary-foreground/10 cursor-pointer"
            >
              {/* Avatar */}
              <Avatar className="h-6 w-6 rounded-xl bg-accent-foreground/10">
                <AvatarImage src={userAvatar} alt={userName} />
                <AvatarFallback className="bg-accent-foreground/10 text-white">
                  <User />
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent>
          <p>Account</p>
        </TooltipContent>
      </Tooltip>

      <DropdownMenuContent
        className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-md"
        align="end"
        sideOffset={12}
      >
        <DropdownMenuLabel className="p-0 font-normal">
          <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
            {/* Avatar */}
            <Avatar className="h-8 w-8 rounded-lg">
              <AvatarImage src={userAvatar} alt={userName} />
              <AvatarFallback className="bg-accent-foreground/10 text-white">
                <User />
              </AvatarFallback>
            </Avatar>

            {/* User info */}
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">{userName}</span>
              <span className="truncate font-xs">{userEmail}</span>
            </div>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuItem>
            <Settings />
            Settings
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuItem variant="destructive" onClick={handleLogout}>
          <LogOut />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
