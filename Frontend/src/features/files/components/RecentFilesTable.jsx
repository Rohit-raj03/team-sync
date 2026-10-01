import React from 'react';
import { Card } from '../../../shared/components/ui/Card.jsx';
import { Avatar } from '../../../shared/components/ui/Avatar.jsx';
import { FileCode, FileImage, FileText, Download, MoreVertical, HardDriveDownload } from 'lucide-react';

/**
 * Feature Component: RecentFilesTable
 * Layer: features/files/components/
 * Responsibility: Displays recent files in a structured data table with file types, authors, and download triggers matching Figma Screen 4.
 */
export const RecentFilesTable = () => {
  const files = [
    {
      id: '1',
      name: 'TeamSync_Dashboard_v2.fig',
      type: 'Figma File',
      icon: FileImage,
      iconColor: 'bg-purple-50 text-purple-600',
      size: '24.8 MB',
      date: 'Sep 24, 2026',
      author: 'Sarah Chen',
    },
    {
      id: '2',
      name: 'Sprint_24_Architecture_Spec.pdf',
      type: 'Documentation',
      icon: FileText,
      iconColor: 'bg-blue-50 text-blue-600',
      size: '3.4 MB',
      date: 'Sep 23, 2026',
      author: 'Alex Johnson',
    },
    {
      id: '3',
      name: 'Tailwind_Design_Tokens.json',
      type: 'Configuration',
      icon: FileCode,
      iconColor: 'bg-emerald-50 text-emerald-600',
      size: '142 KB',
      date: 'Sep 22, 2026',
      author: 'David Kim',
    },
    {
      id: '4',
      name: 'App_Walkthrough_Demo.mp4',
      type: 'Media Video',
      icon: FileImage,
      iconColor: 'bg-rose-50 text-rose-600',
      size: '118.5 MB',
      date: 'Sep 20, 2026',
      author: 'Elena Rostova',
    },
  ];

  return (
    <Card className="flex flex-col">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-base font-bold text-slate-900 tracking-tight">Recent Files</h3>
          <p className="text-xs text-slate-400 mt-0.5">Documents and assets uploaded across team projects</p>
        </div>
        <button className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors">
          View All Files
        </button>
      </div>

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
            {files.map((file) => {
              const Icon = file.icon;
              return (
                <tr key={file.id} className="hover:bg-slate-50/60 transition-colors group">
                  <td className="py-3.5 px-2">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${file.iconColor}`}>
                        <Icon size={18} />
                      </div>
                      <div>
                        <p className="font-bold text-xs text-slate-900 group-hover:text-indigo-600 transition-colors">
                          {file.name}
                        </p>
                        <span className="text-[11px] text-slate-400 font-medium">{file.type}</span>
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
                      <button className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 transition-colors" title="Download">
                        <Download size={15} />
                      </button>
                      <button className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
                        <MoreVertical size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

export default RecentFilesTable;

