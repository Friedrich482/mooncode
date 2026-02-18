import { useEffect, useState } from "react";
import { ChevronUp } from "lucide-react";

import { Button } from "./ui/button";

export const ScrollToTopButton = () => {
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
      <div className="pointer-events-none fixed bottom-5 flex w-svw items-center justify-end">
        <Button
          onClick={jumpToTop}
          variant="default"
          aria-label="Scroll to top of page"
          title="Scroll to top"
          className="pointer-events-auto relative right-3 z-50 flex size-12 items-center justify-center rounded-2xl [&_svg:not([class*='size-'])]:size-7"
        >
          <ChevronUp aria-hidden="true" />
        </Button>
      </div>
    )
  );
};
