import { getExtensionContext } from "@/extension";

import setLoginContextAndStatusBar from "../status-bar/setLoginContextAndStatusBar";
import setLogoutContextAndStatusBar from "../status-bar/setLogoutContextAndStatusBar";
import parseJwtPayload from "./parseJwtPayload";

const getToken = async () => {
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

export default getToken;
