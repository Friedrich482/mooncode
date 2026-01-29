import { useEffect, useRef } from "react";

import { DASHBOARD_DEVELOPMENT_WS_PORT } from "@repo/common/constants";

export const initializeWebSocket = () => {
  const isDev = import.meta.env.DEV;
  let wsUrl: string;

  if (isDev) {
    wsUrl = `ws://localhost:${DASHBOARD_DEVELOPMENT_WS_PORT}`;
  } else {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    wsUrl = `${protocol}//${window.location.host}`;
  }

  const ws = new WebSocket(wsUrl);

  ws.onopen = () => {
    ws.send(JSON.stringify({ type: "ready" }));
  };

  ws.onmessage = async (event) => {
    try {
      const data = JSON.parse(event.data);

      if (data.type === "navigate") {
        window.history.pushState({}, "", data.path);
        window.dispatchEvent(new PopStateEvent("popstate"));

        if (window.Notification && Notification.permission === "granted") {
          const notification = new Notification("Dashboard", {
            body: "Click to go to the dashboard",
            icon: "/moon.svg",
            requireInteraction: false,
          });

          notification.onclick = () => {
            window.focus();
            notification.close();
          };

          setTimeout(() => notification.close(), 3000);
        } else if (
          window.Notification &&
          Notification.permission === "default"
        ) {
          Notification.requestPermission();
        } else {
          window.focus();
        }

        ws.send(JSON.stringify({ type: "navigated", message: data.path }));
      }
    } catch (error) {
      console.error("Failed to handle WebSocket message:", error);
    }
  };

  ws.onerror = (error) => {
    console.error("WebSocket error:", error);
  };

  return ws;
};

const useExtensionWebsocket = () => {
  const wsRef = useRef<WebSocket>(null);

  useEffect(() => {
    wsRef.current = initializeWebSocket();

    return () => {
      if (wsRef.current) {
        if (wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({ type: "closed" }));
        }
        wsRef.current.close();
      }
    };
  }, []);
};

export default useExtensionWebsocket;
