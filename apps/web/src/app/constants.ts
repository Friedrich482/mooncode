import {
  Activity,
  ChartColumnIcon,
  Code,
  FolderGit2,
  LayoutDashboard,
  Timer,
  WifiOff,
} from "lucide-react";

import dashboardOverview from "@/assets/dashboard-overview.svg";
import individualProjectOverview from "@/assets/individual-project-overview.svg";
import profileOverview from "@/assets/profile-overview.svg";

import { Feature } from "./types-schemas";

export const FEATURES: Feature[] = [
  {
    Icon: ChartColumnIcon,
    title: "Comprehensive stats summary",
    text: "Your coding time, languages and projects per day, week, month, year, or any custom period.",
  },
  {
    Icon: Code,
    title: "Support for most languages and file extensions",
    text: "A wide variety of programming languages are supported and automatically detected by the VSCode extension, from the common ones to the more obscure.",
  },
  {
    Icon: FolderGit2,
    title: "Project Git branch stats",
    text: "Coding stats filterable per Git branch(es) on each version-controlled project.",
  },
  {
    Icon: LayoutDashboard,
    title: "Local Dashboard",
    text: "Visualize and analyse your coding activity through the dashboard which is in sync and comes out of the box with the VSCode extension.",
  },
  {
    Icon: Activity,
    title: "Real Time Dashboard sync",
    text: "Stats in the dashboard always stay fresh and up to date with the data collected by the extension.",
  },
  {
    Icon: WifiOff,
    title: "Offline support",
    text: "The extension works offline and synchronizes with the API once you are back online.",
  },
  {
    Icon: Timer,
    title: "Minute-accurate time tracking",
    text: "The extension keeps your stats up to date automatically.",
  },
];

export const TABS_ELEMENTS = [
  {
    tab: "General",
    description: "Get an overview of your stats on your desired period.",
    imageSrc: dashboardOverview as unknown as string,
    imageAlt: "Dashboard overview image",
  },
  {
    tab: "Projects",
    description:
      "Individual summary of each project with individual files and languages stats, still on the period of your choice.",
    imageSrc: individualProjectOverview as unknown as string,
    imageAlt: "Individual project overview image",
  },
  {
    tab: "Profile",
    description:
      "Customize your credentials and get a general overview of your progress.",
    imageSrc: profileOverview as unknown as string,
    imageAlt: "Profile overview image",
  },
] as const;

export const BLUR_DATA_URL =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=";
