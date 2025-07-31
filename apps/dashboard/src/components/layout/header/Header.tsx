import HorizontalNavbar from "./HorizontalNavbar";
import NavbarDropDowns from "./NavbarDropDowns";
import Title from "./Title";

const Header = () => (
  <header className="fixed top-0 z-10 flex w-dvw gap-3 border-b bg-background px-10 pb-2 pt-2 max-small:justify-between max-small:pl-3 max-small:pr-6">
    <Title />
    <HorizontalNavbar />
    <NavbarDropDowns />
  </header>
);

export default Header;
