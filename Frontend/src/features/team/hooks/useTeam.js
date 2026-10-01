import { useState, useEffect } from "react";

export const INITIAL_TEAM_MEMBERS = [
  {
    id: "u-1",
    name: "Rohit Raj",
    username: "rohitraj",
    role: "Frontend Developer",
    email: "rohit@teamsync.io",
    avatar:
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&h=120&fit=crop&crop=faces",
    status: "online",
    department: "Engineering",
  },
  {
    id: "u-2",
    name: "Aman Kumar",
    username: "amankumar",
    role: "Backend Developer",
    email: "aman@teamsync.io",
    avatar:
      "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=120&h=120&fit=crop&crop=faces",
    status: "online",
    department: "Engineering",
  },
  {
    id: "u-3",
    name: "Priya Singh",
    username: "priyasingh",
    role: "UI/UX Designer",
    email: "priya@teamsync.io",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&h=120&fit=crop&crop=faces",
    status: "in-meeting",
    department: "Design",
  },
  {
    id: "u-4",
    name: "Angelina Davis",
    username: "angelina",
    role: "Lead Product Designer",
    email: "angelina.davis@teamsync.io",
    avatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&h=120&fit=crop&crop=faces",
    status: "online",
    department: "Design",
  },
  {
    id: "u-5",
    name: "Alex Johnson",
    username: "alexj",
    role: "Project Lead",
    email: "alex@teamsync.io",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&fit=crop&crop=faces",
    status: "online",
    department: "Management",
  },
  {
    id: "u-6",
    name: "Sarah Chen",
    username: "sarahc",
    role: "Design System Engineer",
    email: "sarah@teamsync.io",
    avatar:
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&h=120&fit=crop&crop=faces",
    status: "in-meeting",
    department: "Design",
  },
  {
    id: "u-7",
    name: "David Kim",
    username: "davidk",
    role: "Backend & DevOps Engineer",
    email: "david@teamsync.io",
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&h=120&fit=crop&crop=faces",
    status: "offline",
    department: "DevOps",
  },
  {
    id: "u-8",
    name: "Elena Rostova",
    username: "elenar",
    role: "Product Manager",
    email: "elena@teamsync.io",
    avatar:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&h=120&fit=crop&crop=faces",
    status: "online",
    department: "Product",
  },
];

// Module-level array to share state across components during session
let sharedMembersList = [...INITIAL_TEAM_MEMBERS];
const listeners = new Set();

const notifyListeners = () => {
  listeners.forEach((listener) => listener([...sharedMembersList]));
};

/**
 * Feature Hook: useTeam
 * Layer: features/team/hooks/
 * Responsibility: Provides reactive team members state and member invite actions across the app.
 */
export function useTeam() {
  const [members, setMembers] = useState(sharedMembersList);

  useEffect(() => {
    listeners.add(setMembers);
    return () => {
      listeners.delete(setMembers);
    };
  }, []);

  const inviteMember = ({ name, email, role, username }) => {
    const formattedUsername = username
      ? username.replace(/^@/, "")
      : name.toLowerCase().replace(/\s+/g, "");

    const newMember = {
      id: `u-${Date.now()}`,
      name,
      username: formattedUsername,
      role: role || "Team Contributor",
      email: email || `${formattedUsername}@teamsync.io`,
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`,
      status: "online",
      department: "Engineering",
    };

    sharedMembersList = [newMember, ...sharedMembersList];
    notifyListeners();
    return newMember;
  };

  return {
    members,
    inviteMember,
  };
}
