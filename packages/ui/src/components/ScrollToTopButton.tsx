import { useEffect, useState } from "react";
import { ChevronUp } from "lucide-react";
import { Button } from "./ui/button";

const ScrollToTopButton = () => {
  const [isVisible, setIsVisible] = useState(false);

  const handleScrollToTopButtonVisibility = () => {
    setIsVisible(window.scrollY > 200);
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScrollToTopButtonVisibility);

    return () =>
      window.removeEventListener("scroll", handleScrollToTopButtonVisibility);
  }, []);

  const jumpToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    isVisible && (
      <Button
        onClick={jumpToTop}
        variant="default"
        aria-label="Scroll to top of page"
        title="Scroll to top"
        className="fixed right-1 bottom-5 z-50 flex size-12 items-center justify-center rounded-2xl  [&_svg]:size-7"
      >
        <ChevronUp aria-hidden="true" />
      </Button>
    )
  );
};

export default ScrollToTopButton;
