import React, { useRef } from "react";
import { Camera, Trash2, UploadCloud } from "lucide-react";
import { Card } from "../../../shared/components/ui/Card.jsx";

/**
 * Feature Component: ProfilePhotoSection
 * Layer: features/profile/components/
 * Responsibility: Displays profile picture preview with change and remove actions at the top of the profile page.
 */
export const ProfilePhotoSection = ({
  avatar,
  fullName,
  onUpload,
  onRemove,
}) => {
  const fileInputRef = useRef(null);

  const initials = fullName
    ? fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .substring(0, 2)
        .toUpperCase()
    : "TS";

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      onUpload(file);
    }
  };

  return (
    <Card className="p-6 md:p-8">
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
        {/* Avatar Display with Hover Overlay */}
        <div className="relative group shrink-0">
          {avatar ? (
            <img
              src={avatar}
              alt={fullName}
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl object-cover ring-4 ring-slate-100 shadow-md group-hover:opacity-95 transition-all"
            />
          ) : (
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-linear-to-tr from-[#4361EE] to-[#00C2FF] text-white text-2xl font-black flex items-center justify-center shadow-md ring-4 ring-slate-100">
              {initials}
            </div>
          )}

          {/* Quick upload icon badge */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="absolute bottom-1 right-1 w-8 h-8 rounded-full bg-white shadow-md border border-slate-200 text-slate-700 hover:text-[#4361EE] hover:bg-slate-50 flex items-center justify-center transition-all"
            title="Upload photo"
          >
            <Camera size={15} />
          </button>
        </div>

        {/* Action Controls & Guidelines */}
        <div className="flex-1 text-center sm:text-left space-y-2">
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Profile Photo
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              This photo will be displayed across team boards, project chats,
              and assignments.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 pt-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/png, image/jpeg, image/gif, image/webp"
              className="hidden"
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 rounded-2xl bg-[#F4F7FB] hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center gap-2 border border-slate-200/80 transition-colors"
            >
              <UploadCloud size={15} className="text-[#4361EE]" />
              <span>Change Photo</span>
            </button>

            {avatar && (
              <button
                type="button"
                onClick={onRemove}
                className="px-3.5 py-2 rounded-2xl bg-white hover:bg-rose-50 text-rose-600 hover:text-rose-700 text-xs font-semibold flex items-center gap-1.5 border border-slate-200/80 hover:border-rose-200 transition-colors"
              >
                <Trash2 size={14} />
                <span>Remove</span>
              </button>
            )}
          </div>

          <p className="text-[11px] text-slate-400 font-medium pt-1">
            Supported formats: JPG, PNG, GIF, or WebP. Maximum file size: 5MB.
          </p>
        </div>
      </div>
    </Card>
  );
};

export default ProfilePhotoSection;
