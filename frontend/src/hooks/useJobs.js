import { useState, useEffect } from "react";
import jobAPI from "../api/jobAPI";

/**
 * Custom hook to fetch and manage jobs data
 * @param {number} limit - Number of jobs to fetch per page
 * @returns {object} - { jobs, loading, error, refetch }
 */
export function useJobs(limit = 20) {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await jobAPI.getAllJobs(1, limit);
      setJobs(data.data || data.jobs || []);
    } catch (err) {
      console.error("Failed to fetch jobs:", err);
      setError(err.errors?.general || "Failed to fetch jobs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [limit]);

  return { jobs, loading, error, refetch: fetchJobs };
}
