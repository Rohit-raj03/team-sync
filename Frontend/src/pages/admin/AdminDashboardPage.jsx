import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Shield,
  Bell,
  Search,
  Menu,
  X,
  ExternalLink,
  ChevronRight,
  Sparkles,
  LayoutGrid,
} from 'lucide-react';
import { AdminSidebar } from '../../features/admin/components/AdminSidebar.jsx';
import { AdminStatsOverview } from '../../features/admin/components/AdminStatsOverview.jsx';
import { AdminTaskChart } from '../../features/admin/components/AdminTaskChart.jsx';
import { AdminProjectProgress } from '../../features/admin/components/AdminProjectProgress.jsx';
import { AdminUserManagement } from '../../features/admin/components/AdminUserManagement.jsx';
import { AdminProjectManagement } from '../../features/admin/components/AdminProjectManagement.jsx';
import { AdminTaskManagement } from '../../features/admin/components/AdminTaskManagement.jsx';
import { AdminRolesPermissions } from '../../features/admin/components/AdminRolesPermissions.jsx';
import { AdminActivityLogs } from '../../features/admin/components/AdminActivityLogs.jsx';
import { AdminOrgSettings } from '../../features/admin/components/AdminOrgSettings.jsx';
import { AdminToast } from '../../features/admin/components/AdminToast.jsx';
import { useAdminData } from '../../features/admin/hooks/useAdminData.js';
import { CreateProjectModal } from '../../features/projects/components/CreateProjectModal.jsx';
import { CreateTaskModal } from '../../features/tasks/components/CreateTaskModal.jsx';
import { TaskDetails } from '../../features/tasks/components/TaskDetails.jsx';
import { Modal } from '../../shared/components/ui/Modal.jsx';
import { useProjects } from '../../features/projects/hooks/useProjects.js';
import { useTasks } from '../../features/tasks/hooks/useTasks.js';
import { useAuth } from '../../features/auth/hooks/useAuth.js';
import { Avatar } from '../../shared/components/ui/Avatar.jsx';
import { ROUTES } from '../../shared/constants/routes.js';

/**
 * Presentation Layer: AdminDashboardPage
 * Layer: pages/admin/
 * Responsibility: Complete administrative master dashboard coordinating users, projects, tasks, security roles, activity logs, and settings.
 */
