import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router";

export const LinkWithQuery = ({
  to,
  ...props
}: React.ComponentProps<typeof Link>) => {
  const [search, setSearch] = useState(useLocation().search);

  useEffect(() => {
    setSearch(window.location.search);
  }, [window.location.search]);

  return (
    <Link to={to + search} {...props}>
      {props.children}
    </Link>
  );
};
