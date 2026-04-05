import React from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router";

import { ForgotPassword } from "@/app/pages/auth/forgot-password";
import { Login } from "@/app/pages/auth/login";
import { CodeVerification as PasswordResetCodeVerification } from "@/app/pages/auth/password-reset-code-verification";
import { Register } from "@/app/pages/auth/register";
import { CodeVerification as RegisterCodeVerification } from "@/app/pages/auth/registration-code-verification";
import { ResetPassword } from "@/app/pages/auth/reset-password";
import { Dashboard } from "@/app/pages/dashboard";
import { NotFound } from "@/app/pages/not-found";
import { Project } from "@/app/pages/project/project";
import { UpdateEmail } from "@/app/pages/update-email/update-email";
import { Layout } from "@/components/layout/layout";
import { Layout as AuthLayout } from "@/features/auth/components/layout";
import {
  authRouteLoader,
  googleAuthLoader,
  linkGoogleAccountLoader,
  protectedRouteLoader,
} from "@/loaders/auth-loader";
import { dashboardLoader } from "@/loaders/dashboard-loader";
import { emailUpdateLoader } from "@/loaders/email-update-loader";
import { emailVerificationLoader } from "@/loaders/email-verification-loader";
import { passwordResetLoader } from "@/loaders/password-reset-loader";
import { projectLoader } from "@/loaders/project-loader";
import { redirectToNotFoundLoader } from "@/loaders/redirect-to-not-found-loader";
import { rootLoader } from "@/loaders/root-loader";

import { App } from "./app";
import { RegisterFinish } from "./pages/auth/register-finish";
import { Profile } from "./pages/profile/profile";

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
            path: "profile",
            element: <Profile />,
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
        element: <AuthLayout />,
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
            loader: emailVerificationLoader,
          },
          {
            path: "register/finish",
            element: <RegisterFinish />,
            loader: emailVerificationLoader,
          },
          {
            path: "forgot-password",
            element: <ForgotPassword />,
            loader: authRouteLoader,
          },
          {
            path: "verify-reset-code",
            element: <PasswordResetCodeVerification />,
            loader: passwordResetLoader,
          },
          {
            path: "reset-password",
            element: <ResetPassword />,
            loader: passwordResetLoader,
          },
          {
            path: "update-email/verify",
            element: <UpdateEmail />,
            loader: emailUpdateLoader,
          },
          {
            path: "auth/google",
            element: null,
            loader: googleAuthLoader,
          },
          {
            path: "auth/google/linking",
            element: null,
            loader: linkGoogleAccountLoader,
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
