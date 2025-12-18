import React from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router";

import App from "./App";
import Login from "./components/auth/login-page/Login";
import PasswordResetCodeVerification from "./components/auth/password-reset/code-verification/CodeVerification";
import ForgotPassword from "./components/auth/password-reset/forgot-password/ForgotPassword";
import ResetPassword from "./components/auth/password-reset/reset-password/ResetPassword";
import CodeVerification from "./components/auth/register-page/code-verification/CodeVerification";
import Register from "./components/auth/register-page/Register";
import Dashboard from "./components/dashboard-page/Dashboard";
import Layout from "./components/layout/Layout";
import NotFound from "./components/not-found-page/NotFound";
import Project from "./components/project-page/Project";
import Root from "./components/root-page/Root";
import {
  authRouteLoader,
  googleAuthLoader,
  protectedRouteLoader,
  redirectToVSCodeAfterGoogleAuthLoader,
} from "./utils/loader/authLoader";
import passwordResetCodeVerificationLoader from "./utils/loader/passwordResetCodeVerificationLoader";
import passwordResetLoader from "./utils/loader/passwordResetLoader";
import pendingRegistrationLoader from "./utils/loader/pendingRegistrationLoader";
import redirectToNotFoundLoader from "./utils/loader/redirectToNotFoundLoader";

const router = createBrowserRouter([
  {
    element: <App />,
    children: [
      {
        element: <Layout />,
        children: [
          {
            index: true,
            element: <Root />,
            loader: redirectToVSCodeAfterGoogleAuthLoader,
          },
          {
            path: "dashboard",
            element: <Dashboard />,
            loader: protectedRouteLoader,
          },
          {
            path: "dashboard/:projectName",
            element: <Project />,
            loader: protectedRouteLoader,
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
            element: <CodeVerification />,
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
