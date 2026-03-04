import { useLocation } from "react-router";
import { Folder, LayoutDashboard } from "lucide-react";

import { LinkWithQuery } from "@/components/common/link-with-query";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@repo/ui/components/ui/sidebar";
import { Skeleton } from "@repo/ui/components/ui/skeleton";

import { Logo } from "../header/logo";

export const AppSidebarSkeleton = () => {
  const { pathname } = useLocation();

  return (
    <Sidebar variant="inset" collapsible="icon" className="z-20 border-r p-0">
      <SidebarHeader className="border-b p-1 group-data-[collapsible=icon]:p-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              variant="outline"
              isActive={false}
              size="lg"
              tooltip="Loading"
            >
              <div className="flex cursor-pointer items-center justify-start text-lg!">
                <Logo className="size-6! group-data-[collapsible=icon]:size-4!" />
                <Skeleton className="w-22" />
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Home</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  variant="outline"
                  isActive={pathname === "/dashboard"}
                  tooltip="Dashboard"
                >
                  <LinkWithQuery to="/dashboard">
                    <LayoutDashboard />
                    <span>Dashboard</span>
                  </LinkWithQuery>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* projects */}
        <SidebarGroup>
          <SidebarGroupLabel>Projects</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {Array.from({ length: 3 }, (_, index) => index).map((entry) => (
                <SidebarMenuItem key={entry}>
                  <SidebarMenuButton
                    asChild
                    variant="outline"
                    tooltip="Loading"
                  >
                    <div className="group-data-[collapsible=icon]:hover:bg-sidebar-accent pointer-events-none flex gap-2 p-2 hover:bg-transparent">
                      <Folder />
                      <Skeleton className="size-full" />
                    </div>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t p-2 group-data-[collapsible=icon]:p-2.5">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild variant="outline" tooltip="Loading">
              <div className="pointer-events-none flex gap-2 p-2 group-data-[collapsible=icon]:p-0 hover:bg-transparent">
                <Skeleton className="size-6 shrink-0 rounded-full group-data-[collapsible=icon]:size-4" />
                <Skeleton className="size-full" />
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
};
