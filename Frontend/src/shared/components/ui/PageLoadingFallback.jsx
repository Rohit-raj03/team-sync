import React from "react";
import { Loader2 } from "lucide-react";

/**
 * Shared UI Component: PageLoadingFallback
 * Displays a branded skeleton / loading state while lazy-loaded route chunks are fetched.
 */
export const PageLoadingFallback = ({ message = "Loading view..." }) => {
  return (
    <div className="flex-1 w-full min-h-[60vh] flex flex-col items-center justify-center p-6 space-y-4 animate-in fade-in duration-200">
      <div className="relative">
        <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center shadow-xs border border-indigo-100/60">
          <Loader2 className="w-6 h-6 text-primary animate-spin" />
        </div>
      </div>
      <p className="text-xs font-semibold text-slate-500 tracking-wide">
        {message}
      </p>
    </div>
  );
};

export default PageLoadingFallback;
