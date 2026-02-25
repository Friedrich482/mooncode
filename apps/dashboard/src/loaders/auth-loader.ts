import { redirect } from "react-router";
import { z } from "zod";

import { getCallbackUrl } from "@/utils/get-callback-url";
import { formatZodError } from "@repo/common/format-zod-error";
import { VSCodeCallbackUrlSchema } from "@repo/common/types-schemas";

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

  if (callbackUrl && clientParam === "vscode") {
    const validatedCallBackUrl = VSCodeCallbackUrlSchema.safeParse(callbackUrl);

    if (!validatedCallBackUrl.success) {
      throw redirect("/dashboard");
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
      const validatedCallBackUrl =
        VSCodeCallbackUrlSchema.safeParse(callbackUrl);

      if (!validatedCallBackUrl.success) {
        throw new Error(
          validatedCallBackUrl.error.issues.reduce(
            (acc, curr) => acc + curr.message,
            "",
          ),
        );
      }

      authUrl = `${AUTH_GOOGLE_URL}?state=${encodeURIComponent(origin)}&callback=${encodeURIComponent(validatedCallBackUrl.data)}`;
    }

    window.location.href = authUrl;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const linkGoogleAccountLoader = async () => {
  await protectedRouteLoader();

  const LINKING_GOOGLE_ACCOUNT_URL = import.meta.env
    .VITE_LINKING_GOOGLE_ACCOUNT_URL;

  const origin = window.location.origin;
  const linkingUrl = `${LINKING_GOOGLE_ACCOUNT_URL}?state=${encodeURIComponent(origin)}`;
  window.location.href = linkingUrl;
};

export const redirectToVSCodeAfterGoogleAuthLoader = async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const tokenParam = decodeURIComponent(urlParams.get("token") ?? "");
  const emailParam = decodeURIComponent(urlParams.get("email") ?? "");
  const callbackUrl = getCallbackUrl();

  if (tokenParam && emailParam && callbackUrl) {
    const validatedCallBackUrl = VSCodeCallbackUrlSchema.safeParse(callbackUrl);

    if (!validatedCallBackUrl.success) {
      throw new Error(formatZodError(validatedCallBackUrl.error));
    }

    const parseVSCodeAuthGoogleParamsSchema = z.object({
      token: z.jwt(),
      email: z.email(),
    });
    const parsedGoogleAuthParams = parseVSCodeAuthGoogleParamsSchema.safeParse({
      token: tokenParam,
      email: emailParam,
    });

    if (!parsedGoogleAuthParams.success) {
      throw redirect("/dashboard");
    }
    window.location.href = `${validatedCallBackUrl.data}&token=${encodeURIComponent(parsedGoogleAuthParams.data.token)}&email=${encodeURIComponent(parsedGoogleAuthParams.data.email)}`;
  }

  return null;
};
