import { Navbar } from "./navbar";
import { NavbarDropDowns } from "./navbar-dropdowns";
import { Title } from "./title";

export const Header = () => (
  <header className="bg-background sticky top-0 z-10 flex w-full gap-3 border-b pt-2 pr-8 pb-2 pl-2 max-[25rem]:justify-between max-[25rem]:pr-6 max-[25rem]:pl-3">
    <Title />
    <Navbar />
    <NavbarDropDowns />
  </header>
);
