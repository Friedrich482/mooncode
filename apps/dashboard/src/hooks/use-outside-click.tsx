import { useEffect, useRef } from "react";

export const useOutsideClick = (
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>,
) => {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleOutSideClick = (event: Event) => {
      if (!ref.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutSideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutSideClick);
    };
  }, [ref]);

  return ref;
};
