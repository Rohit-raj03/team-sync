import React, { useState, useRef } from "react";
import { FolderGrid } from "../../features/files/components/FolderGrid.jsx";
import { RecentFilesTable } from "../../features/files/components/RecentFilesTable.jsx";
import { FileStorageOverview } from "../../features/files/components/FileStorageOverview.jsx";
import { Upload, Plus, FolderPlus } from "lucide-react";
import { Button } from "../../shared/components/ui/Button.jsx";
import { Modal } from "../../shared/components/ui/Modal.jsx";
import { useAuth } from "../../features/auth/hooks/useAuth.js";
import { taskService } from "../../features/tasks/services/task.service.js";
import { formatDate } from "../../shared/utils/formatDate.js";
import toast from "react-hot-toast";

/**
 * Presentation Layer: FilesPage (Screen 4 from Figma)
 * Layer: pages/files/
 * Responsibility: Assembles the Project Storage, folders grid, recent uploaded files table, storage quota manager,
 * and live interactive file uploading and category filtering.
 */
export const FilesPage = () => {
  const { user: currentUser } = useAuth();
  const headerFileInputRef = useRef(null);

  const [selectedFolder, setSelectedFolder] = useState(null);
  const [customFolders, setCustomFolders] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // New folder modal state
  const [isNewFolderOpen, setIsNewFolderOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");

  const handleUploadFiles = async (files) => {
    if (!files || files.length === 0) return;
    const fileList = Array.from(files);

    setIsUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    fileList.forEach((file) => formData.append("files", file));

    try {
      const res = await taskService.uploadAttachments(formData, {
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const pct = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total,
            );
            setUploadProgress(pct);
          }
        },
      });

      const uploadedList = (
        Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res?.attachments)
            ? res.attachments
            : Array.isArray(res)
              ? res
              : [res]
      ).filter(Boolean);

      const itemsToAdd = (
        uploadedList.length > 0 ? uploadedList : fileList
      ).map((f, i) => ({
        id: f._id || f.id || f.fileId || `direct-up-${Date.now()}-${i}`,
        name: f.name || f.originalName || fileList[i]?.name || "Uploaded File",
        type: f.type || f.mimeType || fileList[i]?.type || "Attachment",
        size: f.size
          ? `${(f.size / (1024 * 1024)).toFixed(1)} MB`
          : `${(fileList[i]?.size ? fileList[i].size / (1024 * 1024) : 1.2).toFixed(1)} MB`,
        date: formatDate(new Date()),
        author: currentUser?.name || "You",
        url: f.url || "#",
        taskName: "Workspace Asset",
        folder: selectedFolder || "General",
      }));

      setUploadedFiles((prev) => [...itemsToAdd, ...prev]);
      toast.success(
        `Uploaded ${itemsToAdd.length} file${itemsToAdd.length === 1 ? "" : "s"} successfully!`,
      );
    } catch (err) {
      toast.error(
        err?.response?.data?.message ||
          "Could not upload file(s). Please try again.",
      );
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleCreateFolder = (e) => {
    e.preventDefault();
    const trimmed = newFolderName.trim();
    if (!trimmed) {
      toast.error("Please enter a folder name.");
      return;
    }

    const newFolder = {
      id: `custom-folder-${Date.now()}`,
      name: trimmed,
      filesCount: 0,
      size: "0 MB",
    };

    setCustomFolders((prev) => [...prev, newFolder]);
    setSelectedFolder(trimmed);
    setNewFolderName("");
    setIsNewFolderOpen(false);
    toast.success(`Folder "${trimmed}" created!`);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Hidden file input for header button */}
      <input
        type="file"
        ref={headerFileInputRef}
        multiple
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            handleUploadFiles(e.target.files);
            e.target.value = "";
          }
        }}
        className="hidden"
        accept="image/*,.pdf,.doc,.docx,.txt,.zip,.fig,.mp4,.json,.js,.jsx,.ts,.tsx"
      />

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Project Files & Assets
          </h2>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">
            Manage deliverables, design assets, and documentation across teams
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="secondary"
            onClick={() => setIsNewFolderOpen(true)}
            className="rounded-full flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
          >
            <Plus size={15} />
            <span>New Folder</span>
          </Button>

          <Button
            type="button"
            onClick={() => headerFileInputRef.current?.click()}
            disabled={isUploading}
            className="rounded-full bg-linear-to-r from-indigo-600 to-blue-600 text-white shadow-md shadow-indigo-200 flex items-center gap-1.5 text-xs font-semibold cursor-pointer disabled:opacity-50"
          >
            <Upload size={15} />
            <span>{isUploading ? "Uploading..." : "Upload File"}</span>
          </Button>
        </div>
      </div>

      {/* 1. Folders Grid with Selection / Filtering */}
      <FolderGrid
        selectedFolder={selectedFolder}
        onSelectFolder={setSelectedFolder}
        customFolders={customFolders}
      />

      {/* 2. Main Content Grid (Recent Files + Storage Quota Overview) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentFilesTable
            selectedFolder={selectedFolder}
            onClearFilter={() => setSelectedFolder(null)}
            additionalFiles={uploadedFiles}
          />
        </div>
        <div>
          <FileStorageOverview
            onUploadFiles={handleUploadFiles}
            isUploading={isUploading}
            uploadProgress={uploadProgress}
            totalFilesCount={uploadedFiles.length}
          />
        </div>
      </div>

      {/* New Folder Modal */}
      <Modal
        isOpen={isNewFolderOpen}
        onClose={() => setIsNewFolderOpen(false)}
        title="Create New Folder"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleCreateFolder} className="space-y-4">
          <div className="space-y-1.5">
            <label
              htmlFor="new-folder-name"
              className="block text-xs font-bold uppercase tracking-wider text-slate-700"
            >
              Folder Name <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <FolderPlus
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              />
              <input
                id="new-folder-name"
                type="text"
                autoFocus
                placeholder="e.g. Q4 Marketing Deliverables"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary shadow-2xs placeholder-slate-400"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsNewFolderOpen(false)}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button type="submit" className="text-xs">
              Create Folder
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default FilesPage;
