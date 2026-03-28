import { getExtensionContext } from "@/extension";

import { setLoginContextAndStatusBar } from "../status-bar/set-login-context-and-status-bar";
import { setLogoutContextAndStatusBar } from "../status-bar/set-logout-context-and-status-bar";
import { deleteToken } from "./delete-token";
import { parseJwtPayload } from "./parse-jwt-payload";

export const validateAndRetrieveToken = async () => {
  const context = getExtensionContext();

  const token = await context.secrets.get("authToken");

  if (!token) {
    await setLogoutContextAndStatusBar();
    return;
  }

  const parsedPayload = parseJwtPayload(token);

  if (!parsedPayload.success) {
    // malformed jwt token, we delete it
    await deleteToken();
    await setLogoutContextAndStatusBar();
    return;
  }

  const { exp: expireDate } = parsedPayload.data;

  if (expireDate * 1000 < Date.now()) {
    // expired token, we also delete it
    await deleteToken();
    await setLogoutContextAndStatusBar();
    return;
  }

  await setLoginContextAndStatusBar();
  return token;
};
