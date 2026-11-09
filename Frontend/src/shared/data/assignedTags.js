export const ASSIGNED_TAGS = {
  FRONTEND: "Frontend",
  BACKEND: "Backend",
  UI_UX: "UI/UX",
  FULL_STACK: "Full Stack",
  PROJECT_LEAD: "Project Lead",
  DATABASE: "Database",
  TESTING: "Testing",
  DEVOPS: "DevOps",
  QA_REVIEWER: "QA Reviewer",
  PRODUCT_MANAGER: "Product Manager",
  DOCUMENTATION: "Documentation",
  BUG_FIX: "Bug Fix",
  CONTRIBUTOR: "Contributor",
};

export const TAG_COLORS = {
  Frontend: "bg-blue-100 text-blue-700 border-blue-200",
  Backend: "bg-purple-100 text-purple-700 border-purple-200",
  "UI/UX": "bg-pink-100 text-pink-700 border-pink-200",
  "Full Stack": "bg-teal-100 text-teal-700 border-teal-200",
  "Project Lead": "bg-indigo-100 text-indigo-700 border-indigo-200",
  Database: "bg-amber-100 text-amber-700 border-amber-200",
  Testing: "bg-green-100 text-green-700 border-green-200",
  DevOps: "bg-indigo-100 text-indigo-700 border-indigo-200",
  "QA Reviewer": "bg-emerald-100 text-emerald-700 border-emerald-200",
  "Product Manager": "bg-violet-100 text-violet-700 border-violet-200",
  Documentation: "bg-gray-100 text-gray-700 border-gray-200",
  "Bug Fix": "bg-red-100 text-red-700 border-red-200",
  Contributor: "bg-slate-100 text-slate-700 border-slate-200",
};

export const getAssignedTagStyle = (tag) => {
  return TAG_COLORS[tag] || "bg-indigo-50 text-[#4361EE] border-indigo-100/90";
};

export const getAssignedTagLabel = (tag) => {
  return Object.values(ASSIGNED_TAGS).includes(tag) ? tag : tag || "Unknown";
};

export default ASSIGNED_TAGS;
