"use client";

import { useEffect } from "react";

export const useToggleScroll = (visible: boolean) => {
  useEffect(() => {
    const body = document.body;

    const originalOverflowY = body.style.overflowY;

    body.style.overflowY = visible ? "clip" : "scroll";

    return () => {
      body.style.overflowY = originalOverflowY;
    };
  }, [visible]);
};
