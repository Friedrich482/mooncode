import { AppRouter } from "@repo/trpc/router";
import { TRPCClientError } from "@trpc/client";

import { deleteToken } from "../auth/delete-token";
import { setLogoutContextAndStatusBar } from "../status-bar/set-logout-context-and-status-bar";

export const handleInvalidTokenError = async (
  error: TRPCClientError<AppRouter>,
) => {
  //  the authentication token is invalid because it is not recognized by the server
  if (error.data?.code === "UNAUTHORIZED") {
    await deleteToken();
    await setLogoutContextAndStatusBar();
  }
};
