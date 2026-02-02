import { Link } from "react-router";
import { X } from "lucide-react";

import { Icon } from "@repo/ui/components/ui/icon";
import { cn } from "@repo/ui/lib/utils";

import { Logo } from "./logo";

export const SideBar = ({
  isOpen,
  handleClick,
}: {
  isOpen: boolean;
  handleClick: () => void;
}) => (
  <nav
    className={cn(
      "bg-background max-small:flex absolute top-0 left-0 hidden h-dvh w-64 -translate-x-64 flex-col items-center justify-start gap-10 border-r px-3 py-6 transition duration-300 ease-in-out",
      isOpen && "translate-x-0",
    )}
  >
    <div className="flex w-full items-center justify-between px-2">
      <a
        className="flex shrink-0 items-center justify-center gap-2 text-2xl"
        href="/"
      >
        <Logo />
        <p className="font-bold">MoonCode</p>
      </a>
      <Icon onClick={handleClick} Icon={X} />
    </div>

    <ul>
      <li>
        <Link
          to="/dashboard"
          className="text-muted-foreground/60 hover:text-primary"
        >
          Dashboard
        </Link>
      </li>
    </ul>
  </nav>
);
