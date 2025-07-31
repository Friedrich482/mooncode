import { Outlet, useNavigation } from "react-router";
import { ClipLoader } from "react-spinners";
import Footer from "./Footer";
import Header from "./header/Header";
import { cn } from "@repo/ui/lib/utils";

const GlobalSpinner = () => (
  <div className="flex h-dvh items-center justify-center">
    <ClipLoader size={80} color="hsl(var(--primary))" />
  </div>
);

const Layout = () => {
  const navigation = useNavigation();

  const isLoading = navigation.state === "loading";

  return (
    <>
      <Header />
      <div className={cn(isLoading && "opacity-70")}>
        {isLoading && <GlobalSpinner />}
        <Outlet />
      </div>
      <Footer />
    </>
  );
};

export default Layout;
