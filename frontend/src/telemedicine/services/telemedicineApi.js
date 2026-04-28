import axios from "axios";
import { auth } from "../../config/firebase";

const API = axios.create({
  baseURL: import.meta.env.VITE_TELEMEDICINE_API || "http://localhost:5006/api/telemedicine"
});

API.interceptors.request.use(async (config) => {
  try {
    if (auth.currentUser) {
      const token = await auth.currentUser.getIdToken();
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (error) {
    console.error("Error getting telemedicine token:", error);
  }

  return config;
});

export const createSession = async (payload) => {
  const response = await API.post("/sessions", payload);
  return response.data;
};

export const listSessions = async (params = {}) => {
  const response = await API.get("/sessions", { params });
  return response.data;
};

export const getSessionById = async (id) => {
  const response = await API.get(`/sessions/${id}`);
  return response.data;
};

export const updateSessionStatus = async (id, status) => {
  const response = await API.patch(`/sessions/${id}/status`, { status });
  return response.data;
};

export const generateJoinToken = async (id, payload) => {
  const response = await API.post(`/sessions/${id}/token`, payload);
  return response.data;
};

export default API;
