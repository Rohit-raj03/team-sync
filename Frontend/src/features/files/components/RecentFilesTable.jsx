import React, { useMemo } from "react";
import { Card } from "../../../shared/components/ui/Card.jsx";
import { Avatar } from "../../../shared/components/ui/Avatar.jsx";
import { EmptyState } from "../../../shared/components/ui/EmptyState.jsx";
import {
  FileCode,
  FileImage,
  FileText,
  Video,
  Download,
  FolderOpen,
  FilterX,
} from "lucide-react";
import { useTasks } from "../../tasks/hooks/useTasks.js";
import { formatDate } from "../../../shared/utils/formatDate.js";

/**
 * Determines appropriate icon based on file type / extension
 */
const getFileIcon = (file) => {
  const name = (file.name || "").toLowerCase();
  const type = (file.type || "").toLowerCase();

  if (type.includes("image") || name.match(/\.(png|jpg|jpeg|svg|webp|fig)$/)) {
    return { icon: FileImage, color: "bg-indigo-50 text-indigo-600" };
  }
  if (type.includes("video") || name.match(/\.(mp4|mov|webm|mkv)$/)) {
    return { icon: Video, color: "bg-purple-50 text-purple-600" };
  }
  if (
    type.includes("code") ||
    name.match(/\.(js|jsx|ts|tsx|html|css|json|zip)$/)
  ) {
    return { icon: FileCode, color: "bg-emerald-50 text-emerald-600" };
  }
  return { icon: FileText, color: "bg-cyan-50 text-cyan-600" };
};

/**
 * Categorization helper matching files with folder groupings
 */
const matchesFolderCategory = (file, folderName) => {
  if (!folderName) return true;
  const name = (file.name || "").toLowerCase();
  const type = (file.type || "").toLowerCase();

  if (folderName === "Design System & UI") {
    return (
      type.includes("image") ||
      name.endsWith(".png") ||
      name.endsWith(".jpg") ||
      name.endsWith(".jpeg") ||
      name.endsWith(".svg") ||
      name.endsWith(".webp") ||
      name.endsWith(".fig")
    );
  }
  if (folderName === "Product Specs & PRDs") {
    return (
      type.includes("pdf") ||
      type.includes("document") ||
      type.includes("text") ||
      name.endsWith(".pdf") ||
      name.endsWith(".doc") ||
      name.endsWith(".docx") ||
      name.endsWith(".txt") ||
      name.endsWith(".md")
    );
  }
  if (folderName === "Video Walkthroughs") {
    return (
      type.includes("video") ||
      name.endsWith(".mp4") ||
      name.endsWith(".mov") ||
      name.endsWith(".webm") ||
      name.endsWith(".mkv")
    );
  }
  if (folderName === "Code & Prototypes") {
    return (
      type.includes("code") ||
      type.includes("json") ||
      type.includes("zip") ||
      name.endsWith(".js") ||
      name.endsWith(".jsx") ||
      name.endsWith(".ts") ||
      name.endsWith(".tsx") ||
      name.endsWith(".html") ||
      name.endsWith(".css") ||
      name.endsWith(".json") ||
      name.endsWith(".zip")
    );
  }
  return file.folder === folderName;
};

/**
 * Feature Component: RecentFilesTable
 * Layer: features/files/components/
 * Responsibility: Displays real files and attachments uploaded across tasks and direct uploads with dynamic folder filtering.
 */
export const RecentFilesTable = ({
  selectedFolder = null,
  onClearFilter,
  additionalFiles = [],
}) => {
  const { allTasks = [] } = useTasks();

  // Aggregate real attachments from tasks (memoized)
  const taskFiles = useMemo(() => {
    return allTasks.flatMap((task) =>
      (task.attachments || []).map((att, idx) => ({
        id: att._id || att.id || `${task.id || task._id}-att-${idx}`,
        name: att.name || "Document",
        type: att.type || "Attachment",
        size: att.size || "1.2 MB",
        date: formatDate(task.createdAt || new Date()),
        author: task.creator?.name || "Team Member",
        url: att.url || "#",
        taskName: task.title,
      })),
    );
  }, [allTasks]);

  const filteredFiles = useMemo(() => {
    const combined = [...additionalFiles, ...taskFiles];
    return selectedFolder
      ? combined.filter((f) => matchesFolderCategory(f, selectedFolder))
      : combined;
  }, [additionalFiles, taskFiles, selectedFolder]);

  return (
    <Card className="flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 tracking-tight">
            Recent Files
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Documents and assets uploaded across team projects
          </p>
        </div>
        <span className="text-xs font-semibold text-slate-500">
          {filteredFiles.length} {filteredFiles.length === 1 ? "file" : "files"}
        </span>
      </div>

      {/* Active Filter Bar */}
      {selectedFolder && (
        <div className="flex items-center justify-between p-2.5 px-3 mb-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 text-xs font-medium text-slate-700 animate-in fade-in">
          <div className="flex items-center gap-2">
            <span className="text-slate-500">Filtered by:</span>
            <span className="font-bold text-primary px-2 py-0.5 bg-white rounded-lg shadow-2xs border border-indigo-100">
              {selectedFolder}
            </span>
            <span className="text-slate-500 text-[11px]">
              ({filteredFiles.length} matching)
            </span>
          </div>
          <button
            type="button"
            onClick={onClearFilter}
            className="flex items-center gap-1 text-xs font-semibold text-primary hover:text-indigo-800 transition-colors cursor-pointer"
          >
            <FilterX size={13} />
            <span>Show all</span>
          </button>
        </div>
      )}

      {filteredFiles.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-sm text-slate-600">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="pb-3 px-2">File Name</th>
                <th className="pb-3 px-4">Size</th>
                <th className="pb-3 px-4">Uploaded</th>
                <th className="pb-3 px-4">Author</th>
                <th className="pb-3 px-2 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredFiles.map((file) => {
                const { icon: FileIcon, color: iconColor } = getFileIcon(file);

                return (
                  <tr
                    key={file.id}
                    className="hover:bg-slate-50/60 transition-colors group"
                  >
                    <td className="py-3.5 px-2">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${iconColor}`}
                        >
                          <FileIcon size={18} />
                        </div>
                        <div>
                          <p className="font-bold text-xs text-slate-900 group-hover:text-indigo-600 transition-colors">
                            {file.name}
                          </p>
                          <span className="text-[11px] text-slate-500 font-medium">
                            {file.taskName}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-xs font-semibold text-slate-700">
                      {file.size}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-500">
                      {file.date}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <Avatar
                          name={file.author}
                          size="sm"
                          className="w-6 h-6 text-[10px]"
                        />
                        <span className="text-xs font-medium text-slate-700">
                          {file.author}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-2 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {file.url && file.url !== "#" && (
                          <a
                            href={file.url}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 transition-colors"
                            title="Download"
                          >
                            <Download size={15} />
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState
          icon={FolderOpen}
          title={
            selectedFolder
              ? `No files match "${selectedFolder}"`
              : "No files uploaded yet"
          }
          description={
            selectedFolder
              ? "No uploaded assets currently match this folder category. Clear the filter to view all project files."
              : "Attach deliverables, documents, and screenshots inside any project or task to track and download them here."
          }
          actionLabel={selectedFolder ? "Clear Filter" : undefined}
          onAction={selectedFolder ? onClearFilter : undefined}
        />
      )}
    </Card>
  );
};

export default RecentFilesTable;
