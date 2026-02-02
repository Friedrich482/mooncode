import { useState } from "react";
import { Menu } from "lucide-react";

import { useOutsideClick } from "@/hooks/use-outside-click";
import { Icon } from "@repo/ui/components/ui/icon";

import { SideBar } from "./sidebar";

export const BurgerMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  useOutsideClick(setIsOpen);
  const handleClick = () => {
    setIsOpen((prev) => !prev);
  };
  return (
    <>
      <Icon
        className="max-small:flex hidden"
        onClick={handleClick}
        Icon={Menu}
      />
      <SideBar isOpen={isOpen} handleClick={handleClick} />
    </>
  );
};
