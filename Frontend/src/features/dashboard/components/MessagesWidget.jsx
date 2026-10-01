import React from "react";
import { Card } from "../../../shared/components/ui/Card.jsx";

/**
 * Feature Component: MessagesWidget
 * Layer: features/dashboard/components/
 * Responsibility: Exact reproduction of the Messages thread list on the dashboard matching Figma.
 */
export const MessagesWidget = () => {
  const threads = [
    {
      id: "1",
      name: "Cris Morich",
      message: "Hi Angelina! How are You?",
      avatar:
        "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&h=100&fit=crop&crop=faces",
      avatarBorder: "ring-amber-400",
    },
    {
      id: "2",
      name: "Charmie",
      message: "Do you need that design?",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces",
      avatarBorder: "ring-rose-400",
    },
    {
      id: "3",
      name: "Jason Mandala",
      message: "What is the price of hourly...",
      avatar:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=faces",
      avatarBorder: "ring-sky-400",
    },
    {
      id: "4",
      name: "Charlie Chu",
      message: "Awsome design!!",
      avatar:
        "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&h=100&fit=crop&crop=faces",
      avatarBorder: "ring-orange-400",
    },
  ];

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-bold text-slate-900 tracking-tight">
        Messages
      </h3>

      <div className="space-y-3">
        {threads.map((t) => (
          <div
            key={t.id}
            className="flex items-center gap-3.5 p-2 rounded-2xl hover:bg-white transition-all cursor-pointer group"
          >
            <img
              src={t.avatar}
              alt={t.name}
              className={`w-10 h-10 rounded-full object-cover ring-2 ${t.avatarBorder}`}
            />
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-bold text-slate-900 leading-tight group-hover:text-[#4361EE] transition-colors">
                {t.name}
              </h4>
              <p className="text-[11px] font-medium text-slate-400 truncate mt-0.5">
                {t.message}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MessagesWidget;
