import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const api = axios.create({ baseURL: BASE_URL });

// Attach JWT to every outbound request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("hackx_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

/* AUTH */
export const authService = {
  login:    (data) => api.post("/auth/login",    data),
  register: (data) => api.post("/auth/register", data),
  logout:   ()     => api.post("/auth/logout"),
  me:       ()     => api.get("/auth/me"),
};

/* TEAMS */
export const teamService = {
  getAll:  ()         => api.get("/teams"),
  getById: (id)       => api.get(`/teams/${id}`),
  create:  (data)     => api.post("/teams", data),
  join:    (code)     => api.post("/teams/join", { code }),
  leave:   (id)       => api.post(`/teams/${id}/leave`),
  submit:  (id, data) => api.post(`/teams/${id}/submit`, data),
  update:  (id, data) => api.patch(`/teams/${id}`, data),
};

/* EVALUATION */
export const evalService = {
  getLeaderboard: ()         => api.get("/eval/leaderboard"),
  getSubmissions: ()         => api.get("/eval/submissions"),
  score:          (id, data) => api.post(`/eval/score/${id}`, data),
  shortlist:      (ids)      => api.post("/eval/shortlist", { ids }),
};

/* QR */
export const qrService = {
  getMyQR:      ()             => api.get("/qr/my"),
  scanEntry:    (userId)       => api.post("/qr/scan-entry", { userId }),
  scanMeal:     (userId, meal) => api.post("/qr/scan-meal",  { userId, meal }),
  getMealStats: ()             => api.get("/qr/meal-stats"),
  getEntryLog:  ()             => api.get("/qr/entry-log"),
};

/* USERS */
export const userService = {
  getAll:       (role)             => api.get("/users", { params: { role } }),
  getMentors:   ()                 => api.get("/users/mentors"),
  getDashStats: ()                 => api.get("/users/dashboard-stats"),
  verify:       (id, verified)     => api.patch(`/users/${id}/verify`, { verified }),
  assignMentor: (teamId, mentorId) => api.post("/users/assign-mentor", { teamId, mentorId }),
};
