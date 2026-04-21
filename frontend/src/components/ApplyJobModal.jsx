import { useState } from "react";
import jobAPI from "../api/jobAPI";

// ── Icons ─────────────────────────────────────────────────────────────────
const CloseIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const UploadIcon = () => (
  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);

const FileIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
    <polyline points="13 2 13 9 20 9" />
  </svg>
);

const CheckIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
  </svg>
);

// ── Apply Job Modal Component ─────────────────────────────────────────────
export default function ApplyJobModal({ job, isOpen, onClose, onSuccess }) {
  const [coverLetter, setCoverLetter] = useState("");
  const [resume, setResume] = useState(null);
  const [resumeFile, setResumeFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // ──────────────────────────────────────────────────────────────────────
  // Handle Resume Selection
  // ──────────────────────────────────────────────────────────────────────
  const handleResumeChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
    const fileExtension = file.name.split(".").pop().toLowerCase();

    if (!allowedTypes.includes(file.type) && !["pdf", "doc", "docx"].includes(fileExtension)) {
      setError("Please upload a PDF or Word document (DOC/DOCX)");
      setResume(null);
      setResumeFile(null);
      return;
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      setError("Resume file must be less than 10MB");
      setResume(null);
      setResumeFile(null);
      return;
    }

    setResume(file);
    setResumeFile(file.name);
    setError(null);
  };

  // ──────────────────────────────────────────────────────────────────────
  // Handle Application Submission
  // ──────────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!resume) {
      setError("Please upload your resume to apply");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(false);

      const applicationData = {
        cover_letter: coverLetter,
        resume: resume,
      };

      const response = await jobAPI.applyForJob(job.id, applicationData);

      setSuccess(true);
      setTimeout(() => {
        onClose();
        onSuccess?.();
        // Reset form
        setCoverLetter("");
        setResume(null);
        setResumeFile(null);
        setSuccess(false);
      }, 1500);
    } catch (err) {
      console.error("Application failed:", err);
      setError(err.errors?.resume || err.errors?.general || "Failed to submit application");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-xl">
        
        {/* ── Header ── */}
        <div className="sticky top-0 flex items-center justify-between p-6 border-b border-gray-800 bg-gray-900/95 backdrop-blur">
          <h2 className="text-xl font-bold text-gray-100">Apply for Job</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-300 hover:bg-gray-800 rounded-lg transition-colors"
            disabled={loading}
          >
            <CloseIcon />
          </button>
        </div>

        {/* ── Content ── */}
        <div className="p-6 space-y-4">
          
          {/* Job Summary */}
          <div className="bg-gradient-to-r from-blue-500/10 to-violet-500/10 border border-blue-500/20 rounded-xl p-4">
            <h3 className="font-semibold text-gray-100 text-lg">{job?.title}</h3>
            <p className="text-sm text-gray-400 mt-1">{job?.company || "Company"}</p>
            {job?.location && <p className="text-xs text-gray-500 mt-1">📍 {job.location}</p>}
          </div>

          {/* Success State */}
          {success && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                <CheckIcon />
              </div>
              <div>
                <p className="text-sm font-semibold text-emerald-400">Application Submitted!</p>
                <p className="text-xs text-emerald-300/80">Redirecting...</p>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
              <p className="text-sm text-red-300 font-medium">⚠️ {error}</p>
            </div>
          )}

          {!success && (
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Resume Upload Section */}
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  📄 Upload Resume <span className="text-red-400">*</span>
                </label>
                <label className="block">
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleResumeChange}
                    disabled={loading}
                    className="hidden"
                  />
                  <div className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                    resume
                      ? "border-emerald-500/50 bg-emerald-500/5"
                      : "border-gray-700 hover:border-blue-500/50 hover:bg-blue-500/5"
                  }`}>
                    {resume ? (
                      <div className="flex items-center justify-center gap-2">
                        <FileIcon />
                        <div className="text-left">
                          <p className="text-sm font-medium text-emerald-400">{resumeFile}</p>
                          <p className="text-xs text-gray-500">Click to change</p>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <UploadIcon className="w-8 h-8 mx-auto mb-2 text-gray-600" />
                        <p className="text-sm font-medium text-gray-300">Drop your resume here</p>
                        <p className="text-xs text-gray-500 mt-1">or click to select</p>
                        <p className="text-xs text-gray-600 mt-2">PDF, DOC, DOCX (Max 10MB)</p>
                      </div>
                    )}
                  </div>
                </label>
              </div>

              {/* Cover Letter Section */}
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  ✉️ Cover Letter <span className="text-gray-500 text-xs font-normal">(Optional)</span>
                </label>
                <textarea
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  disabled={loading}
                  placeholder="Tell the recruiter why you're interested in this role..."
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-gray-200 placeholder-gray-600 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none disabled:opacity-50"
                  rows="4"
                />
                <p className="text-xs text-gray-600 mt-1">{coverLetter.length}/500 characters</p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || !resume}
                className={`w-full py-3 rounded-lg font-semibold text-white transition-all flex items-center justify-center gap-2 ${
                  loading || !resume
                    ? "bg-gray-700 cursor-not-allowed opacity-60"
                    : "bg-gradient-to-r from-blue-600 to-violet-600 hover:opacity-90 active:scale-95"
                }`}
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>🚀 Submit Application</>
                )}
              </button>
            </form>
          )}

        </div>

        {/* ── Footer ── */}
        <div className="border-t border-gray-800 px-6 py-3 bg-gray-900/50 text-center text-xs text-gray-500">
          Your resume and information will be sent to the recruiter
        </div>
      </div>
    </div>
  );
}
