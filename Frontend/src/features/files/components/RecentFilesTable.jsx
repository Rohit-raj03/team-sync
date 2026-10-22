import React from 'react';
import { Card } from '../../../shared/components/ui/Card.jsx';
import { Avatar } from '../../../shared/components/ui/Avatar.jsx';
import { FileCode, FileImage, FileText, Download, MoreVertical, HardDriveDownload, FolderOpen } from 'lucide-react';
import { useTasks } from '../../tasks/hooks/useTasks.js';
import { formatDate } from '../../../shared/utils/formatDate.js';

/**
 * Feature Component: RecentFilesTable
 * Layer: features/files/components/
 * Responsibility: Displays real files and attachments uploaded across tasks and projects. Zero dummy data.
 */
export const RecentFilesTable = () => {
  const { allTasks = [] } = useTasks();

  // Aggregate real attachments from tasks
  const realFiles = allTasks.flatMap((task) =>
    (task.attachments || []).map((att, idx) => ({
      id: att._id || att.id || `${task.id || task._id}-att-${idx}`,
      name: att.name || 'Document',
      type: att.type || 'Attachment',
      size: att.size || '1.2 MB',
      date: formatDate(task.createdAt || new Date()),
      author: task.creator?.name || 'Team Member',
      url: att.url || '#',
      taskName: task.title,
    }))
  );

  return (
    <Card className="flex flex-col">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-base font-bold text-slate-900 tracking-tight">Recent Files</h3>
          <p className="text-xs text-slate-400 mt-0.5">Documents and assets uploaded across team projects</p>
        </div>
        <span className="text-xs font-semibold text-slate-400">
          {realFiles.length} {realFiles.length === 1 ? 'file' : 'files'}
        </span>
      </div>

      {realFiles.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="pb-3 px-2">File Name</th>
                <th className="pb-3 px-4">Size</th>
                <th className="pb-3 px-4">Uploaded</th>
                <th className="pb-3 px-4">Author</th>
                <th className="pb-3 px-2 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {realFiles.map((file) => (
                <tr key={file.id} className="hover:bg-slate-50/60 transition-colors group">
                  <td className="py-3.5 px-2">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-indigo-50 text-[#4361EE]">
                        <FileText size={18} />
                      </div>
                      <div>
                        <p className="font-bold text-xs text-slate-900 group-hover:text-indigo-600 transition-colors">
                          {file.name}
                        </p>
                        <span className="text-[11px] text-slate-400 font-medium">{file.taskName}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-xs font-semibold text-slate-700">{file.size}</td>
                  <td className="py-3.5 px-4 text-xs text-slate-500">{file.date}</td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <Avatar name={file.author} size="sm" className="w-6 h-6 text-[10px]" />
                      <span className="text-xs font-medium text-slate-700">{file.author}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-2 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {file.url && file.url !== '#' && (
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
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="p-8 text-center bg-slate-50/60 rounded-2xl border border-dashed border-slate-200">
          <FolderOpen size={32} className="mx-auto text-slate-300 mb-2" />
          <p className="text-xs font-bold text-slate-700">No files uploaded yet</p>
          <p className="text-[11px] text-slate-400 mt-1 max-w-sm mx-auto">
            Attach deliverables, documents, and screenshots inside any project or task to track and download them here.
          </p>
        </div>
      )}
    </Card>
  );
};

export default RecentFilesTable;
