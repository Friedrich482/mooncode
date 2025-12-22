import ToggleThemeDropDown from "@repo/ui/components/ToggleThemeDropDown";

import AuthDropDown from "./AuthDropDown";

const NavbarDropDowns = () => {
  return (
    <div className="flex gap-4 self-end">
      <ToggleThemeDropDown />
      <AuthDropDown />
    </div>
  );
};

export default NavbarDropDowns;
