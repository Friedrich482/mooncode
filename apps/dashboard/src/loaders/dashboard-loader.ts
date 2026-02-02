import {
  protectedRouteLoader,
  redirectToVSCodeAfterGoogleAuthLoader,
} from "./auth-loader";

export const dashboardLoader = async () => {
  await protectedRouteLoader();
  await redirectToVSCodeAfterGoogleAuthLoader();

  return;
};
