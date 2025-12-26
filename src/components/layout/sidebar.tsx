import { usePathname } from "next/navigation";

import { navigation } from "@/lib/routes";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";

import { MobileSidebarHeader } from "@/components/layout/top-banner";
import { NavUserSidebar } from "@/components/layout/user-nav-sidebar";

export function AppSidebar({
  className,
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();

  return (
    <Sidebar
      {...props}
      className={`flex flex-col h-full min-h-0 ${className ?? ""}`}
      variant="sidebar"
      mobileHeader={
        <MobileSidebarHeader
          leading={<span className="font-medium">NEXT</span>}
          trailing={<></>}
        />
      }
    >
      <SidebarContent className="flex-1 overflow-y-auto min-h-0 h-full">
        {navigation.map((item) => (
          <SidebarGroup key={item.title}>
            <SidebarGroupLabel>{item.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {item.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === item.href}
                      className="cursor-pointer font-normal"
                      size={"default"}
                    >
                      <a href={item.href}>
                        <item.icon className="h-4 w-4 mr-2" />
                        <span>{item.title}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter className="sticky bottom-0">
        <NavUserSidebar />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
