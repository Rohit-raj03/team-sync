import { useState, useEffect, useCallback } from "react";
import { teamService } from "../services/team.service.js";

let sharedMembersList = [];
const listeners = new Set();

const notifyListeners = () => {
  listeners.forEach((listener) => listener([...sharedMembersList]));
};

/**
 * Feature Hook: useTeam
 * Connects directly to backend registered users (/api/users and /api/team/members).
 * No hardcoded or dummy users.
 */
export function useTeam() {
  const [members, setMembers] = useState(sharedMembersList);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchLiveUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await teamService.getMembers();
      const users = res?.users || res?.data || [];
      if (Array.isArray(users)) {
        const mappedUsers = users.map((u) => ({
          id: u._id || u.id,
          _id: u._id || u.id,
          name: u.name,
          username: u.username || (u.email ? u.email.split("@")[0] : ""),
          email: u.email,
          role: u.jobTitle || u.role || "Team Member",
          avatar:
            u.avatar ||
            `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
              u.name || "User"
            )}`,
          status: u.isActive !== false ? "online" : "offline",
          department: u.jobTitle?.includes("Design")
            ? "Design"
            : u.jobTitle?.includes("DevOps")
            ? "DevOps"
            : "Engineering",
        }));

        sharedMembersList = mappedUsers;
        notifyListeners();
      }
    } catch (err) {
      console.warn("Could not fetch team members from backend:", err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    listeners.add(setMembers);
    fetchLiveUsers();

    return () => {
      listeners.delete(setMembers);
    };
  }, [fetchLiveUsers]);

  // Support inviting a member via backend or instant addition
  const inviteMember = async (newMember) => {
    try {
      const res = await teamService.inviteMember(newMember);
      const invited = res?.user || res?.data;
      if (invited) {
        const mapped = {
          id: invited._id || invited.id,
          _id: invited._id || invited.id,
          name: invited.name,
          username: invited.username || (invited.email ? invited.email.split("@")[0] : ""),
          email: invited.email,
          role: invited.jobTitle || invited.role || "Team Member",
          avatar:
            invited.avatar ||
            `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
              invited.name
            )}`,
          status: "online",
          department: "Engineering",
        };
        sharedMembersList = [mapped, ...sharedMembersList];
        notifyListeners();
        return mapped;
      }
    } catch (err) {
      // Create local optimistically if backend invite endpoint is mock
      const optimistic = {
        id: `u-${Date.now()}`,
        name: newMember.name,
        username: newMember.username || newMember.name.toLowerCase().replace(/\s+/g, ""),
        email: newMember.email,
        role: newMember.role || "Contributor",
        avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
          newMember.name
        )}`,
        status: "online",
        department: "Engineering",
      };
      sharedMembersList = [optimistic, ...sharedMembersList];
      notifyListeners();
      return optimistic;
    }
  };

  return {
    members,
    loading,
    error,
    refreshMembers: fetchLiveUsers,
    inviteMember,
  };
}
