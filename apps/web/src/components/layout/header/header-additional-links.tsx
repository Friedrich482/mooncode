import Link from "next/link";

import { HEADER_ADDITIONAL_LINKS } from "@/constants";

import Sidebar from "./sidebar";
import { ThemeToggler } from "./theme-toggler";

export const HeaderAdditionalLinks = () => {
  return (
    <div className="flex items-center justify-center gap-6 pr-4">
      <div className="flex gap-6 max-[20rem]:hidden">
        {HEADER_ADDITIONAL_LINKS.map((entry) => (
          <Link href={entry.href} key={entry.href}>
            <entry.Icon
              aria-label={entry.label}
              className="hover:text-primary size-5"
            />
          </Link>
        ))}
      </div>

      <ThemeToggler />

      <Sidebar />
    </div>
  );
};
