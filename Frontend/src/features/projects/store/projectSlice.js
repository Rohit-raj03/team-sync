import { createSlice } from "@reduxjs/toolkit";

const projectSlice = createSlice({
  name: "projects",
  initialState: {
    projects: [],
    filter: "ALL",
    search: "",
    loading: false,
    error: null,
  },
  reducers: {
    setProjects(state, action) {
      state.projects = action.payload;
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
        (item) => item.id === newProject.id || item._id === newProject.id
      );
      if (existsIndex === -1) {
        state.projects.unshift(newProject);
      } else {
        state.projects[existsIndex] = newProject;
      }
    },
    updateProject(state, action) {
      const updated = action.payload;
      const targetId = updated.id || updated._id;
      const idx = state.projects.findIndex(
        (p) => p.id === targetId || p._id === targetId
      );
      if (idx !== -1) {
        state.projects[idx] = { ...state.projects[idx], ...updated };
      }
    },
    deleteProject(state, action) {
      const id = action.payload;
      state.projects = state.projects.filter(
        (p) => p.id !== id && p._id !== id
      );
    },
    tagMemberToProject(state, action) {
      const { projectId, member, projectRole = "Contributor", role = "Member" } =
        action.payload;
      const project = state.projects.find(
        (p) => p.id === projectId || p._id === projectId
      );
      if (project) {
        if (!project.members) project.members = [];
        const memberId = member.id || member._id;
        const exists = project.members.some(
          (m) => (m.id || m._id) === memberId
        );
        if (!exists) {
          project.members.push({
            ...member,
            id: memberId,
            _id: memberId,
            role,
            projectRole,
          });
        }
      }
    },
    untagMemberFromProject(state, action) {
      const { projectId, memberId } = action.payload;
      const project = state.projects.find(
        (p) => p.id === projectId || p._id === projectId
      );
      if (project && project.members) {
        project.members = project.members.filter(
          (m) => (m.id || m._id) !== memberId
        );
      }
    },
    updateMemberRoleInProject(state, action) {
      const { projectId, memberId, role, projectRole } = action.payload;
      const project = state.projects.find(
        (p) => p.id === projectId || p._id === projectId
      );
      if (project && project.members) {
        const mem = project.members.find(
          (m) => (m.id || m._id) === memberId
        );
        if (mem) {
          if (role) mem.role = role;
          if (projectRole !== undefined) mem.projectRole = projectRole;
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
