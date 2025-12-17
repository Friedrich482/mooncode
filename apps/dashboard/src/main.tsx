import React from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router";

import App from "./App";
import LoginForm from "./components/auth/login-page/LoginForm";
import PasswordResetCodeVerification from "./components/auth/password-reset/code-verification/CodeVerification";
import ForgotPasswordForm from "./components/auth/password-reset/forgot-password/ForgotPasswordForm";
import ResetPassword from "./components/auth/password-reset/reset-password/ResetPassword";
import CodeVerification from "./components/auth/register-page/code-verification/CodeVerification";
import RegisterForm from "./components/auth/register-page/RegisterForm";
import Dashboard from "./components/dashboard-page/Dashboard";
import Layout from "./components/layout/Layout";
import NotFound from "./components/not-found-page/NotFound";
import RedirectToNotFound from "./components/not-found-page/RedirectToNotFound";
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
            element: <RedirectToNotFound />,
          },
        ],
      },
      {
        children: [
          {
            path: "login",
            element: <LoginForm />,
            loader: authRouteLoader,
          },
          {
            path: "register",
            element: <RegisterForm />,
            loader: authRouteLoader,
          },
          {
            path: "register/verify",
            element: <CodeVerification />,
            loader: pendingRegistrationLoader,
          },
          {
            path: "forgot-password",
            element: <ForgotPasswordForm />,
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
