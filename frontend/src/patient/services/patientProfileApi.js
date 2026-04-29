import axios from "axios";
import { auth } from "../../config/firebase";
import { getIdToken } from "firebase/auth";

const patientProfileApi = axios.create({
  baseURL: import.meta.env.VITE_PATIENT_API || "http://localhost:5003/api/patients"
});

patientProfileApi.interceptors.request.use(async (config) => {
  try {
    if (auth.currentUser) {
      const token = await getIdToken(auth.currentUser);
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (error) {
    console.error("Error getting patient token:", error);
  }

  return config;
});

export default patientProfileApi;
