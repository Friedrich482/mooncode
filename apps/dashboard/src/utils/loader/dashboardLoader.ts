import {
  protectedRouteLoader,
  redirectToVSCodeAfterGoogleAuthLoader,
} from "./authLoader";

const dashboardLoader = async () => {
  await protectedRouteLoader();
  await redirectToVSCodeAfterGoogleAuthLoader();

  return;
};

export default dashboardLoader;
