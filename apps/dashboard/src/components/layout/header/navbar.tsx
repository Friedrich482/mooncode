import { LinkWithQuery } from "@/components/common/link-with-query";

export const Navbar = () => {
  return (
    <nav className="flex flex-1 justify-end max-[25rem]:hidden">
      <ul className="flex flex-1 items-center justify-end gap-4 pr-24">
        <li>
          <LinkWithQuery
            to="/dashboard"
            className="text-muted-foreground/60 hover:text-primary"
          >
            Dashboard
          </LinkWithQuery>
        </li>
      </ul>
    </nav>
  );
};
