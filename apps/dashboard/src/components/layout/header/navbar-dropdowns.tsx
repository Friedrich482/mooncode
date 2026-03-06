import { useTheme } from "@/providers/theme-provider";
import { ToggleThemeDropDown } from "@repo/ui/components/toggle-theme-dropdown";

import { AuthDropDown } from "./auth-dropdown";

export const NavbarDropDowns = () => {
  const { theme: providedTheme, setTheme, resolvedTheme } = useTheme();

  return (
    <div className="flex gap-4 self-end">
      <ToggleThemeDropDown
        providedTheme={providedTheme}
        resolvedTheme={resolvedTheme}
        setTheme={setTheme}
      />
      <AuthDropDown />
    </div>
  );
};
