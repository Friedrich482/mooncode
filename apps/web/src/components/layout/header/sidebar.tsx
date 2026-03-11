"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import Link from "next/link";

import { HEADER_ADDITIONAL_LINKS, NAVBAR_LINKS } from "@/constants";
import { Icon } from "@repo/ui/components/ui/icon";
import { cn } from "@repo/ui/lib/utils";

const Sidebar = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleClick = () => setIsSidebarOpen((prev) => !prev);

  return (
    <div className="relative hidden max-[49rem]:flex">
      <Icon Icon={Menu} onClick={handleClick} />
      <div
        className={cn(
          "bg-background absolute -top-5 -right-10 z-60 flex h-[102svh] w-64 flex-col gap-8 border p-6 transition duration-300",
          !isSidebarOpen && "translate-x-80",
        )}
        inert={!isSidebarOpen}
      >
        <Icon Icon={X} onClick={handleClick} className="place-self-end" />
        <ul className="flex flex-1 flex-col gap-6">
          {NAVBAR_LINKS.map((entry) => (
            <li key={entry.text}>
              <Link
                href={`#${entry.href}`}
                className="text-muted-foreground hover:text-primary text-xl"
              >
                {entry.text}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex gap-6">
          {HEADER_ADDITIONAL_LINKS.map((entry) => (
            <Link href={entry.href} key={entry.href}>
              <entry.Icon
                aria-label={entry.label}
                className="hover:text-primary size-6"
              />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
