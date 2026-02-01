import { HorizontalNavbar } from "./horizontal-navbar";
import { NavbarDropDowns } from "./navbar-dropdowns";
import { Title } from "./title";

export const Header = () => (
  <header className="bg-background max-small:justify-between max-small:pl-3 max-small:pr-6 fixed top-0 z-10 flex w-dvw gap-3 border-b px-10 pt-2 pb-2">
    <Title />
    <HorizontalNavbar />
    <NavbarDropDowns />
  </header>
);
