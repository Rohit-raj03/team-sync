import React from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { ROUTES } from './routes.js';
import { ProtectedRoute } from './ProtectedRoute.jsx';
import { MainLayout } from '../../shared/components/layout/MainLayout.jsx';

import { LoginPage } from '../../pages/auth/LoginPage.jsx';
import { RegisterPage } from '../../pages/auth/RegisterPage.jsx';
import { DashboardPage } from '../../pages/dashboard/DashboardPage.jsx';
import { TasksPage } from '../../pages/tasks/TasksPage.jsx';
import { TaskDetailsPage } from '../../pages/tasks/TaskDetailsPage.jsx';
import { ProjectsPage } from '../../pages/projects/ProjectsPage.jsx';
import { ProjectDetailsPage } from '../../pages/projects/ProjectDetailsPage.jsx';
import { TeamPage } from '../../pages/team/TeamPage.jsx';
import { ProfilePage } from '../../pages/profile/ProfilePage.jsx';
import { SettingsPage } from '../../pages/settings/SettingsPage.jsx';

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
    path: ROUTES.HOME,
    element: <ProtectedRoute />,
    children: [
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
            path: ROUTES.TASK_DETAILS(':id'),
            element: <TaskDetailsPage />,
          },
          {
            path: ROUTES.PROJECTS,
            element: <ProjectsPage />,
          },
          {
            path: ROUTES.PROJECT_DETAILS(':id'),
            element: <ProjectDetailsPage />,
          },
          {
            path: ROUTES.TEAM,
            element: <TeamPage />,
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
    path: '*',
    element: <Navigate to={ROUTES.DASHBOARD} replace />,
  },
]);

export const AppRouter = () => {
  return <RouterProvider router={router} />;
};
