import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageHeader } from '../../shared/components/layout/PageHeader.jsx';
import { Button } from '../../shared/components/ui/Button.jsx';
import { ArrowLeft } from 'lucide-react';

export const ProjectDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <Button
        variant="ghost"
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-slate-500"
      >
        <ArrowLeft size={16} /> Back to projects
      </Button>
      <PageHeader title={`Project: ${id}`} subtitle="Project details and milestones" />
      <div className="p-8 bg-white rounded-3xl border border-slate-100">
        <p className="text-slate-500">Project timeline and tasks roadmap view.</p>
      </div>
    </div>
  );
};
