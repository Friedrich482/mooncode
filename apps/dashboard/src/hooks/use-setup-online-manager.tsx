import { useEffect } from "react";

import { trpcLoaderClient } from "@/utils/trpc";
import { onlineManager } from "@tanstack/react-query";

export const useSetupOnlineManager = () => {
  useEffect(() => {
    onlineManager.setEventListener((setOnline) => {
      const check = async () => {
        try {
          await trpcLoaderClient.health.ping.query();
          setOnline(true);
        } catch {
          setOnline(false);
        }
      };

      const setOffline = () => setOnline(false);

      const interval = setInterval(check, 60 * 1000);
      window.addEventListener("online", check);
      window.addEventListener("offline", setOffline);

      check();

      return () => {
        clearInterval(interval);
        window.removeEventListener("online", check);
        window.removeEventListener("offline", setOffline);
      };
    });
  }, []);
};
