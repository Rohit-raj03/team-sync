import React, { useRef, useState } from "react";
import { UploadCloud, HardDrive, ShieldCheck, Loader2 } from "lucide-react";
import { Card } from "../../../shared/components/ui/Card.jsx";
import { Button } from "../../../shared/components/ui/Button.jsx";
import { ProgressBar } from "../../../shared/components/ui/ProgressBar.jsx";
import toast from "react-hot-toast";

/**
 * Feature Component: FileStorageOverview
 * Layer: features/files/components/
 * Responsibility: Displays cloud storage quota gauge, interactive drag-and-drop file upload, and tier information.
 */
export const FileStorageOverview = ({
  onUploadFiles,
  isUploading = false,
  uploadProgress = 0,
  totalFilesCount = 0,
}) => {
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  // Dynamic storage approximation based on real tracked files
  const baseUsedGB = 34.2;
  const fileDeltaGB = (totalFilesCount * 0.05).toFixed(1);
  const totalUsedGB = (baseUsedGB + parseFloat(fileDeltaGB)).toFixed(1);
  const percentage = Math.min(100, Math.round((totalUsedGB / 50) * 100));

  const handleFileChange = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onUploadFiles?.(files);
      e.target.value = "";
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onUploadFiles?.(e.dataTransfer.files);
    }
  };

  return (
    <Card className="flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 tracking-tight">
            Cloud Storage
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Team workspace storage allocation
          </p>
        </div>
        <div className="p-2.5 rounded-2xl bg-indigo-50 text-indigo-600">
          <HardDrive size={18} />
        </div>
      </div>

      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        multiple
        onChange={handleFileChange}
        className="hidden"
        accept="image/*,.pdf,.doc,.docx,.txt,.zip,.fig,.mp4,.json,.js,.jsx,.ts,.tsx"
      />

      {/* Interactive Upload Zone */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => !isUploading && fileInputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            !isUploading && fileInputRef.current?.click();
          }
        }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-3xl p-6 text-center transition-all cursor-pointer group my-2 ${
          isDragging
            ? "border-primary bg-indigo-50/60 scale-[1.01]"
            : "border-indigo-100 hover:border-indigo-300 bg-indigo-50/20 hover:bg-indigo-50/40"
        } ${isUploading ? "opacity-75 pointer-events-none" : ""}`}
      >
        <div className="w-12 h-12 rounded-2xl bg-white shadow-xs text-indigo-600 flex items-center justify-center mx-auto mb-3 group-hover:scale-105 transition-transform">
          {isUploading ? (
            <Loader2 size={24} className="animate-spin text-primary" />
          ) : (
            <UploadCloud size={24} />
          )}
        </div>
        <p className="text-xs font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">
          {isUploading
            ? `Uploading to Cloud Storage... ${uploadProgress ? `${uploadProgress}%` : ""}`
            : isDragging
              ? "Drop files to upload now"
              : "Click to upload or drag & drop"}
        </p>
        <p className="text-[11px] text-slate-500 mt-1 font-medium">
          SVG, PNG, JPG, FIG, PDF or ZIP (max 100MB)
        </p>
      </div>

      {/* Quota Progress */}
      <div className="space-y-2 mt-4 pt-4 border-t border-slate-100">
        <div className="flex justify-between text-xs font-bold">
          <span className="text-slate-700">Storage Used</span>
          <span className="text-indigo-600">
            {totalUsedGB} GB / 50 GB ({percentage}%)
          </span>
        </div>
        <ProgressBar progress={percentage} color="indigo" height="h-2" />
        <div className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-600 pt-1">
          <ShieldCheck size={14} />
          <span>Encrypted cloud storage with automatic daily backups</span>
        </div>
      </div>

      <div className="mt-5">
        <Button
          onClick={() =>
            toast.success(
              "Storage upgrade plan inquiry logged! A team member will assist you shortly.",
            )
          }
          className="w-full rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-semibold text-xs shadow-md shadow-indigo-200 cursor-pointer"
        >
          Upgrade Storage Plan
        </Button>
      </div>
    </Card>
  );
};

export default FileStorageOverview;
