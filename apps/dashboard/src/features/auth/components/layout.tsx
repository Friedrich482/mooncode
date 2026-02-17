import { Outlet } from "react-router";

export const Layout = () => {
  return (
    <div className="flex-1">
      <Outlet />
    </div>
  );
};
