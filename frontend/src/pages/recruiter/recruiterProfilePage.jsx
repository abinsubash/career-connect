import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import UserNavbar from "../../components/UserNavbar";
import jobAPI from "../../api/jobAPI";

// ─── Icons ──────────────────────────────────────────────────────────────
const BackIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
  </svg>
);

const BriefcaseIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <rect x="2" y="7" width="20" height="14" rx="2" />
    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
  </svg>
);

const MapPinIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const BuildingIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
  </svg>
);

// ─── Main Component ────────────────────────────────────────────────────
export default function RecruiterProfilePage() {
  const { recruiterId } = useParams();
  const navigate = useNavigate();

  const [recruiterInfo, setRecruiterInfo] = useState(null);
  const [recruiterJobs, setRecruiterJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchRecruiterData();
  }, [recruiterId]);

  const fetchRecruiterData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch recruiter's jobs
      const jobsRes = await jobAPI.getUserJobs(recruiterId);
      
      // Extract recruiter info from first job response
      let recruiterData = null;
      if (jobsRes?.data && jobsRes.data.length > 0) {
        const firstJob = jobsRes.data[0];
        recruiterData = {
          id: recruiterId,
          name: firstJob.recruiter?.name || "Recruiter",
          company: firstJob.recruiter?.company || "Company",
          role: firstJob.recruiter?.role || "Recruiter",
          department: firstJob.recruiter?.department || "",
          website: firstJob.recruiter?.website || "",
          size: firstJob.recruiter?.size || "",
        };
      } else {
        recruiterData = {
          id: recruiterId,
          name: "Recruiter",
          company: "Company",
          role: "Recruiter",
          department: "",
          website: "",
          size: "",
        };
      }

      setRecruiterInfo(recruiterData);
      setRecruiterJobs(jobsRes?.data || []);
    } catch (err) {
      console.error("Error fetching recruiter data:", err);
      setError(err.message || "Failed to load recruiter profile");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-gray-100">
        <UserNavbar currentPage="Recruiter" />
        <div className="max-w-4xl mx-auto px-4 py-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading recruiter profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-gray-100" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
        body { font-family: 'DM Sans', sans-serif; }
      `}</style>

      <UserNavbar currentPage="Recruiter" />

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-400 hover:text-gray-200 transition-colors mb-6"
        >
          <BackIcon /> Back
        </button>

        {error && (
          <div className="bg-red-500/20 border border-red-500/50 text-red-300 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Recruiter Header */}
        {recruiterInfo && (
          <div className="bg-gradient-to-r from-blue-900 to-violet-900 border border-blue-700 rounded-lg p-8 mb-8">
            <div className="flex items-start gap-6">
              {/* Avatar */}
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-violet-600 rounded-full flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
                {recruiterInfo.name?.charAt(0).toUpperCase()}
              </div>

              {/* Recruiter Info */}
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-white mb-2">{recruiterInfo.name}</h1>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-blue-200">
                    <BuildingIcon />
                    <span>{recruiterInfo.company || "Company"}</span>
                  </div>
                  {recruiterInfo.role && (
                    <p className="text-blue-100">{recruiterInfo.role}</p>
                  )}
                  {recruiterInfo.website && (
                    <a
                      href={recruiterInfo.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-300 hover:text-blue-200 transition-colors text-sm underline"
                    >
                      {recruiterInfo.website}
                    </a>
                  )}
                </div>

                {/* Company Size Badge */}
                {recruiterInfo.size && (
                  <span className="inline-block bg-blue-500/30 text-blue-200 text-xs px-3 py-1 rounded-full border border-blue-500/50">
                    {recruiterInfo.size}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Jobs Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-100 mb-6">Open Positions ({recruiterJobs.length})</h2>
          
          {recruiterJobs.length === 0 ? (
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-8 text-center">
              <BriefcaseIcon />
              <p className="text-gray-400 text-lg font-semibold mt-4 mb-2">No jobs posted yet</p>
              <p className="text-gray-600 text-sm">Check back soon for new opportunities</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {recruiterJobs.map((job) => (
                <div
                  key={job.id}
                  className="bg-gray-900 border border-gray-800 rounded-lg p-6 hover:border-blue-500/50 transition-colors cursor-pointer"
                  onClick={() => navigate(`/jobs/${job.id}`)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-100 mb-1">{job.title}</h3>
                      <p className="text-gray-500 text-sm">{job.department}</p>
                    </div>
                    <span
                      className={`text-xs px-3 py-1 rounded-full font-semibold ${
                        job.is_active
                          ? "bg-green-500/20 text-green-300 border border-green-500/30"
                          : "bg-gray-700/30 text-gray-400 border border-gray-600/30"
                      }`}
                    >
                      {job.is_active ? "Active" : "Inactive"}
                    </span>
                  </div>

                  {/* Job Meta */}
                  <div className="flex flex-wrap gap-3 mb-4">
                    <span className="bg-blue-500/20 text-blue-300 text-xs px-3 py-1 rounded-full border border-blue-500/30 font-semibold">
                      {job.type}
                    </span>
                    <span className="bg-purple-500/20 text-purple-300 text-xs px-3 py-1 rounded-full border border-purple-500/30">
                      {job.location_type}
                    </span>
                    {job.salary_min && (
                      <span className="bg-emerald-500/20 text-emerald-300 text-xs px-3 py-1 rounded-full border border-emerald-500/30">
                        ₹{(job.salary_min / 100000).toFixed(1)}L - ₹{job.salary_max ? (job.salary_max / 100000).toFixed(1) : "?"}L/yr
                      </span>
                    )}
                    <div className="flex items-center gap-1 text-gray-400 text-xs">
                      <MapPinIcon />
                      <span>{job.location}</span>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-gray-400 text-sm line-clamp-2 mb-4">{job.description}</p>

                  {/* Skills */}
                  {job.skills && job.skills.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {job.skills.slice(0, 4).map((skill, idx) => (
                        <span
                          key={idx}
                          className="bg-gray-800 text-gray-300 text-xs px-2.5 py-1 rounded-full border border-gray-700"
                        >
                          {skill}
                        </span>
                      ))}
                      {job.skills.length > 4 && (
                        <span className="text-gray-500 text-xs px-2.5 py-1">
                          +{job.skills.length - 4} more
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
