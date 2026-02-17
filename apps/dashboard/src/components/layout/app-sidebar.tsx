import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router";
import {
  Folder,
  FolderOpen,
  LayoutDashboard,
  MoreHorizontal,
} from "lucide-react";

import { PERIODS_CONFIG } from "@/stores/period/constants";
import { usePeriodStore } from "@/stores/period/period-store";
import { useTRPC } from "@/utils/trpc";
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
import { useSuspenseQuery } from "@tanstack/react-query";

import { GravatarAvatar } from "./header/gravatar-avatar";
import { Logo } from "./header/logo";

export const AppSidebar = () => {
  const period = usePeriodStore((state) => state.period);
  const customRange = usePeriodStore((state) => state.customRange);

  const trpc = useTRPC();
  const [page, setPage] = useState(1);
  const handleMoreProjectsButtonClick = () => {
    setPage((prev) => prev + 1);
  };

  const {
    data: { periodProjects, hasNext },
  } = useSuspenseQuery(
    trpc.analytics.projects.getPeriodProjects.queryOptions(
      period === "Custom Range"
        ? {
            start: customRange.start,
            end: customRange.end,
            page,
          }
        : {
            start: PERIODS_CONFIG[period].start,
            end: PERIODS_CONFIG[period].end,
            page,
          },
    ),
  );

  const [projectsToDisplay, setProjectsToDisplay] = useState(periodProjects);
  useEffect(() => {
    setProjectsToDisplay((prev) => {
      const displayedProjectNames = new Set(prev.map((p) => p.name));
      return [
        ...prev,
        ...periodProjects.filter(
          (entry) => !displayedProjectNames.has(entry.name),
        ),
      ];
    });
  }, [periodProjects]);

  // Reset page when period or date range changes
  useEffect(() => {
    setPage(1);
    setProjectsToDisplay(periodProjects);
  }, [period, customRange.start, customRange.end]);

  const {
    data: { email, username },
  } = useSuspenseQuery(trpc.auth.getUser.queryOptions());

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
              tooltip={username}
            >
              <div className="flex cursor-pointer items-center justify-start text-lg!">
                <Logo className="size-6! group-data-[collapsible=icon]:size-4!" />
                <span>{username}</span>
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
                  <Link to="/dashboard">
                    <LayoutDashboard />
                    <span>Dashboard</span>
                  </Link>
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
              {projectsToDisplay.length === 0 ? (
                <span className="group-data-[collapsible=icon]:hidden">
                  No projects found{" "}
                  {period === "Custom Range" ? (
                    <>
                      between{" "}
                      <span className="text-primary/85">
                        {customRange.start}
                      </span>{" "}
                      and{" "}
                      <span className="text-primary/85">{customRange.end}</span>
                    </>
                  ) : (
                    `on ${period.toLowerCase()}`
                  )}
                </span>
              ) : (
                projectsToDisplay.map((project) => {
                  const isProjectActive =
                    pathname === `/dashboard/${project.name}`;

                  return (
                    <SidebarMenuItem key={project.path}>
                      <SidebarMenuButton
                        asChild
                        variant="outline"
                        isActive={isProjectActive}
                        tooltip={project.name}
                      >
                        <Link to={`/dashboard/${project.name}`}>
                          {isProjectActive ? <FolderOpen /> : <Folder />}
                          <span>{project.name}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })
              )}

              {hasNext && (
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    variant="outline"
                    tooltip="Load more"
                    onClick={handleMoreProjectsButtonClick}
                    isActive={false}
                  >
                    <div className="flex cursor-pointer items-center justify-start">
                      <MoreHorizontal className="text-sidebar-foreground/80" />
                      <span className="text-sidebar-foreground/80">More</span>
                    </div>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t p-2 group-data-[collapsible=icon]:p-2.5">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild variant="outline" tooltip={email}>
              <Link to="/profile">
                <GravatarAvatar
                  email={email}
                  className="group-data-[collapsible=icon]:p-0 [&>img]:size-6 group-data-[collapsible=icon]:[&>img]:size-4!"
                />
                <span>{email}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
};
