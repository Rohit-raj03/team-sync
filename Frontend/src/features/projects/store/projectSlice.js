import { createSlice } from "@reduxjs/toolkit";

const initialProjects = [
  {
    id: "p-1",
    name: "TeamSync Web App",
    description:
      "Real-time collaborative task workspace for distributed dev teams with Figma-accurate UI.",
    category: "Web Application",
    status: "ACTIVE",
    priority: "HIGH",
    color: "#4361EE",
    startDate: "2026-09-15",
    dueDate: "2026-10-15",
    members: [
      {
        id: "u-1",
        name: "Rohit Raj",
        username: "rohitraj",
        role: "Frontend Developer",
        projectRole: "Frontend Lead",
        avatar:
          "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&h=120&fit=crop&crop=faces",
      },
      {
        id: "u-3",
        name: "Priya Singh",
        username: "priyasingh",
        role: "UI/UX Designer",
        projectRole: "Product Designer",
        avatar:
          "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&h=120&fit=crop&crop=faces",
      },
      {
        id: "u-4",
        name: "Angelina Davis",
        username: "angelina",
        role: "Lead Product Designer",
        projectRole: "Design Supervisor",
        avatar:
          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&h=120&fit=crop&crop=faces",
      },
      {
        id: "u-5",
        name: "Alex Johnson",
        username: "alexj",
        role: "Project Lead",
        projectRole: "Project Manager",
        avatar:
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&fit=crop&crop=faces",
      },
    ],
  },
  {
    id: "p-2",
    name: "Mobile Client v2",
    description:
      "React Native companion app for seamless task tracking on iOS & Android with offline support.",
    category: "Mobile Application",
    status: "IN_PROGRESS",
    priority: "URGENT",
    color: "#8B5CF6",
    startDate: "2026-09-20",
    dueDate: "2026-11-01",
    members: [
      {
        id: "u-2",
        name: "Aman Kumar",
        username: "amankumar",
        role: "Backend Developer",
        projectRole: "API & Mobile Backend",
        avatar:
          "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=120&h=120&fit=crop&crop=faces",
      },
      {
        id: "u-7",
        name: "David Kim",
        username: "davidk",
        role: "Backend & DevOps Engineer",
        projectRole: "Infrastructure",
        avatar:
          "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&h=120&fit=crop&crop=faces",
      },
      {
        id: "u-8",
        name: "Elena Rostova",
        username: "elenar",
        role: "Product Manager",
        projectRole: "Release Coordinator",
        avatar:
          "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&h=120&fit=crop&crop=faces",
      },
    ],
  },
  {
    id: "p-3",
    name: "Design System & UI Kit",
    description:
      "Centralized typography, color tokens, and atomic accessible components for all web interfaces.",
    category: "Design System",
    status: "ACTIVE",
    priority: "MEDIUM",
    color: "#06B6D4",
    startDate: "2026-09-10",
    dueDate: "2026-10-30",
    members: [
      {
        id: "u-3",
        name: "Priya Singh",
        username: "priyasingh",
        role: "UI/UX Designer",
        projectRole: "Design Token Lead",
        avatar:
          "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&h=120&fit=crop&crop=faces",
      },
      {
        id: "u-6",
        name: "Sarah Chen",
        username: "sarahc",
        role: "Design System Engineer",
        projectRole: "Component Engineer",
        avatar:
          "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&h=120&fit=crop&crop=faces",
      },
    ],
  },
  {
    id: "p-4",
    name: "Cloud Infrastructure & DevOps",
    description:
      "Kubernetes cluster deployment, CI/CD automated pipelines, and zero-downtime monitoring.",
    category: "DevOps",
    status: "PLANNING",
    priority: "LOW",
    color: "#10B981",
    startDate: "2026-10-01",
    dueDate: "2026-11-15",
    members: [
      {
        id: "u-7",
        name: "David Kim",
        username: "davidk",
        role: "Backend & DevOps Engineer",
        projectRole: "DevOps Lead",
        avatar:
          "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&h=120&fit=crop&crop=faces",
      },
      {
        id: "u-2",
        name: "Aman Kumar",
        username: "amankumar",
        role: "Backend Developer",
        projectRole: "Database Reliability",
        avatar:
          "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=120&h=120&fit=crop&crop=faces",
      },
    ],
  },
];

const projectSlice = createSlice({
  name: "projects",
  initialState: {
    projects: initialProjects,
    filter: "ALL",
    search: "",
  },
  reducers: {
    addProject(state, action) {
      const newProject = {
        ...action.payload,
        id: action.payload.id || `p-${Date.now()}`,
        members: action.payload.members || [],
        createdAt: new Date().toISOString(),
      };
      state.projects.unshift(newProject);
    },
    updateProject(state, action) {
      const idx = state.projects.findIndex((p) => p.id === action.payload.id);
      if (idx !== -1) {
        state.projects[idx] = { ...state.projects[idx], ...action.payload };
      }
    },
    deleteProject(state, action) {
      state.projects = state.projects.filter((p) => p.id !== action.payload);
    },
    tagMemberToProject(state, action) {
      const { projectId, member, projectRole = "Contributor" } = action.payload;
      const project = state.projects.find((p) => p.id === projectId);
      if (project) {
        if (!project.members) project.members = [];
        const exists = project.members.some((m) => m.id === member.id);
        if (!exists) {
          project.members.push({ ...member, projectRole });
        }
      }
    },
    untagMemberFromProject(state, action) {
      const { projectId, memberId } = action.payload;
      const project = state.projects.find((p) => p.id === projectId);
      if (project && project.members) {
        project.members = project.members.filter((m) => m.id !== memberId);
      }
    },
    setProjectFilter(state, action) {
      state.filter = action.payload;
    },
    setProjectSearch(state, action) {
      state.search = action.payload;
    },
  },
});

export const {
  addProject,
  updateProject,
  deleteProject,
  tagMemberToProject,
  untagMemberFromProject,
  setProjectFilter,
  setProjectSearch,
} = projectSlice.actions;

export default projectSlice.reducer;
