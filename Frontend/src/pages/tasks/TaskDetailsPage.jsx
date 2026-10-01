import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageHeader } from '../../shared/components/layout/PageHeader.jsx';
import { Button } from '../../shared/components/ui/Button.jsx';
import { TaskDetails } from '../../features/tasks/components/TaskDetails.jsx';
import { useTask } from '../../features/tasks/hooks/useTask.js';
import { ArrowLeft } from 'lucide-react';

export const TaskDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { task } = useTask(id);

  return (
    <div className="space-y-6 max-w-3xl">
      <Button
        variant="ghost"
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-slate-500"
      >
        <ArrowLeft size={16} /> Back to tasks
      </Button>
      <PageHeader title="Task Details" />
      <div className="p-8 bg-white rounded-3xl border border-slate-100">
        <TaskDetails task={task} />
      </div>
    </div>
  );
};
