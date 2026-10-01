import React from 'react';
import { UploadCloud, HardDrive, ShieldCheck } from 'lucide-react';
import { Card } from '../../../shared/components/ui/Card.jsx';
import { Button } from '../../../shared/components/ui/Button.jsx';
import { ProgressBar } from '../../../shared/components/ui/ProgressBar.jsx';

/**
 * Feature Component: FileStorageOverview
 * Layer: features/files/components/
 * Responsibility: Displays cloud storage quota gauge, upload quick-action, and usage tier information matching Figma Screen 4.
 */
export const FileStorageOverview = () => {
  const percentage = 68;

  return (
    <Card className="flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 tracking-tight">Cloud Storage</h3>
          <p className="text-xs text-slate-400">Team workspace storage allocation</p>
        </div>
        <div className="p-2.5 rounded-2xl bg-indigo-50 text-indigo-600">
          <HardDrive size={18} />
        </div>
      </div>

      {/* Upload Zone */}
      <div className="border-2 border-dashed border-indigo-100 hover:border-indigo-300 rounded-3xl p-6 text-center bg-indigo-50/20 hover:bg-indigo-50/40 transition-all cursor-pointer group my-2">
        <div className="w-12 h-12 rounded-2xl bg-white shadow-xs text-indigo-600 flex items-center justify-center mx-auto mb-3 group-hover:scale-105 transition-transform">
          <UploadCloud size={24} />
        </div>
        <p className="text-xs font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">
          Click to upload or drag & drop
        </p>
        <p className="text-[11px] text-slate-400 mt-1">SVG, PNG, JPG, FIG, PDF or ZIP (max 100MB)</p>
      </div>

      {/* Quota Progress */}
      <div className="space-y-2 mt-4 pt-4 border-t border-slate-50">
        <div className="flex justify-between text-xs font-bold">
          <span className="text-slate-700">Storage Used</span>
          <span className="text-indigo-600">34.2 GB / 50 GB ({percentage}%)</span>
        </div>
        <ProgressBar progress={percentage} color="indigo" height="h-2" />
        <div className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-600 pt-1">
          <ShieldCheck size={14} />
          <span>Encrypted cloud storage with automatic daily backups</span>
        </div>
      </div>

      <div className="mt-5">
        <Button className="w-full rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-semibold text-xs shadow-md shadow-indigo-200">
          Upgrade Storage Plan
        </Button>
      </div>
    </Card>
  );
};

export default FileStorageOverview;

