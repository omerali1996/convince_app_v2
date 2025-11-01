import axios from "axios";

export const BACKEND_URL =
  process.env.REACT_APP_BACKEND_URL || "https://convince-app-v1-1.onrender.com";

const api = axios.create({
  baseURL: BACKEND_URL,
  timeout: 15000,
});

export default api;
