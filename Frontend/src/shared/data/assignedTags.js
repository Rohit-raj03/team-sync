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

// Project Theme Tag styling (Unified theme instead of rainbow multi-colors)
export const PROJECT_THEME_TAG_STYLE = "bg-indigo-50 text-primary border-indigo-100/90";

export const TAG_COLORS = {
  Frontend: PROJECT_THEME_TAG_STYLE,
  Backend: PROJECT_THEME_TAG_STYLE,
  "UI/UX": PROJECT_THEME_TAG_STYLE,
  "Full Stack": PROJECT_THEME_TAG_STYLE,
  "Project Lead": PROJECT_THEME_TAG_STYLE,
  Database: PROJECT_THEME_TAG_STYLE,
  Testing: PROJECT_THEME_TAG_STYLE,
  DevOps: PROJECT_THEME_TAG_STYLE,
  "QA Reviewer": PROJECT_THEME_TAG_STYLE,
  "Product Manager": PROJECT_THEME_TAG_STYLE,
  Documentation: PROJECT_THEME_TAG_STYLE,
  "Bug Fix": PROJECT_THEME_TAG_STYLE,
  Contributor: PROJECT_THEME_TAG_STYLE,
};

export const getAssignedTagStyle = (tag) => {
  return TAG_COLORS[tag] || PROJECT_THEME_TAG_STYLE;
};

export const getAssignedTagLabel = (tag) => {
  return Object.values(ASSIGNED_TAGS).includes(tag) ? tag : tag || "Unknown";
};

export default ASSIGNED_TAGS;
