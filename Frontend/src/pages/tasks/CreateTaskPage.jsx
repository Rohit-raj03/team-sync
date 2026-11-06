import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, CheckCircle2, ChevronRight } from "lucide-react";
import { PageHeader } from "../../shared/components/layout/PageHeader.jsx";
import { Card } from "../../shared/components/ui/Card.jsx";
import { CreateTaskForm } from "../../features/tasks/components/CreateTaskForm.jsx";
import { useTasks } from "../../features/tasks/hooks/useTasks.js";
import { ROUTES } from "../../shared/constants/routes.js";

/**
 * Presentation Layer: CreateTaskPage
 * Layer: pages/tasks/
 * Responsibility: Full page-level route component for creating tasks with breadcrumb trail, status alerts, and task dispatching.
 */
export const CreateTaskPage = () => {
  const navigate = useNavigate();
  const { addTask } = useTasks();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdSuccess, setCreatedSuccess] = useState(false);

  const handleSubmit = async (taskData) => {
    setIsSubmitting(true);
    try {
      await addTask(taskData);
      setCreatedSuccess(true);
      setTimeout(() => {
        navigate(ROUTES.TASKS);
      }, 700);
    } catch (err) {
      console.error("Create task failed:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate(ROUTES.TASKS);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs font-medium text-slate-400">
        <Link
          to={ROUTES.TASKS}
          className="hover:text-slate-700 transition-colors flex items-center gap-1.5"
        >
          <ArrowLeft size={13} />
          <span>Tasks</span>
        </Link>
        <ChevronRight size={13} className="text-slate-300" />
        <span className="text-slate-700 font-semibold">Create New Task</span>
      </nav>

      {/* Page Header */}
      <PageHeader
        title="Create New Task"
        subtitle="Define project goals, assign team members, configure deadlines, and attach resources."
        action={
          <button
            onClick={() => navigate(ROUTES.TASKS)}
            className="px-4 py-2 rounded-2xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors flex items-center gap-1.5"
          >
            <ArrowLeft size={14} />
            <span>Back to Tasks</span>
          </button>
        }
      />

      {/* Success Notification Alert */}
      {createdSuccess && (
        <div className="p-4 rounded-3xl bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs font-semibold flex items-center gap-3 animate-in fade-in duration-200">
          <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
          <span>Task created successfully! Redirecting to task list...</span>
        </div>
      )}

      {/* Main Container */}
      <Card className="p-6 md:p-8 border border-slate-100/90 shadow-sm">
        <CreateTaskForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isSubmitting={isSubmitting}
        />
      </Card>
    </div>
  );
};

export default CreateTaskPage;
