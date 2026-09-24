import React, { useState } from 'react';
import { PageHeader } from '../../shared/components/layout/PageHeader.jsx';
import { Button } from '../../shared/components/ui/Button.jsx';
import { Modal } from '../../shared/components/ui/Modal.jsx';
import { ProjectList } from '../../features/projects/components/ProjectList.jsx';
import { ProjectForm } from '../../features/projects/components/ProjectForm.jsx';
import { useProjects } from '../../features/projects/hooks/useProjects.js';
import { Plus } from 'lucide-react';

export const ProjectsPage = () => {
  const { projects, addProject } = useProjects();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCreate = (data) => {
    addProject(data);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Projects"
        subtitle="Track initiatives, milestones, and deliverables."
        action={
          <Button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2">
            <Plus size={16} />
            <span>New Project</span>
          </Button>
        }
      />

      <ProjectList projects={projects} />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create New Project"
      >
        <ProjectForm
          onSubmit={handleCreate}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>
    </div>
  );
};
