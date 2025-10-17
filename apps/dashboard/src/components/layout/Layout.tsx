import { Outlet, useNavigation } from "react-router";
import { ClipLoader } from "react-spinners";
import Footer from "./Footer";
import Header from "./header/Header";
import ScrollToTopButton from "@repo/ui/components/ScrollToTopButton";
import { cn } from "@repo/ui/lib/utils";
import { useEffect } from "react";

const GlobalSpinner = () => (
  <div className="flex h-dvh items-center justify-center">
    <ClipLoader size={80} color="var(--primary)" />
  </div>
);

const Layout = () => {
  const navigation = useNavigation();

  const isLoading = navigation.state === "loading";

  useEffect(() => {
    document.getElementById("root")?.classList.add("main-layout");
    return () => {
      document.getElementById("root")?.classList.remove("main-layout");
    };
  }, []);

  return (
    <>
      <Header />
      <div id="loader" className={cn(isLoading && "opacity-70")}>
        {isLoading && <GlobalSpinner />}
        <Outlet />
      </div>
      <ScrollToTopButton />
      <Footer />
    </>
  );
};

export default Layout;
