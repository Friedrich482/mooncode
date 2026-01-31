import { setLoginContext } from "../auth/loginContext";
import setStatusBarItem from "./setStatusBarItem";

const setLogoutContextAndStatusBar = async () => {
  await setLoginContext(false);
  setStatusBarItem({ type: "auth" });
};

export default setLogoutContextAndStatusBar;
