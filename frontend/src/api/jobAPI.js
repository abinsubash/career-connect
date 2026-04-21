import axiosInstance from "./axiosInstance";

const jobAPI = {
  // Create new job
  createJob: async (jobData) => {
    try {
      const response = await axiosInstance.post("/jobs", jobData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { errors: { general: "Failed to create job" } };
    }
  },

  // Get all jobs for current recruiter
  getMyJobs: async (page = 1, limit = 10, status = "all") => {
    try {
      const response = await axiosInstance.get("/jobs", {
        params: { page, limit, status },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { errors: { general: "Failed to fetch jobs" } };
    }
  },

  // Get job details
  getJob: async (jobId, includeApplications = false) => {
    try {
      const response = await axiosInstance.get(`/jobs/${jobId}`, {
        params: { include_applications: includeApplications },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { errors: { general: "Failed to fetch job" } };
    }
  },

  // Update job
  updateJob: async (jobId, jobData) => {
    try {
      const response = await axiosInstance.put(`/jobs/${jobId}`, jobData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { errors: { general: "Failed to update job" } };
    }
  },

  // Delete job
  deleteJob: async (jobId) => {
    try {
      const response = await axiosInstance.delete(`/jobs/${jobId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { errors: { general: "Failed to delete job" } };
    }
  },

  // Get applicants for a job
  getJobApplicants: async (jobId, status = null) => {
    try {
      const params = {};
      if (status) params.status = status;
      
      const response = await axiosInstance.get(`/jobs/${jobId}/applicants`, {
        params,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { errors: { general: "Failed to fetch applicants" } };
    }
  },

  // Update application status
  updateApplicationStatus: async (jobId, applicationId, status) => {
    try {
      const response = await axiosInstance.put(
        `/jobs/${jobId}/applicants/${applicationId}/status`,
        { status }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || { errors: { general: "Failed to update application status" } };
    }
  },

  // Get all public jobs (no auth required)
  getAllJobs: async (page = 1, limit = 10) => {
    try {
      const response = await axiosInstance.get("/jobs/all", {
        params: { page, limit },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { errors: { general: "Failed to fetch jobs" } };
    }
  },

  // Apply for a job (with optional resume upload)
  applyForJob: async (jobId, applicationData) => {
    try {
      // If applicationData contains a file, use FormData
      if (applicationData.resume instanceof File) {
        const formData = new FormData();
        formData.append("cover_letter", applicationData.cover_letter || "");
        formData.append("resume", applicationData.resume);

        // Send as FormData with proper headers
        const response = await axiosInstance.post(`/jobs/${jobId}/apply`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        return response.data;
      } else {
        // Send as JSON if no file
        const response = await axiosInstance.post(`/jobs/${jobId}/apply`, applicationData);
        return response.data;
      }
    } catch (error) {
      throw error.response?.data || { errors: { general: "Failed to apply for job" } };
    }
  },

  // Get user's applications
  getUserApplications: async () => {
    try {
      const response = await axiosInstance.get("/jobs/user/applications");
      return response.data;
    } catch (error) {
      throw error.response?.data || { errors: { general: "Failed to fetch applications" } };
    }
  },

  // Toggle job active/inactive status
  toggleJobStatus: async (jobId, isActive) => {
    try {
      const response = await axiosInstance.put(`/jobs/${jobId}`, { is_active: isActive });
      return response.data;
    } catch (error) {
      throw error.response?.data || { errors: { general: "Failed to toggle job status" } };
    }
  },
};

export default jobAPI;
