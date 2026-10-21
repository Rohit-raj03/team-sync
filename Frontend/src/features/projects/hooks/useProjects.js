import { useMemo, useEffect, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  setProjects,
  setLoading,
  setError,
  addProject as addProjectAction,
  updateProject as updateProjectAction,
  deleteProject as deleteProjectAction,
  tagMemberToProject as tagMemberAction,
  untagMemberFromProject as untagMemberAction,
  updateMemberRoleInProject as updateMemberRoleAction,
  setProjectFilter,
  setProjectSearch,
} from "../store/projectSlice.js";
import { projectService } from "../services/project.service.js";

/**
 * Feature Hook: useProjects
 * Connects frontend project state to backend REST APIs with live task metrics & member management.
 */
export function useProjects() {
  const dispatch = useDispatch();
  const { projects, filter, search, loading, error } = useSelector(
    (state) => state.projects
  );
  const tasks = useSelector((state) => state.tasks?.tasks || []);

  // Fetch projects from server on mount
  const fetchProjects = useCallback(async () => {
    try {
      dispatch(setLoading(true));
      const res = await projectService.getProjects();
      const serverProjects = res?.projects || res?.data;
      if (Array.isArray(serverProjects)) {
        dispatch(setProjects(serverProjects));
      }
    } catch (err) {
      console.warn("Could not fetch projects from server:", err.message);
      dispatch(setError(err.message));
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  // Compute linked tasks and completion percentage dynamically for every project
  const enrichedProjects = useMemo(() => {
    return projects.map((p) => {
      const pId = p.id || p._id;
      const projectTasks = tasks.filter(
        (t) => (t.projectId || t.project?._id || t.project) === pId
      );
      const totalTasks = projectTasks.length > 0 ? projectTasks.length : p.tasksCount || 0;
      const completedTasks =
        projectTasks.length > 0
          ? projectTasks.filter(
              (t) =>
                t.status === "COMPLETED" ||
                t.status === "Completed" ||
                t.status === "Done"
            ).length
          : p.completedTasksCount || 0;
      const progress =
        totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : p.progress || 0;

      return {
        ...p,
        id: pId,
        _id: pId,
        tasksCount: totalTasks,
        completedTasksCount: completedTasks,
        progress,
        membersCount: p.members ? p.members.length : 0,
      };
    });
  }, [projects, tasks]);

  const filteredProjects = useMemo(() => {
    return enrichedProjects.filter((p) => {
      const matchesFilter =
        filter === "ALL" ||
        p.status?.toUpperCase() === filter.toUpperCase();

      const q = search.toLowerCase();
      const matchesSearch =
        !search ||
        p.name?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q) ||
        p.members?.some((m) =>
          (m.name || m.user?.name)?.toLowerCase().includes(q)
        );

      return matchesFilter && matchesSearch;
    });
  }, [enrichedProjects, filter, search]);

  const getProjectById = useCallback(
    (id) => {
      if (!id) return null;
      return (
        enrichedProjects.find(
          (p) =>
            p.id?.toString() === id?.toString() ||
            p._id?.toString() === id?.toString()
        ) || null
      );
    },
    [enrichedProjects]
  );

  const getProjectTasks = useCallback(
    (id) => {
      return tasks.filter(
        (t) => (t.projectId || t.project?._id || t.project) === id
      );
    },
    [tasks]
  );

  const handleAddProject = async (data) => {
    try {
      const res = await projectService.createProject(data);
      const created = res?.project || res?.data || data;
      dispatch(addProjectAction(created));
      return created;
    } catch (err) {
      // Fall back to local dispatch if server is offline
      const localProject = { ...data, id: `p-${Date.now()}` };
      dispatch(addProjectAction(localProject));
      return localProject;
    }
  };

  const handleUpdateProject = async (id, data) => {
    try {
      const res = await projectService.updateProject(id, data);
      const updated = res?.project || res?.data || { id, ...data };
      dispatch(updateProjectAction(updated));
      return updated;
    } catch (err) {
      dispatch(updateProjectAction({ id, ...data }));
    }
  };

  const handleDeleteProject = async (id) => {
    try {
      await projectService.deleteProject(id);
      dispatch(deleteProjectAction(id));
      return true;
    } catch (err) {
      dispatch(deleteProjectAction(id));
      return false;
    }
  };

  const handleTagMember = async (projectId, member, projectRole = "Contributor", role = "Member") => {
    const memberId = member.id || member._id;
    try {
      const res = await projectService.addProjectMember(projectId, {
        userId: memberId,
        role,
        projectRole,
      });
      if (res?.members) {
        dispatch(
          updateProjectAction({
            id: projectId,
            members: res.members,
          })
        );
      } else {
        dispatch(tagMemberAction({ projectId, member, projectRole, role }));
      }
    } catch (err) {
      dispatch(tagMemberAction({ projectId, member, projectRole, role }));
    }
  };

  const handleUntagMember = async (projectId, memberId) => {
    try {
      const res = await projectService.removeProjectMember(projectId, memberId);
      if (res?.members) {
        dispatch(
          updateProjectAction({
            id: projectId,
            members: res.members,
          })
        );
      } else {
        dispatch(untagMemberAction({ projectId, memberId }));
      }
    } catch (err) {
      dispatch(untagMemberAction({ projectId, memberId }));
    }
  };

  const handleUpdateMemberRole = async (projectId, memberId, role, projectRole) => {
    try {
      const res = await projectService.updateProjectMemberRole(projectId, memberId, {
        role,
        projectRole,
      });
      if (res?.members) {
        dispatch(
          updateProjectAction({
            id: projectId,
            members: res.members,
          })
        );
      } else {
        dispatch(
          updateMemberRoleAction({ projectId, memberId, role, projectRole })
        );
      }
    } catch (err) {
      dispatch(
        updateMemberRoleAction({ projectId, memberId, role, projectRole })
      );
    }
  };

  return {
    projects: filteredProjects,
    allProjects: enrichedProjects,
    filter,
    search,
    loading,
    error,
    setFilter: (f) => dispatch(setProjectFilter(f)),
    setSearch: (s) => dispatch(setProjectSearch(s)),
    getProjectById,
    getProjectTasks,
    fetchProjects,
    addProject: handleAddProject,
    updateProject: handleUpdateProject,
    deleteProject: handleDeleteProject,
    tagMemberToProject: handleTagMember,
    untagMemberFromProject: handleUntagMember,
    updateMemberRole: handleUpdateMemberRole,
  };
}
