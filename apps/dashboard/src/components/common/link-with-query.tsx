import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router";

export const LinkWithQuery = ({
  to,
  ...props
}: React.ComponentProps<typeof Link>) => {
  const [search, setSearch] = useState(useLocation().search);

  useEffect(() => {
    const currentSearchParams = new URLSearchParams(window.location.search);

    // we transport those parameters specifically in the url between pages
    const periodParam = currentSearchParams.get("period");
    const startParam = currentSearchParams.get("start");
    const endParam = currentSearchParams.get("end");
    const groupByParam = currentSearchParams.get("groupBy");

    const newSearchParams = new URLSearchParams();

    if (periodParam) {
      newSearchParams.set("period", periodParam);
    }
    if (startParam) {
      newSearchParams.set("start", startParam);
    }
    if (endParam) {
      newSearchParams.set("end", endParam);
    }
    if (groupByParam) {
      newSearchParams.set("groupBy", groupByParam);
    }

    const queryString = newSearchParams.toString();
    setSearch(queryString ? `?${queryString}` : "");
  }, [window.location.search]);

  return (
    <Link to={to + search} {...props}>
      {props.children}
    </Link>
  );
};
