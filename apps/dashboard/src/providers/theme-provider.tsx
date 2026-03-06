import { createContext, useContext, useEffect, useState } from "react";

import { ResolvedTheme, Theme } from "@repo/ui/types-schemas";

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: ResolvedTheme;
};

const initialState: ThemeProviderState = {
  theme: "system",
  setTheme: () => null,
  resolvedTheme: "light",
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export const ThemeProvider = ({
  children,
  defaultTheme = "system",
  storageKey = "vite-ui-theme",
  ...props
}: ThemeProviderProps) => {
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem(storageKey) as Theme) || defaultTheme,
  );
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>("light");

  useEffect(() => {
    const root = window.document.documentElement;

    root.classList.remove("light", "dark");

    let newTheme: ResolvedTheme;

    if (theme === "system") {
      newTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    } else {
      newTheme = theme;
    }

    root.classList.add(newTheme);
    setResolvedTheme(newTheme);
  }, [theme]);

  const value = {
    theme,
    resolvedTheme,
    setTheme: (theme: Theme) => {
      localStorage.setItem(storageKey, theme);
      setTheme(theme);
    },
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider");

  return context;
};
