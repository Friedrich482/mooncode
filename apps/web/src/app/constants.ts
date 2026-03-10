import {
  Activity,
  ChartColumnIcon,
  Code,
  LayoutDashboard,
  Timer,
  WifiOff,
} from "lucide-react";

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
    Icon: LayoutDashboard,
    title: "Local Dashboard",
    text: "Visualize and analyse your coding activity through the dashboard which is in sync and comes out of the box with the VSCode extension.",
  },
  {
    Icon: Activity,
    title: "Real Time Dashboard Sync",
    text: "Stats in the dashboard always stay fresh and up to date with the data collected by the extension.",
  },
  {
    Icon: WifiOff,
    title: "Offline support",
    text: "The extension works offline and synchronizes with the API once you are back online.",
  },
  {
    Icon: Timer,
    title: "Minute accurate time tracking",
    text: "Always up to date stats collection by the extension.",
  },
];
