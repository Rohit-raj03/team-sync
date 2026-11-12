import React from "react";
import {
  MoreVertical,
  FileText,
  Image as ImageIcon,
  Video,
  Code,
  Folder,
} from "lucide-react";
import { Card } from "../../../shared/components/ui/Card.jsx";

const DEFAULT_FOLDERS = [
  {
    id: "f-1",
    name: "Design System & UI",
    category: "image",
    filesCount: 142,
    size: "4.8 GB",
    color: "bg-indigo-50 text-indigo-600",
    icon: ImageIcon,
  },
  {
    id: "f-2",
    name: "Product Specs & PRDs",
    category: "doc",
    filesCount: 38,
    size: "1.2 GB",
    color: "bg-cyan-50 text-cyan-600",
    icon: FileText,
  },
  {
    id: "f-3",
    name: "Video Walkthroughs",
    category: "video",
    filesCount: 19,
    size: "8.4 GB",
    color: "bg-purple-50 text-purple-600",
    icon: Video,
  },
  {
    id: "f-4",
    name: "Code & Prototypes",
    category: "code",
    filesCount: 84,
    size: "2.1 GB",
    color: "bg-emerald-50 text-emerald-600",
    icon: Code,
  },
];

/**
 * Feature Component: FolderGrid
 * Layer: features/files/components/
 * Responsibility: Displays project folder categories with active selection highlight and filtering capabilities.
 */
export const FolderGrid = ({
  selectedFolder = null,
  onSelectFolder,
  customFolders = [],
}) => {
  const allFolders = [
    ...DEFAULT_FOLDERS,
    ...customFolders.map((cf) => ({
      ...cf,
      icon: Folder,
      color: "bg-amber-50 text-amber-600",
    })),
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {allFolders.map((f) => {
        const Icon = f.icon || Folder;
        const isSelected = selectedFolder === f.name || selectedFolder === f.id;

        return (
          <Card
            key={f.id}
            hover
            role="button"
            tabIndex={0}
            onClick={() => onSelectFolder?.(isSelected ? null : f.name)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onSelectFolder?.(isSelected ? null : f.name);
              }
            }}
            className={`p-5 flex flex-col justify-between group cursor-pointer transition-all ${
              isSelected
                ? "ring-2 ring-primary bg-indigo-50/30 shadow-sm border-primary/40"
                : "border-slate-200/80"
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <div
                className={`w-11 h-11 rounded-2xl flex items-center justify-center ${f.color} transition-transform group-hover:scale-105`}
              >
                <Icon size={20} />
              </div>
              <div className="flex items-center gap-1">
                {isSelected && (
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-primary px-2 py-0.5 rounded-full bg-primary/10">
                    Active
                  </span>
                )}
                <button
                  type="button"
                  onClick={(e) => e.stopPropagation()}
                  className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
                  title="Folder options"
                >
                  <MoreVertical size={16} />
                </button>
              </div>
            </div>

            <div>
              <h4
                className={`font-bold text-sm transition-colors ${
                  isSelected
                    ? "text-primary"
                    : "text-slate-800 group-hover:text-primary"
                }`}
              >
                {f.name}
              </h4>
              <div className="flex items-center justify-between text-xs text-slate-500 mt-2 pt-2 border-t border-slate-100 font-medium">
                <span>{f.filesCount} files</span>
                <span className="font-semibold text-slate-700">{f.size}</span>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};

export default FolderGrid;
