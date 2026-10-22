import React, { Suspense } from "react";
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import { ROUTES } from "./routes.js";
import { ProtectedRoute } from "./ProtectedRoute.jsx";
import { MainLayout } from "../../shared/components/layout/MainLayout.jsx";
import { PageLoadingFallback } from "../../shared/components/ui/PageLoadingFallback.jsx";
import { RouteErrorBoundary } from "../../shared/components/ui/RouteErrorBoundary.jsx";

// Safe lazy loading: automatically supports both default and named component exports
const safeLazy = (importFn) =>
  React.lazy(async () => {
    const mod = await importFn();
    const component =
      mod.default ||
      Object.values(mod).find((val) => typeof val === "function") ||
      mod;
    return { default: component };
  });

// Lazy-loaded route pages for on-demand bundle splitting
const LoginPage = safeLazy(() => import("../../pages/auth/LoginPage.jsx"));
const RegisterPage = safeLazy(() => import("../../pages/auth/RegisterPage.jsx"));
const ForgotPasswordPage = safeLazy(() => import("../../pages/auth/ForgotPasswordPage.jsx"));
const ResetPasswordPage = safeLazy(() => import("../../pages/auth/ResetPasswordPage.jsx"));
const DashboardPage = safeLazy(() => import("../../pages/dashboard/DashboardPage.jsx"));
const TasksPage = safeLazy(() => import("../../pages/tasks/TasksPage.jsx"));
const CreateTaskPage = safeLazy(() => import("../../pages/tasks/CreateTaskPage.jsx"));
const TaskDetailsPage = safeLazy(() => import("../../pages/tasks/TaskDetailsPage.jsx"));
const ProjectsPage = safeLazy(() => import("../../pages/projects/ProjectsPage.jsx"));
const ProjectDetailsPage = safeLazy(() => import("../../pages/projects/ProjectDetailsPage.jsx"));
const TeamPage = safeLazy(() => import("../../pages/team/TeamPage.jsx"));
const TimelinePage = safeLazy(() => import("../../pages/timeline/TimelinePage.jsx"));
const FilesPage = safeLazy(() => import("../../pages/files/FilesPage.jsx"));
const MessagesPage = safeLazy(() => import("../../pages/messages/MessagesPage.jsx"));
const ProfilePage = safeLazy(() => import("../../pages/profile/ProfilePage.jsx"));
const SettingsPage = safeLazy(() => import("../../pages/settings/SettingsPage.jsx"));
const AdminDashboardPage = safeLazy(() => import("../../pages/admin/AdminDashboardPage.jsx"));

const withSuspense = (Component, message) => (
  <Suspense fallback={<PageLoadingFallback message={message} />}>
    <Component />
  </Suspense>
);

const router = createBrowserRouter([
  {
    path: ROUTES.LOGIN,
    element: withSuspense(LoginPage, "Loading login..."),
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: ROUTES.REGISTER,
    element: withSuspense(RegisterPage, "Loading registration..."),
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: ROUTES.FORGOT_PASSWORD,
    element: withSuspense(ForgotPasswordPage, "Loading password recovery..."),
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: ROUTES.RESET_PASSWORD,
    element: withSuspense(ResetPasswordPage, "Loading password reset..."),
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: ROUTES.HOME,
    element: <ProtectedRoute />,
    errorElement: <RouteErrorBoundary />,
    children: [
      {
        element: <ProtectedRoute allowedRoles={["admin"]} />,
        children: [
          {
            path: ROUTES.ADMIN,
            element: withSuspense(AdminDashboardPage, "Loading admin dashboard..."),
          },
        ],
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
            element: withSuspense(DashboardPage, "Loading dashboard..."),
          },
          {
            path: ROUTES.TASKS,
            element: withSuspense(TasksPage, "Loading tasks..."),
          },
          {
            path: ROUTES.CREATE_TASK,
            element: withSuspense(CreateTaskPage, "Loading task editor..."),
          },
          {
            path: ROUTES.TASK_DETAILS(":id"),
            element: withSuspense(TaskDetailsPage, "Loading task details..."),
          },
          {
            path: ROUTES.PROJECTS,
            element: withSuspense(ProjectsPage, "Loading projects..."),
          },
          {
            path: ROUTES.PROJECT_DETAILS(":id"),
            element: withSuspense(ProjectDetailsPage, "Loading project details..."),
          },
          {
            path: ROUTES.TEAM,
            element: withSuspense(TeamPage, "Loading team..."),
          },
          {
            path: ROUTES.TIMELINE,
            element: withSuspense(TimelinePage, "Loading timeline..."),
          },
          {
            path: ROUTES.FILES,
            element: withSuspense(FilesPage, "Loading files..."),
          },
          {
            path: ROUTES.MESSAGES,
            element: withSuspense(MessagesPage, "Loading messages..."),
          },
          {
            path: ROUTES.PROFILE,
            element: withSuspense(ProfilePage, "Loading profile..."),
          },
          {
            path: ROUTES.SETTINGS,
            element: withSuspense(SettingsPage, "Loading settings..."),
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

export default AppRouter;
