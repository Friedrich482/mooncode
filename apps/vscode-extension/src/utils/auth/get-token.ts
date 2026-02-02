import { getExtensionContext } from "@/extension";

import { setLoginContextAndStatusBar } from "../status-bar/set-login-context-and-status-bar";
import { setLogoutContextAndStatusBar } from "../status-bar/set-logout-context-and-status-bar";
import { parseJwtPayload } from "./parse-jwt-payload";

export const getToken = async () => {
  const context = getExtensionContext();

  const token = await context.secrets.get("authToken");

  const parsedPayload = parseJwtPayload(token);

  if (!parsedPayload.success) {
    await setLogoutContextAndStatusBar();
    return token;
  }

  const { exp: expireDate } = parsedPayload.data;

  if (!token || expireDate * 1000 < Date.now()) {
    await setLogoutContextAndStatusBar();
    return token;
  }

  await setLoginContextAndStatusBar();
  return token;
};
