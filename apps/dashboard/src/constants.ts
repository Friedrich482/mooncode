import { LayoutDashboard, LucideProps } from "lucide-react";

import { ChartConfig } from "@repo/ui/components/ui/chart";

export const AUTH_DROPDOWN_ITEMS: {
  text: string;
  Icon: React.ForwardRefExoticComponent<
    Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>
  >;
  url: string;
}[] = [
  {
    text: "Dashboard",
    Icon: LayoutDashboard,
    url: "/dashboard",
  },
];

export const chartConfig = {
  time: {
    label: "Time spent",
    color: "var(--primary)",
  },
} satisfies ChartConfig;