export const AdminDashboardPage = () => {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const {
    users,
    permissions,
    activityLogs,
    metrics,
    toast,
    showToast,
    addUser,
    updateUser,
    toggleUserStatus,
    removeUser,
    updatePermission,
    deleteProject,
    updateTask,
    deleteTask,
    addLog,
  } = useAdminData();

  const { allProjects, addProject } = useProjects();
  const { allTasks, addTask } = useTasks();

  const [activeTab, setActiveTab] = useState('overview');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Modals for creation & task inspection
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [selectedTaskForDetails, setSelectedTaskForDetails] = useState(null);

  const handleCreateProject = (projectData) => {
    addProject(projectData);
    addLog('Admin', 'created a new project', projectData.name, 'Projects');
    showToast(`Project "${projectData.name}" created successfully.`);
    setIsCreateProjectOpen(false);
  };

  const handleCreateTask = (taskData) => {
    addTask(taskData);
    addLog('Admin', 'created a new task', taskData.title, 'Tasks');
    showToast(`Task "${taskData.title}" created successfully.`);
    setIsCreateTaskOpen(false);
  };

  return (
    <div className="flex h-screen bg-[#F4F7FE] overflow-hidden">
      {/* 1. Desktop & Mobile Admin Sidebar */}
      <div className="hidden lg:block h-full">
        <AdminSidebar
          activeTab={activeTab}
          onSelectTab={(tab) => setActiveTab(tab)}
          overdueCount={metrics.overdueTasks}
        />
      </div>

      {/* Mobile Drawer */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            onClick={() => setIsMobileSidebarOpen(false)}
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs"
          />
          <div className="relative w-64 bg-white h-full z-10 animate-in slide-in-from-left duration-200">
            <button
              onClick={() => setIsMobileSidebarOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-xl text-slate-400 hover:text-slate-700"
            >
              <X size={18} />
            </button>
            <AdminSidebar
              activeTab={activeTab}
              onSelectTab={(tab) => {
                setActiveTab(tab);
                setIsMobileSidebarOpen(false);
              }}
              overdueCount={metrics.overdueTasks}
            />
          </div>
        </div>
      )}

      {/* 2. Main Admin Workspace Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Admin Top Navigation Bar */}
        <header className="h-16 px-6 bg-white border-b border-slate-100 flex items-center justify-between shrink-0 select-none">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 lg:hidden"
            >
              <Menu size={20} />
            </button>

            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <h1 className="text-sm font-bold text-slate-900">
                Organization Administration
              </h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-[#4361EE] hidden sm:inline-block">
                Root Access
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to={ROUTES.DASHBOARD}
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-[#4361EE] px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors"
            >
              <LayoutGrid size={14} />
              <span>User App</span>
            </Link>

            <div className="flex items-center gap-2.5 pl-2 border-l border-slate-100">
              <Avatar
                src={currentUser?.avatar}
                name={currentUser?.name || 'Administrator'}
                size="sm"
                className="ring-2 ring-indigo-50"
              />
              <div className="hidden sm:block text-left">
                <p className="text-xs font-bold text-slate-900 leading-tight">
                  {currentUser?.name || 'Administrator'}
                </p>
                <p className="text-[10px] text-purple-600 font-semibold capitalize">
                  {currentUser?.role === 'admin' ? 'Super Admin' : currentUser?.role || 'Admin'}
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Admin View Body */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-8">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-8 max-w-7xl mx-auto">
              <AdminStatsOverview metrics={metrics} />

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-7">
                  <AdminTaskChart />
                </div>
                <div className="lg:col-span-5">
                  <AdminProjectProgress
                    projects={allProjects}
                    onProjectClick={(id) => navigate(ROUTES.PROJECT_DETAILS(id))}
                  />
                </div>
              </div>

              {/* User Activity & Recent Log Previews */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-8">
                  <AdminActivityLogs logs={activityLogs.slice(0, 4)} />
                </div>
                <div className="lg:col-span-4 p-6 bg-white rounded-3xl border border-slate-100/90 shadow-sm space-y-4">
                  <h3 className="text-sm font-bold text-slate-900">Admin Shortcuts</h3>
                  <div className="space-y-2">
                    <button
                      onClick={() => setActiveTab('users')}
                      className="w-full text-left p-3 rounded-2xl bg-slate-50 hover:bg-indigo-50/60 transition-colors flex items-center justify-between text-xs font-semibold text-slate-800"
                    >
                      <span>Manage All Users</span>
                      <ChevronRight size={14} className="text-slate-400" />
                    </button>
                    <button
                      onClick={() => setIsCreateProjectOpen(true)}
                      className="w-full text-left p-3 rounded-2xl bg-slate-50 hover:bg-indigo-50/60 transition-colors flex items-center justify-between text-xs font-semibold text-slate-800"
                    >
                      <span>Launch New Project</span>
                      <ChevronRight size={14} className="text-slate-400" />
                    </button>
                    <button
                      onClick={() => setIsCreateTaskOpen(true)}
                      className="w-full text-left p-3 rounded-2xl bg-slate-50 hover:bg-indigo-50/60 transition-colors flex items-center justify-between text-xs font-semibold text-slate-800"
                    >
                      <span>Create Global Task</span>
                      <ChevronRight size={14} className="text-slate-400" />
                    </button>
                    <button
                      onClick={() => setActiveTab('roles')}
                      className="w-full text-left p-3 rounded-2xl bg-slate-50 hover:bg-indigo-50/60 transition-colors flex items-center justify-between text-xs font-semibold text-slate-800"
                    >
                      <span>Audit Roles & Permissions</span>
                      <ChevronRight size={14} className="text-slate-400" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ANALYTICS */}
          {activeTab === 'analytics' && (
            <div className="space-y-6 max-w-7xl mx-auto">
              <AdminStatsOverview metrics={metrics} />
              <AdminTaskChart />
              <AdminProjectProgress
                projects={allProjects}
                onProjectClick={(id) => navigate(ROUTES.PROJECT_DETAILS(id))}
              />
            </div>
          )}

          {/* TAB 3: USER MANAGEMENT */}
          {activeTab === 'users' && (
            <div className="max-w-7xl mx-auto">
              <AdminUserManagement
                users={users}
                onAddUser={addUser}
                onUpdateUser={updateUser}
                onToggleStatus={toggleUserStatus}
                onRemoveUser={removeUser}
              />
            </div>
          )}

          {/* TAB 4: ROLES & PERMISSIONS */}
          {activeTab === 'roles' && (
            <div className="max-w-7xl mx-auto">
              <AdminRolesPermissions
                permissions={permissions}
                onUpdatePermission={updatePermission}
              />
            </div>
          )}

          {/* TAB 5: PROJECT MANAGEMENT */}
          {activeTab === 'projects' && (
            <div className="max-w-7xl mx-auto">
              <AdminProjectManagement
                projects={allProjects}
                onDeleteProject={deleteProject}
                onOpenCreateProject={() => setIsCreateProjectOpen(true)}
              />
            </div>
          )}

          {/* TAB 6: TASK MANAGEMENT & OVERDUE */}
          {(activeTab === 'tasks' || activeTab === 'overdue-tasks') && (
            <div className="max-w-7xl mx-auto">
              <AdminTaskManagement
                tasks={allTasks}
                initialFilter={activeTab === 'overdue-tasks' ? 'OVERDUE' : 'ALL'}
                onUpdateTask={updateTask}
                onDeleteTask={deleteTask}
                onOpenCreateTask={() => setIsCreateTaskOpen(true)}
                onOpenTaskDetails={(t) => setSelectedTaskForDetails(t)}
              />
            </div>
          )}

          {/* TAB 7: ACTIVITY LOGS */}
          {activeTab === 'logs' && (
            <div className="max-w-7xl mx-auto">
              <AdminActivityLogs logs={activityLogs} />
            </div>
          )}

          {/* TAB 8: SETTINGS */}
          {activeTab === 'settings' && (
            <div className="max-w-7xl mx-auto">
              <AdminOrgSettings
                onSaveSettings={(data) => {
                  addLog('Admin', 'updated organization settings', data.orgName, 'Settings');
                  showToast('Organization settings updated.');
                }}
              />
            </div>
          )}
        </main>
      </div>

      {/* Global Modals for Creation & Inspection */}
      <CreateProjectModal
        isOpen={isCreateProjectOpen}
        onClose={() => setIsCreateProjectOpen(false)}
        onSubmit={handleCreateProject}
      />

      <CreateTaskModal
        isOpen={isCreateTaskOpen}
        onClose={() => setIsCreateTaskOpen(false)}
        onSubmit={handleCreateTask}
      />

      <Modal
        isOpen={!!selectedTaskForDetails}
        onClose={() => setSelectedTaskForDetails(null)}
        title="Task Overview"
        maxWidth="max-w-2xl"
      >
        <TaskDetails
          task={selectedTaskForDetails}
          taskId={selectedTaskForDetails?.id}
          onUpdate={(t) => setSelectedTaskForDetails(t)}
        />
      </Modal>

      {/* Toast Feedback */}
      <AdminToast toast={toast} onClose={() => {}} />
    </div>
  );
};

export default AdminDashboardPage;
