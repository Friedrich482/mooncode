import { getExtensionContext } from "@/extension";

import setStatusBarAfterLogin from "../status-bar/setStatusBarAfterLogin";
import setStatusBarItem from "../status-bar/setStatusBarItem";
import { setLoginContext } from "./loginContext";
import parseJwtPayload from "./parseJwtPayload";

const getToken = async () => {
  const context = getExtensionContext();

  let token = await context.secrets.get("authToken");

  const parsedPayload = parseJwtPayload(token);

  if (!parsedPayload.success) {
    await setLoginContext(false);
    setStatusBarItem({ type: "auth" });

    token = await context.secrets.get("authToken");
    return token;
  }

  const { exp: expireDate } = parsedPayload.data;

  if (!token || expireDate * 1000 < Date.now()) {
    await setLoginContext(false);
    setStatusBarItem({ type: "auth" });

    token = await context.secrets.get("authToken");
  }

  await setLoginContext(true);
  await setStatusBarAfterLogin();

  return token;
};
export default getToken;
