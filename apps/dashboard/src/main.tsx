import React from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router";

import { App } from "./App";
import { Login } from "./components/auth/login-page/login";
import { CodeVerification as PasswordResetCodeVerification } from "./components/auth/password-reset/code-verification/code-verification";
import { ForgotPassword } from "./components/auth/password-reset/forgot-password/forgot-password";
import { ResetPassword } from "./components/auth/password-reset/reset-password/reset-password";
import { CodeVerification as RegisterCodeVerification } from "./components/auth/register-page/code-verification/code-verification";
import { Register } from "./components/auth/register-page/register";
import { Dashboard } from "./components/dashboard-page/dashboard";
import { Layout } from "./components/layout/layout";
import { NotFound } from "./components/not-found-page/not-found";
import { Project } from "./components/project-page/project";
import { authRouteLoader, googleAuthLoader } from "./utils/loader/auth-loader";
import { dashboardLoader } from "./utils/loader/dashboard-loader";
import { passwordResetCodeVerificationLoader } from "./utils/loader/password-reset-code-verification-loader";
import { passwordResetLoader } from "./utils/loader/password-reset-loader";
import { pendingRegistrationLoader } from "./utils/loader/pending-registration-loader";
import { projectLoader } from "./utils/loader/project-loader";
import { redirectToNotFoundLoader } from "./utils/loader/redirect-to-not-found-loader";
import { rootLoader } from "./utils/loader/root-loader";

const router = createBrowserRouter([
  {
    element: <App />,
    children: [
      {
        element: <Layout />,
        children: [
          {
            index: true,
            loader: rootLoader,
          },
          {
            path: "dashboard",
            element: <Dashboard />,
            loader: dashboardLoader,
          },
          {
            path: "dashboard/:projectName",
            element: <Project />,
            loader: projectLoader,
          },
          {
            path: "not-found",
            element: <NotFound />,
          },
          {
            path: "*",
            loader: redirectToNotFoundLoader,
          },
        ],
      },
      {
        children: [
          {
            path: "login",
            element: <Login />,
            loader: authRouteLoader,
          },
          {
            path: "register",
            element: <Register />,
            loader: authRouteLoader,
          },
          {
            path: "register/verify",
            element: <RegisterCodeVerification />,
            loader: pendingRegistrationLoader,
          },
          {
            path: "forgot-password",
            element: <ForgotPassword />,
            loader: authRouteLoader,
          },
          {
            path: "verify-reset-code",
            element: <PasswordResetCodeVerification />,
            loader: passwordResetCodeVerificationLoader,
          },
          {
            path: "reset-password",
            element: <ResetPassword />,
            loader: passwordResetLoader,
          },
          {
            path: "auth/google",
            element: null,
            loader: googleAuthLoader,
          },
        ],
      },
    ],
  },
]);

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);
