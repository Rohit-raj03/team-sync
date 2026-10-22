import React from "react";
import { useRouteError, useNavigate } from "react-router-dom";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";
import { Button } from "./Button.jsx";

export const RouteErrorBoundary = () => {
  const error = useRouteError();
  const navigate = useNavigate();

  const errorMessage =
    error?.statusText ||
    error?.message ||
    (typeof error === "string" ? error : "An unexpected error occurred while loading this page.");

  return (
    <div className="min-h-screen bg-[#F4F7FE] flex items-center justify-center p-6">
      <div className="w-full max-w-lg bg-white rounded-3xl p-8 shadow-sm border border-slate-100 text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-500">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Something went wrong</h2>
        <p className="text-slate-500 text-sm mb-6 leading-relaxed">
          {errorMessage}
        </p>
        <div className="flex items-center justify-center gap-3">
          <Button
            variant="outline"
            onClick={() => window.location.reload()}
            className="flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Reload Page
          </Button>
          <Button
            variant="primary"
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2"
          >
            <Home className="w-4 h-4" />
            Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RouteErrorBoundary;
