import { ToggleThemeDropDown } from "@repo/ui/components/toggle-theme-dropdown";

import { AuthDropDown } from "./auth-dropdown";

export const NavbarDropDowns = () => {
  return (
    <div className="flex gap-4 self-end">
      <ToggleThemeDropDown />
      <AuthDropDown />
    </div>
  );
};
