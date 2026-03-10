import { HeaderAdditionalLinks } from "./header-additional-links";
import { Navbar } from "./navbar";
import { Title } from "./title";

export const Header = () => {
  return (
    <header className="border-border/50 fixed z-50 flex w-svw justify-between gap-16 border-b p-4 backdrop-blur-md">
      <Title />
      <Navbar />
      <HeaderAdditionalLinks />
    </header>
  );
};
