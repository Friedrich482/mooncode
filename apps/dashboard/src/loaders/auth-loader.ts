import { redirect } from "react-router";
import { z } from "zod";

import { getCallbackUrl } from "@/utils/get-callback-url";
import { isTRPCClientError, trpcLoaderClient } from "@/utils/trpc";
import { formatZodError } from "@repo/common/format-zod-error";
import { VSCodeCallbackUrlSchema } from "@repo/common/types-schemas";

// protects routes
export const protectedRouteLoader = async () => {
  try {
    await trpcLoaderClient.auth.checkAuthStatus.query();
  } catch (error) {
    if (isTRPCClientError(error) && error.data?.code === "UNAUTHORIZED") {
      throw redirect("/login");
    }
  }
};

// prevents a logged in user to access an auth route
export const authRouteLoader = async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const clientParam = decodeURIComponent(urlParams.get("client") ?? "");
  const callbackUrl = getCallbackUrl();

  // in the case of a vscode login attempt, logout the user from the dashboard
  if (callbackUrl && clientParam === "vscode") {
    const validatedCallBackUrl = VSCodeCallbackUrlSchema.safeParse(callbackUrl);
    if (!validatedCallBackUrl.success) {
      throw redirect("/dashboard");
    }

    try {
      await trpcLoaderClient.auth.logOut.mutate();
    } catch {
    } finally {
      return null;
    }
  }

  try {
    await trpcLoaderClient.auth.checkAuthStatus.query();
    return redirect("/dashboard");
  } catch {
    return null;
  }
};

export const googleAuthLoader = async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const clientParam = decodeURIComponent(urlParams.get("client") ?? "");
  const callbackUrl = getCallbackUrl();

  try {
    await trpcLoaderClient.auth.checkAuthStatus.query();
    return redirect("/dashboard");
  } catch {}

  const AUTH_GOOGLE_URL = import.meta.env.VITE_AUTH_GOOGLE_URL;

  const origin = window.location.origin;
  const authUrl = new URL(AUTH_GOOGLE_URL);
  authUrl.searchParams.set("state", origin);

  // the login request comes from the extension
  if (callbackUrl && clientParam === "vscode") {
    const validatedCallBackUrl = VSCodeCallbackUrlSchema.safeParse(callbackUrl);

    if (!validatedCallBackUrl.success) {
      const error = formatZodError(validatedCallBackUrl.error);
      throw new Error(error);
    }

    authUrl.searchParams.set("callback", validatedCallBackUrl.data);
  }

  window.location.href = authUrl.toString();
};

export const linkGoogleAccountLoader = async () => {
  await protectedRouteLoader();

  const LINKING_GOOGLE_ACCOUNT_URL = import.meta.env
    .VITE_LINKING_GOOGLE_ACCOUNT_URL;

  const origin = window.location.origin;
  const linkingUrl = new URL(LINKING_GOOGLE_ACCOUNT_URL);
  linkingUrl.searchParams.set("state", origin);

  window.location.href = linkingUrl.toString();
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

    const redirectUrl = new URL(validatedCallBackUrl.data);
    redirectUrl.searchParams.set("token", parsedGoogleAuthParams.data.token);
    redirectUrl.searchParams.set("email", parsedGoogleAuthParams.data.email);

    window.location.href = redirectUrl.toString();
  }

  return null;
};
