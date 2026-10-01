import React from "react";

/**
 * Shared UI Component: Card
 * Layer: shared/components/ui/
 * Responsibility: Reusable container with OCTOM design system styling (white background, rounded-3xl corners, soft ambient shadow, subtle border).
 */
export const Card = ({ children, className = "", hover = false, ...props }) => {
  return (
    <div
      className={`bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_10px_30px_-5px_rgba(0,0,0,0.03)] ${
        hover
          ? "hover:border-indigo-100 hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.06)] transition-all"
          : ""
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
