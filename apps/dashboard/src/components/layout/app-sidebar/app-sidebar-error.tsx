import { useLocation } from "react-router";
import { LayoutDashboard } from "lucide-react";

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

import { Logo } from "../header/logo";

export const AppSidebarError = ({ errorMessage }: { errorMessage: string }) => {
  const { pathname } = useLocation();

  return (
    <Sidebar variant="inset" collapsible="icon" className="z-20 border-r p-0">
      <SidebarHeader className="border-b p-1 group-data-[collapsible=icon]:p-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton variant="outline" size="lg" className="text-lg!">
              <Logo className="size-6! group-data-[collapsible=icon]:size-4!" />
              <span>{errorMessage}</span>
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

        <SidebarGroup>
          <SidebarGroupLabel>Projects</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton variant="outline">
                  <span>{errorMessage}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t p-2 group-data-[collapsible=icon]:p-2.5">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton variant="outline">
              <span>{errorMessage}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
};
