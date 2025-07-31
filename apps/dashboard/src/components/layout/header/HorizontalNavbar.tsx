import { Link } from "react-router";

const HorizontalNavbar = () => {
  return (
    <nav className="flex flex-1 justify-end pr-12 max-small:hidden">
      <ul className="flex flex-1 items-center justify-end gap-4 pr-12">
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

export default HorizontalNavbar;
