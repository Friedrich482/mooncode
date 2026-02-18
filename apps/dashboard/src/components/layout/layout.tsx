import { Outlet, useNavigation } from "react-router";
import { ClipLoader } from "react-spinners";

import { cn } from "@repo/ui/lib/utils";

import { AppSidebar } from "./app-sidebar";
import { Footer } from "./footer";
import { Header } from "./header/header";

const GlobalSpinner = () => (
  <div className="flex h-dvh items-center justify-center">
    <ClipLoader size={80} color="var(--primary)" />
  </div>
);

export const Layout = () => {
  const navigation = useNavigation();

  const isLoading = navigation.state === "loading";

  return (
    <>
      <AppSidebar />
      <div className="flex-1">
        <Header />
        <div id="loader" className={cn(isLoading && "opacity-70")}>
          {isLoading && <GlobalSpinner />}
          <Outlet />
        </div>
        <Footer />
      </div>
    </>
  );
};
