import { redirect } from "react-router";
import { z } from "zod";

import getCallbackUrl from "../getCallbackUrl";

const API_URL = import.meta.env.VITE_API_URL;

// protects routes
export const protectedRouteLoader = async () => {
  try {
    const response = await fetch(`${API_URL}/auth.checkAuthStatus`, {
      credentials: "include",
    });

    if (!response.ok) {
      if (response.status >= 500 || response.status === 0) {
        throw new Error("Service temporarily unavailable");
      } else if (response.status === 401) {
        throw redirect("/login");
      } else {
        throw new Error("Authentication check failed");
      }
    }
  } catch (error) {
    if (error instanceof Response && error.headers.get("Location")) {
      throw error;
    }
  }
};

// prevents a logged in user to access an auth route
export const authRouteLoader = async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const clientParam = decodeURIComponent(urlParams.get("client") ?? "");
  const callbackUrl = getCallbackUrl();

  if (clientParam === "vscode" && callbackUrl) {
    if (
      !callbackUrl.startsWith("vscode://") ||
      !callbackUrl.includes("/auth-callback")
    ) {
      return redirect("/dashboard");
    }

    // in the case of a vscode login attempt, logout the user from the dashboard
    const LOGOUT_URL = import.meta.env.VITE_LOGOUT_URL;
    try {
      const res = await fetch(LOGOUT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      await res.json();
    } catch {
      return null;
    }

    return null;
  }

  try {
    const response = await fetch(`${API_URL}/auth.checkAuthStatus`, {
      credentials: "include",
    });
    if (response.ok) {
      return redirect("/dashboard");
    }
    return null;
  } catch {
    return null;
  }
};

export const googleAuthLoader = async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const clientParam = decodeURIComponent(urlParams.get("client") ?? "");
  const callbackUrl = getCallbackUrl();

  try {
    const response = await fetch(`${API_URL}/auth.checkAuthStatus`, {
      credentials: "include",
    });

    if (response.ok) {
      return redirect("/dashboard");
    }

    const AUTH_GOOGLE_URL = import.meta.env.VITE_AUTH_GOOGLE_URL;

    const origin = window.location.origin;
    let authUrl = `${AUTH_GOOGLE_URL}?state=${encodeURIComponent(origin)}`;

    if (callbackUrl && clientParam === "vscode") {
      // the login request comes from the extension
      if (
        !callbackUrl.startsWith("vscode://") ||
        !callbackUrl.includes("/auth-callback")
      ) {
        throw new Error("Incorrect callback url");
      }
      authUrl = `${AUTH_GOOGLE_URL}?state=${encodeURIComponent(origin)}&callback=${encodeURIComponent(callbackUrl)}`;
    }

    window.location.href = authUrl;
  } catch {
    return null;
  }
};

export const redirectToVSCodeAfterGoogleAuthLoader = async () => {
  try {
    const response = await fetch(`${API_URL}/auth.checkAuthStatus`, {
      credentials: "include",
    });

    if (!response.ok) {
      if (response.status >= 500 || response.status === 0) {
        throw new Error("Service temporarily unavailable");
      } else if (response.status === 401) {
        throw redirect("/login");
      } else {
        throw new Error("Authentication check failed");
      }
    }
  } catch (error) {
    if (error instanceof Response && error.headers.get("Location")) {
      throw error;
    }
  }

  const urlParams = new URLSearchParams(window.location.search);
  const tokenParam = decodeURIComponent(urlParams.get("token") ?? "");
  const emailParam = decodeURIComponent(urlParams.get("email") ?? "");
  const callbackUrl = getCallbackUrl();

  if (tokenParam && emailParam && callbackUrl) {
    const parseVSCodeAuthGoogleParamsSchema = z.object({
      token: z.jwt(),
      email: z.email(),
    });

    try {
      const data = parseVSCodeAuthGoogleParamsSchema.parse({
        token: tokenParam,
        email: emailParam,
      });

      if (
        !callbackUrl.startsWith("vscode://") ||
        !callbackUrl.includes("/auth-callback")
      ) {
        throw new Error("Incorrect callback url");
      }

      window.location.href = `${callbackUrl}&token=${encodeURIComponent(data.token)}&email=${encodeURIComponent(data.email)}`;
    } catch {
      return redirect("/dashboard");
    }
  }
  return null;
};
