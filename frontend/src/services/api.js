

import axios from "axios";

const api = axios.create({
  baseURL: "http://127.0.0.1:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

export const checkBackend = () => api.get("/health");
export const getLogs = () => api.get("/logs");
export const getAlerts = () => api.get("/alerts");
export const runAnalysis = () => api.post("/analyze");
export const verifyIntegrity = () =>
  api.post("/integrity/verify");
export const getIntegrityStatus = () =>
  api.get("/integrity/status");

export default api;