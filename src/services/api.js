import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8080/api";

console.info("[API] Base URL:", API_BASE);

const api = axios.create({
  baseURL: API_BASE,
  timeout: 60000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Lấy token từ zustand persist store
const getToken = () => {
  try {
    const authStore = localStorage.getItem("auth-store");
    if (authStore) {
      const parsed = JSON.parse(authStore);
      return parsed.state?.token || null;
    }
  } catch (e) {
    console.error("Error reading token:", e);
  }
  return null;
};

// Gửi token nếu có
api.interceptors.request.use(
  (config) => {
    const token = getToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log("Token added to request:", token.substring(0, 20) + "...");
    } else {
      console.warn("No token found in request");
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Bắt lỗi API
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn("401 Unauthorized - Token có thể đã hết hạn");
    }
    console.error("API Error:", error);
    return Promise.reject(error);
  }
);

// ================================================
// UPLOAD API - SEPARATE INSTANCE FOR FILES
// ================================================
// IMPORTANT: File uploads require multipart/form-data with boundary
// This separate instance does NOT set default Content-Type

const uploadApi = axios.create({
  baseURL: API_BASE,
  timeout: 60000, // 60 seconds for large files
});

// Token interceptor for upload
uploadApi.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // DO NOT set Content-Type here - let Axios set it with boundary for FormData
    return config;
  },
  (error) => Promise.reject(error)
);

// Error interceptor for upload
uploadApi.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("Upload API Error:", error);
    return Promise.reject(error);
  }
);

export { uploadApi };
export default api;
