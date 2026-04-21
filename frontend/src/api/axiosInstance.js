import axios from "axios";

// Detect backend URL - support both localhost and 127.0.0.1
const getBackendURL = () => {
  if (typeof window !== "undefined") {
    const hostname = window.location.hostname;
    const url = `http://${hostname}:5000/api`;
    console.log("Backend URL:", url);
    return url;
  }
  return "http://127.0.0.1:5000/api";
};

const axiosInstance = axios.create({
  baseURL: getBackendURL(),
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor to include Authorization header
axiosInstance.interceptors.request.use(
  (config) => {
    let token = null;
    
    // Check recruiter auth storage FIRST (from Redux persistence)
    const recruiterAuth = localStorage.getItem("recruiter_auth");
    if (recruiterAuth) {
      try {
        const authData = JSON.parse(recruiterAuth);
        token = authData.token;
        console.log("✅ Using recruiter token from recruiter_auth");
      } catch (e) {
        console.error("❌ Failed to parse recruiter_auth:", e);
      }
    }
    
    // If no recruiter auth, check plain token
    if (!token) {
      token = localStorage.getItem("token");
      if (token) {
        console.log("✅ Using fallback token");
      }
    }
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log("✅ Authorization header set for:", config.url);
    } else {
      console.warn("⚠️ No token found for:", config.url);
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - DO NOT redirect, let components handle errors
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error("❌ 401 Unauthorized on:", error.config?.url);
      console.error("Response:", error.response?.data);
      
      // ⚠️ IMPORTANT: Don't redirect here - let components handle it
      // Only log the error for debugging
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;