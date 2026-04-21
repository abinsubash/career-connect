import axios from "axios";

// Detect backend URL - support both localhost and 127.0.0.1
const getBackendURL = () => {
  if (typeof window !== "undefined") {
    const hostname = window.location.hostname;
    const url = `http://${hostname}:5000/api/auth`;
    console.log("Auth API URL:", url);
    return url;
  }
  return "http://127.0.0.1:5000/api/auth";
};

const API_BASE = getBackendURL();

// Create axios instance with credentials
const apiClient = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor to include Authorization header
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const authAPI = {
  // User Login
  userLogin: async (email, password) => {
    const response = await apiClient.post("/login", {
      email: email.trim(),
      password,
    });
    return response.data;
  },

  // Recruiter Login
  recruiterLogin: async (email, password) => {
    const response = await apiClient.post("/recruiter/login", {
      email: email.trim(),
      password,
    });
    return response.data;
  },

  // Recruiter Signup
  recruiterSignup: async (data) => {
    const response = await apiClient.post("/recruiter/signup", {
      name: data.name.trim(),
      email: data.email.trim(),
      password: data.password,
      company: data.company.trim(),
      website: data.website?.trim() || null,
      size: data.size,
      role: data.role.trim(),
      department: data.department,
    });
    return response.data;
  },

  // Get current recruiter
  getMe: async () => {
    const response = await apiClient.get("/recruiter/me");
    return response.data;
  },

  // Recruiter Logout
  recruiterLogout: async () => {
    const response = await apiClient.post("/recruiter/logout");
    return response.data;
  },

  // Get User Profile (from DB)
  getUserProfile: async () => {
    const response = await apiClient.get("/profile");
    return response.data;
  },

  // Update User Profile
  updateUserProfile: async (profileData) => {
    const response = await apiClient.put("/profile", profileData);
    return response.data;
  },
};

export default apiClient;
