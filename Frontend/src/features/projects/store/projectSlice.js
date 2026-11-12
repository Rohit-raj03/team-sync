import { createSlice } from "@reduxjs/toolkit";
import { storage } from "../../../shared/utils/localStorage.js";

const initialProjects = storage.get("agentrateam", []);

const projectSlice = createSlice({
  name: "projects",
  initialState: {
    projects: Array.isArray(initialProjects) ? initialProjects : [],
    filter: "ALL",
    search: "",
    loading: false,
    error: null,
  },
  reducers: {
    setProjects(state, action) {
      const serverProjects = action.payload || [];
      // Preserve any locally created projects (e.g. p-*) that haven't synced to server yet
      const localProjects = (state.projects || []).filter(
        (lp) =>
          typeof (lp.id || lp._id) === "string" &&
          (lp.id || lp._id).startsWith("p-") &&
          !serverProjects.some((sp) => (sp.id || sp._id) === (lp.id || lp._id)),
      );
      state.projects = [...localProjects, ...serverProjects];
      storage.set("agentrateam", state.projects);
      state.loading = false;
      state.error = null;
    },
    setLoading(state, action) {
      state.loading = action.payload;
    },
    setError(state, action) {
      state.error = action.payload;
      state.loading = false;
    },
    addProject(state, action) {
      const p = action.payload;
      const newProject = {
        ...p,
        id: p.id || p._id || `p-${Date.now()}`,
        _id: p._id || p.id,
        members: p.members || [],
        createdAt: p.createdAt || new Date().toISOString(),
      };
      const existsIndex = state.projects.findIndex(
        (item) => item.id === newProject.id || item._id === newProject.id,
      );
      if (existsIndex === -1) {
        state.projects.unshift(newProject);
      } else {
        state.projects[existsIndex] = newProject;
      }
      storage.set("agentrateam", state.projects);
    },
    updateProject(state, action) {
      const updated = action.payload;
      const targetId = updated.id || updated._id;
      const idx = state.projects.findIndex(
        (p) => p.id === targetId || p._id === targetId,
      );
      if (idx !== -1) {
        state.projects[idx] = { ...state.projects[idx], ...updated };
        storage.set("agentrateam", state.projects);
      }
    },
    deleteProject(state, action) {
      const id = action.payload;
      state.projects = state.projects.filter(
        (p) => p.id !== id && p._id !== id,
      );
      storage.set("agentrateam", state.projects);
    },
    tagMemberToProject(state, action) {
      const {
        projectId,
        member,
        projectRole = "Contributor",
        role = "Member",
      } = action.payload;
      const project = state.projects.find(
        (p) => p.id === projectId || p._id === projectId,
      );
      if (project) {
        if (!project.members) project.members = [];
        const memberId = member.id || member._id;
        const exists = project.members.some(
          (m) => (m.id || m._id) === memberId,
        );
        if (!exists) {
          const rawTags =
            Array.isArray(member.tags) && member.tags.length > 0
              ? member.tags
              : Array.isArray(projectRole) && projectRole.length > 0
                ? projectRole
                : typeof projectRole === "string" && projectRole.includes(",")
                  ? projectRole
                      .split(",")
                      .map((s) => s.trim())
                      .filter(Boolean)
                  : [projectRole || "Contributor"];

          project.members.push({
            ...member,
            id: memberId,
            _id: memberId,
            role,
            projectRole: Array.isArray(projectRole)
              ? projectRole.join(", ")
              : projectRole,
            projectRoles: rawTags,
            tags: rawTags,
          });
          storage.set("agentrateam", state.projects);
        }
      }
    },
    untagMemberFromProject(state, action) {
      const { projectId, memberId } = action.payload;
      const project = state.projects.find(
        (p) => p.id === projectId || p._id === projectId,
      );
      if (project && project.members) {
        project.members = project.members.filter(
          (m) => (m.id || m._id) !== memberId,
        );
        storage.set("agentrateam", state.projects);
      }
    },
    updateMemberRoleInProject(state, action) {
      const { projectId, memberId, role, projectRole } = action.payload;
      const project = state.projects.find(
        (p) => p.id === projectId || p._id === projectId,
      );
      if (project && project.members) {
        const mem = project.members.find((m) => (m.id || m._id) === memberId);
        if (mem) {
          if (role) mem.role = role;
          if (projectRole !== undefined) {
            const rawTags =
              Array.isArray(projectRole) && projectRole.length > 0
                ? projectRole
                : typeof projectRole === "string" && projectRole.includes(",")
                  ? projectRole
                      .split(",")
                      .map((s) => s.trim())
                      .filter(Boolean)
                  : [projectRole];
            mem.projectRole = Array.isArray(projectRole)
              ? projectRole.join(", ")
              : projectRole;
            mem.projectRoles = rawTags;
            mem.tags = rawTags;
          }
          if (Array.isArray(action.payload.tags)) {
            mem.tags = action.payload.tags;
            mem.projectRoles = action.payload.tags;
          }
          storage.set("agentrateam", state.projects);
        }
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
  setProjects,
  setLoading,
  setError,
  addProject,
  updateProject,
  deleteProject,
  tagMemberToProject,
  untagMemberFromProject,
  updateMemberRoleInProject,
  setProjectFilter,
  setProjectSearch,
} = projectSlice.actions;

export default projectSlice.reducer;
