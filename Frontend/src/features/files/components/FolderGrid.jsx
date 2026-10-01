import React from 'react';
import { Folder, MoreVertical, FileText, Image as ImageIcon, Video, Code } from 'lucide-react';
import { Card } from '../../../shared/components/ui/Card.jsx';

/**
 * Feature Component: FolderGrid
 * Layer: features/files/components/
 * Responsibility: Displays project folder categories with file counts, storage capacity, and quick actions matching Figma Screen 4.
 */
export const FolderGrid = () => {
  const folders = [
    {
      id: 'f-1',
      name: 'Design System & UI',
      filesCount: 142,
      size: '4.8 GB',
      color: 'bg-indigo-50 text-indigo-600',
      icon: ImageIcon,
    },
    {
      id: 'f-2',
      name: 'Product Specs & PRDs',
      filesCount: 38,
      size: '1.2 GB',
      color: 'bg-cyan-50 text-cyan-600',
      icon: FileText,
    },
    {
      id: 'f-3',
      name: 'Video Walkthroughs',
      filesCount: 19,
      size: '8.4 GB',
      color: 'bg-purple-50 text-purple-600',
      icon: Video,
    },
    {
      id: 'f-4',
      name: 'Code & Prototypes',
      filesCount: 84,
      size: '2.1 GB',
      color: 'bg-emerald-50 text-emerald-600',
      icon: Code,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {folders.map((f) => {
        const Icon = f.icon;
        return (
          <Card key={f.id} hover className="p-5 flex flex-col justify-between group cursor-pointer">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${f.color} transition-transform group-hover:scale-105`}>
                <Icon size={20} />
              </div>
              <button className="text-slate-300 hover:text-slate-600 p-1 rounded-lg">
                <MoreVertical size={16} />
              </button>
            </div>

            <div>
              <h4 className="font-bold text-sm text-slate-800 group-hover:text-indigo-600 transition-colors">
                {f.name}
              </h4>
              <div className="flex items-center justify-between text-xs text-slate-400 mt-2 pt-2 border-t border-slate-50">
                <span>{f.filesCount} files</span>
                <span className="font-semibold text-slate-600">{f.size}</span>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};

export default FolderGrid;

