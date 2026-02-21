/**
 * api.js
 * Axios instance + all API service functions.
 * Replace BASE_URL with your Express server URL.
 * All functions return { data } from axios — swap mock returns for real calls.
 */
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

// Attach JWT from localStorage to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("hackx_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

/* ── AUTH ── */
export const authService = {
  login:    (data) => api.post("/auth/login", data),
  register: (data) => api.post("/auth/register", data),
  logout:   ()     => api.post("/auth/logout"),
  me:       ()     => api.get("/auth/me"),
};

/* ── TEAMS ── */
export const teamService = {
  getAll:      ()         => api.get("/teams"),
  getById:     (id)       => api.get(`/teams/${id}`),
  create:      (data)     => api.post("/teams", data),
  join:        (code)     => api.post("/teams/join", { code }),
  leave:       (id)       => api.post(`/teams/${id}/leave`),
  submitRound: (id, data) => api.post(`/teams/${id}/submit`, data),
};

/* ── HACKATHON / PROBLEM STATEMENTS ── */
export const hackathonService = {
  getPS:       ()     => api.get("/hackathon/problem-statements"),
  getMeta:     ()     => api.get("/hackathon/meta"),
  selectPS:    (psId) => api.post("/hackathon/select-ps", { psId }),
};

/* ── EVALUATION ── */
export const evalService = {
  getSubmissions: ()           => api.get("/eval/submissions"),
  scoreTeam:      (id, scores) => api.post(`/eval/score/${id}`, scores),
  getLeaderboard: ()           => api.get("/eval/leaderboard"),
  shortlist:      (ids)        => api.post("/eval/shortlist", { ids }),
};

/* ── QR / ENTRY ── */
export const qrService = {
  getMyQR:      ()        => api.get("/qr/my"),
  scanEntry:    (qrCode)  => api.post("/qr/scan-entry", { qrCode }),
  scanMeal:     (qrCode, meal) => api.post("/qr/scan-meal", { qrCode, meal }),
  getMealStats: ()        => api.get("/qr/meal-stats"),
  getEntryLog:  ()        => api.get("/qr/entry-log"),
};

/* ── USERS / MENTORS ── */
export const userService = {
  getVerificationStatus: ()     => api.get("/users/verification"),
  uploadVerification:    (data) => api.post("/users/verification", data),
  getMentors:            ()     => api.get("/users/mentors"),
  assignMentor:          (teamId, mentorId) =>
    api.post(`/users/assign-mentor`, { teamId, mentorId }),
};
