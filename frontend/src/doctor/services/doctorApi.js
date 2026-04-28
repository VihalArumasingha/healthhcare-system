import axios from "axios";
import { auth } from "../../config/firebase";
import { getIdToken } from "firebase/auth";

const API = axios.create({
  baseURL: import.meta.env.VITE_DOCTOR_API
});

// Attach token to every request
API.interceptors.request.use(async (config) => {
  try {
    if (auth.currentUser) {
      const token = await getIdToken(auth.currentUser);
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (error) {
    console.error("Error getting token:", error);
  }
  return config;
});

export default API;