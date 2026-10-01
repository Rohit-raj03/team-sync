import React from "react";
import { Users, MoreVertical, Plus } from "lucide-react";
import { Card } from "../../../shared/components/ui/Card.jsx";
import { Avatar } from "../../../shared/components/ui/Avatar.jsx";

/**
 * Feature Component: DashboardTeamWidget
 * Layer: features/team/components/
 * Responsibility: Displays team members with active online indicators and status details matching Figma Screen 1.
 */
export const DashboardTeamWidget = () => {
  const members = [
    {
      id: "1",
      name: "Alex Johnson",
      role: "Project Lead",
      status: "online",
      avatarColor: "from-indigo-500 to-blue-500",
    },
    {
      id: "2",
      name: "Sarah Chen",
      role: "UI/UX Designer",
      status: "in-meeting",
      avatarColor: "from-purple-500 to-pink-500",
    },
    {
      id: "3",
      name: "David Kim",
      role: "Backend Engineer",
      status: "online",
      avatarColor: "from-emerald-400 to-teal-600",
    },
    {
      id: "4",
      name: "Elena Rostova",
      role: "Product Manager",
      status: "offline",
      avatarColor: "from-amber-400 to-orange-500",
    },
  ];

  return (
    <Card className="flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 tracking-tight">
            Team Members
          </h3>
          <p className="text-xs text-slate-400">4 active contributors</p>
        </div>
        <button
          className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white flex items-center justify-center transition-colors"
          aria-label="Add team member"
        >
          <Plus size={16} />
        </button>
      </div>

      <div className="space-y-3.5 divide-y divide-slate-50">
        {members.map((m) => (
          <div
            key={m.id}
            className="pt-3 first:pt-0 flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                <div
                  className={`w-10 h-10 rounded-full bg-gradient-to-tr ${m.avatarColor} text-white font-bold flex items-center justify-center text-xs shadow-xs`}
                >
                  {m.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </div>
                {/* Status Dot */}
                <span
                  className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full ring-2 ring-white ${
                    m.status === "online"
                      ? "bg-emerald-500"
                      : m.status === "in-meeting"
                        ? "bg-amber-400"
                        : "bg-slate-300"
                  }`}
                />
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">
                  {m.name}
                </h4>
                <p className="text-[11px] font-medium text-slate-400">
                  {m.role}
                </p>
              </div>
            </div>

            <button className="text-slate-300 hover:text-slate-600 p-1 rounded-lg">
              <MoreVertical size={16} />
            </button>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default DashboardTeamWidget;
