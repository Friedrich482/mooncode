import { Link } from "react-router";

export const Navbar = () => {
  return (
    <nav className="flex flex-1 justify-end max-[25rem]:hidden">
      <ul className="flex flex-1 items-center justify-end gap-4 pr-24">
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
};
