import { RouterProvider, createBrowserRouter } from "react-router";
import { authRouteLoader, protectedRouteLoader } from "./utils/authLoader";
import App from "./App";
import Dashboard from "./components/dashboard-page/Dashboard";
import Layout from "./components/layout/Layout";
import LoginForm from "./components/login-page/LoginForm";
import NotFound from "./components/not-found-page/NotFound";
import Project from "./components/project-page/Project";
import React from "react";
import RedirectToNotFound from "./components/not-found-page/RedirectToNotFound";
import RegisterForm from "./components/register-page/RegisterForm";
import Root from "./components/root-page/Root";
import { createRoot } from "react-dom/client";

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
