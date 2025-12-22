import { LucideProps, Monitor, Moon, Sun } from "lucide-react";

import { Theme } from "#types-schemas.ts";

export const DEFAULT_COLOR = "HSL(334, 90%, 51%)";

export const THEME_DROPDOWN_ITEMS: {
  text: string;
  Icon: React.ForwardRefExoticComponent<
    Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>
  >;
  theme: Theme;
}[] = [
  { text: "Light", Icon: Sun, theme: "light" },
  { text: "Dark", Icon: Moon, theme: "dark" },
  { text: "System", Icon: Monitor, theme: "system" },
];
