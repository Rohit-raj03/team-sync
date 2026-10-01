import React from 'react';
import { FolderGrid } from '../../features/files/components/FolderGrid.jsx';
import { RecentFilesTable } from '../../features/files/components/RecentFilesTable.jsx';
import { FileStorageOverview } from '../../features/files/components/FileStorageOverview.jsx';
import { Upload, Plus } from 'lucide-react';
import { Button } from '../../shared/components/ui/Button.jsx';

/**
 * Presentation Layer: FilesPage (Screen 4 from Figma)
 * Layer: pages/files/
 * Responsibility: Assembles the Project Storage, folders grid, recent uploaded files table, and storage quota manager.
 */
export const FilesPage = () => {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Project Files & Assets</h2>
          <p className="text-xs text-slate-400 mt-0.5">Manage deliverables, design assets, and documentation across teams</p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="secondary" className="rounded-full flex items-center gap-1.5 text-xs font-semibold">
            <Plus size={15} />
            <span>New Folder</span>
          </Button>
          <Button className="rounded-full bg-linear-to-r from-indigo-600 to-blue-600 text-white shadow-md shadow-indigo-200 flex items-center gap-1.5 text-xs font-semibold">
            <Upload size={15} />
            <span>Upload File</span>
          </Button>
        </div>
      </div>

      {/* 1. Folders Grid */}
      <FolderGrid />

      {/* 2. Main Content Grid (Recent Files + Storage Quota Overview) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentFilesTable />
        </div>
        <div>
          <FileStorageOverview />
        </div>
      </div>
    </div>
  );
};

export default FilesPage;

