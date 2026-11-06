export const ASSIGNED_TAGS = {
  FRONTEND: "Frontend",
  BACKEND: "Backend",
  UI_UX: "UI/UX",
  DATABASE: "Database",
  TESTING: "Testing",
  DEVOPS: "DevOps",
  DOCUMENTATION: "Documentation",
  BUG_FIX: "Bug Fix",
};

export const TAG_COLORS = {
  Frontend: "bg-blue-100 text-blue-700",
  Backend: "bg-purple-100 text-purple-700",
  "UI/UX": "bg-pink-100 text-pink-700",
  Database: "bg-amber-100 text-amber-700",
  Testing: "bg-green-100 text-green-700",
  DevOps: "bg-indigo-100 text-indigo-700",
  Documentation: "bg-gray-100 text-gray-700",
  "Bug Fix": "bg-red-100 text-red-700",
};

export const getAssignedTagStyle = (tag) => {
  return TAG_COLORS[tag] || "bg-gray-100 text-gray-700";
};

export const getAssignedTagLabel = (tag) => {
  return Object.values(ASSIGNED_TAGS).includes(tag) ? tag : "Unknown";
};
