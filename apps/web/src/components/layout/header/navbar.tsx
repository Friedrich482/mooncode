import Link from "next/link";

import { NAVBAR_LINKS } from "@/constants";

export const Navbar = () => {
  return (
    <nav className="flex flex-1 max-[49rem]:hidden">
      <ul className="flex w-full items-center gap-12">
        {NAVBAR_LINKS.map((entry) => (
          <li key={entry.text}>
            <Link
              href={`#${entry.href}`}
              className="text-muted-foreground hover:text-primary"
            >
              {entry.text}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
};
