import { apiClient } from "../../../shared/api/apiClient.js";

export const teamService = {
  getMembers: (params) => apiClient.get("/users", params),
  inviteMember: (data) => apiClient.post("/team/invite", data),
};

export default teamService;
