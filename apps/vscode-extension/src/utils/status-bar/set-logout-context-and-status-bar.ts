import { setLoginContext } from "../auth/login-context";
import { setStatusBarItem } from "./set-status-bar-item";

export const setLogoutContextAndStatusBar = async () => {
  await setLoginContext(false);
  setStatusBarItem({ type: "auth" });
};
