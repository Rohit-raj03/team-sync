import React from "react";
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import { ROUTES } from "./routes.js";
import { ProtectedRoute } from "./ProtectedRoute.jsx";
import { MainLayout } from "../../shared/components/layout/MainLayout.jsx";

import { LoginPage } from "../../pages/auth/LoginPage.jsx";
import { RegisterPage } from "../../pages/auth/RegisterPage.jsx";
import { ForgotPasswordPage } from "../../pages/auth/ForgotPasswordPage.jsx";
import { DashboardPage } from "../../pages/dashboard/DashboardPage.jsx";
import { TasksPage } from "../../pages/tasks/TasksPage.jsx";
import { CreateTaskPage } from "../../pages/tasks/CreateTaskPage.jsx";
import { TaskDetailsPage } from "../../pages/tasks/TaskDetailsPage.jsx";
import { ProjectsPage } from "../../pages/projects/ProjectsPage.jsx";
import { ProjectDetailsPage } from "../../pages/projects/ProjectDetailsPage.jsx";
import { TeamPage } from "../../pages/team/TeamPage.jsx";
import { TimelinePage } from "../../pages/timeline/TimelinePage.jsx";
import { FilesPage } from "../../pages/files/FilesPage.jsx";
import { MessagesPage } from "../../pages/messages/MessagesPage.jsx";
import { ProfilePage } from "../../pages/profile/ProfilePage.jsx";
import { SettingsPage } from "../../pages/settings/SettingsPage.jsx";
import { AdminDashboardPage } from "../../pages/admin/AdminDashboardPage.jsx";

const router = createBrowserRouter([
  {
    path: ROUTES.LOGIN,
    element: <LoginPage />,
  },
  {
    path: ROUTES.REGISTER,
    element: <RegisterPage />,
  },
  {
    path: ROUTES.FORGOT_PASSWORD,
    element: <ForgotPasswordPage />,
  },
  {
    path: ROUTES.HOME,
    element: <ProtectedRoute />,
    children: [
      {
        path: ROUTES.ADMIN,
        element: <AdminDashboardPage />,
      },
      {
        element: <MainLayout />,
        children: [
          {
            index: true,
            element: <Navigate to={ROUTES.DASHBOARD} replace />,
          },
          {
            path: ROUTES.DASHBOARD,
            element: <DashboardPage />,
          },
          {
            path: ROUTES.TASKS,
            element: <TasksPage />,
          },
          {
            path: ROUTES.CREATE_TASK,
            element: <CreateTaskPage />,
          },
          {
            path: ROUTES.TASK_DETAILS(":id"),
            element: <TaskDetailsPage />,
          },
          {
            path: ROUTES.PROJECTS,
            element: <ProjectsPage />,
          },
          {
            path: ROUTES.PROJECT_DETAILS(":id"),
            element: <ProjectDetailsPage />,
          },
          {
            path: ROUTES.TEAM,
            element: <TeamPage />,
          },
          {
            path: ROUTES.TIMELINE,
            element: <TimelinePage />,
          },
          {
            path: ROUTES.FILES,
            element: <FilesPage />,
          },
          {
            path: ROUTES.MESSAGES,
            element: <MessagesPage />,
          },
          {
            path: ROUTES.PROFILE,
            element: <ProfilePage />,
          },
          {
            path: ROUTES.SETTINGS,
            element: <SettingsPage />,
          },
        ],
      },
    ],
  },
  {
    path: "*",
    element: <Navigate to={ROUTES.DASHBOARD} replace />,
  },
]);

export const AppRouter = () => {
  return <RouterProvider router={router} />;
};
