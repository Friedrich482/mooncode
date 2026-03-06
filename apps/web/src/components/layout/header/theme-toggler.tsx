"use client";

import { useTheme } from "next-themes";

import { ToggleThemeDropDown } from "@repo/ui/components/toggle-theme-dropdown";
import { ResolvedTheme, Theme } from "@repo/ui/types-schemas";

export const ThemeToggler = () => {
  const { theme, resolvedTheme, setTheme } = useTheme() as {
    theme: Theme;
    resolvedTheme: ResolvedTheme;
    setTheme: (theme: Theme) => void;
  };

  return (
    <ToggleThemeDropDown
      providedTheme={theme}
      resolvedTheme={resolvedTheme}
      setTheme={setTheme}
    />
  );
};
