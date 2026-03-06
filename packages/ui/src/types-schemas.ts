export type Theme = "dark" | "light" | "system";
export type ResolvedTheme = Exclude<Theme, "system">;
