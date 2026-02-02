import { Link } from "react-router";

import { BurgerMenu } from "./burger-menu";
import { Logo } from "./logo";

export const Title = () => (
  <div className="flex items-center justify-center gap-3">
    <BurgerMenu />
    <Link
      className="flex shrink-0 items-center justify-center gap-2 text-3xl"
      to="/dashboard"
    >
      <Logo />
      <p className="font-bold max-[33rem]:hidden">MoonCode</p>
    </Link>
  </div>
);
