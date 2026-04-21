import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useJobs } from "../../hooks/useJobs";
import jobAPI from "../../api/jobAPI";
import { userLogout } from "../../redux/userAuthSlice";
import UserNavbar from "../../components/UserNavbar";
import ApplyJobModal from "../../components/ApplyJobModal";

// ── Icons ─────────────────────────────────────────────────────────────────
const SearchIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
  </svg>
);
const HomeIcon = ({ cls }) => (
  <svg className={cls} viewBox="0 0 24 24" fill="currentColor"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" /></svg>
);
const BriefcaseIcon = ({ cls }) => (
  <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
  </svg>
);
const MessageIcon = ({ cls }) => (
  <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);
const BellIcon = ({ cls }) => (
  <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);
const NetworkIcon = ({ cls }) => (
  <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);
const BookmarkIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
  </svg>
);
const MapPinIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
  </svg>
);
const ClockIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
  </svg>
);
const DollarIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </svg>
);
const StarIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
);

// ── Helper: Convert backend job to display format ──────────────────────────
function formatJobForDisplay(job, index) {
  const getGradient = (index) => {
    const gradients = [
      "from-blue-900 to-blue-600",
      "from-purple-900 to-fuchsia-600",
      "from-emerald-900 to-emerald-500",
      "from-orange-900 to-orange-500",
      "from-pink-900 to-pink-500",
      "from-indigo-900 to-violet-600",
    ];
    return gradients[index % gradients.length];
  };

  const getLogo = (str) => (str || "J")[0].toUpperCase();
  const recruiterName = job.recruiter?.company_name || "Recruiter";

  return {
    id: job.id,
    title: job.title,
    company: recruiterName,
    location: job.location || "India",
    type: job.type || "Full-time",
    level: job.experience_level || "Mid-level",
    salary: `₹${(job.salary_min / 100000).toFixed(1)}L${job.salary_max ? `-₹${(job.salary_max / 100000).toFixed(1)}L` : ""}`,
    postedAt: new Date(job.created_at).toLocaleDateString(),
    logo: getLogo(recruiterName),
    grad: getGradient(index),
    rating: 4.5,
    reviews: job.applications?.length || 0,
    description: job.description || "Join our team for an exciting opportunity.",
    tags: [job.type, job.department || "General"],
  };
}

// ── Filter options ────────────────────────────────────────────────────────
const jobTypes = ["All", "Full-time", "Part-time", "Internship", "Contract"];
const levels = ["All", "Internship", "Entry-level", "Mid-level", "Senior"];
const salaryRanges = ["All", "0-10L", "10-15L", "15-25L", "25L+"];

// ── Job Card Component ────────────────────────────────────────────────────
function JobCard({ job, saved, onSave, onApply, isApplied }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 hover:border-blue-500/50 transition-all hover:shadow-lg hover:shadow-blue-500/10 cursor-pointer group">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-3 flex-1">
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${job.grad} flex items-center justify-center text-white font-bold text-lg flex-shrink-0`}>
            {job.logo}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-gray-100 group-hover:text-blue-400 transition-colors">{job.title}</h3>
            <p className="text-sm text-gray-500 mt-0.5">{job.company}</p>
          </div>
        </div>
        <button
          onClick={() => onSave(job.id)}
          className={`p-2 rounded-lg transition-all flex-shrink-0 ${saved ? "text-blue-400 bg-blue-500/10" : "text-gray-600 hover:text-blue-400 hover:bg-gray-800"}`}
        >
          <BookmarkIcon />
        </button>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-4">
        {job.tags.slice(0, 2).map(tag => (
          <span key={tag} className="text-xs px-2.5 py-1 rounded-full bg-blue-500/15 text-blue-400 font-medium">
            {tag}
          </span>
        ))}
      </div>

      {/* Info grid */}
      <div className="grid grid-cols-2 gap-3 mb-4 pb-4 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <MapPinIcon />
          <span className="text-sm text-gray-400">{job.location}</span>
        </div>
        <div className="flex items-center gap-2">
          <DollarIcon />
          <span className="text-sm font-semibold text-emerald-400">{job.salary}</span>
        </div>
        <div className="flex items-center gap-2">
          <ClockIcon />
          <span className="text-sm text-gray-400">{job.type}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs px-2.5 py-1 rounded-full bg-gray-800 text-gray-300">{job.level}</span>
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-gray-400 mb-4 line-clamp-2">{job.description}</p>

      {/* Rating + Apply */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex gap-0.5">
            {[...Array(5)].map((_, i) => (
              <StarIcon key={i} className={i < Math.floor(job.rating) ? "text-yellow-400" : "text-gray-700"} />
            ))}
          </div>
          <span className="text-xs text-gray-500">{job.rating} ({job.reviews} reviews)</span>
        </div>
        <button
          onClick={() => onApply(job)}
          disabled={isApplied}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
            isApplied 
              ? "bg-gray-800 text-gray-500 cursor-default opacity-60" 
              : "bg-gradient-to-r from-blue-600 to-violet-600 text-white hover:opacity-90"
          }`}
        >
          {isApplied ? "✓ Applied" : "Apply Now"}
        </button>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────
export default function JobsPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.userAuth);
  const { jobs, loading, error } = useJobs(50);
  
  const [selectedType, setSelectedType] = useState("All");
  const [selectedLevel, setSelectedLevel] = useState("All");
  const [selectedSalary, setSelectedSalary] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [savedJobs, setSavedJobs] = useState({});
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [appliedJobs, setAppliedJobs] = useState(new Set());

  // ── Fetch user's applications on mount ────────────────────────────────
  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const response = await jobAPI.getUserApplications();
        const appliedJobIds = new Set(response.applications?.map(app => app.job_id) || []);
        setAppliedJobs(appliedJobIds);
      } catch (err) {
        console.error("Failed to fetch applications:", err);
      }
    };

    fetchApplications();
  }, []);

  // ── Logout Handler ────────────────────────────────────────────────────
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user_auth");
    dispatch(userLogout());
    navigate("/");
  };

  // ── Handle Apply Button Click ─────────────────────────────────────────
  const handleApplyClick = (job) => {
    setSelectedJob(job);
    setShowApplyModal(true);
  };

  // ── Handle Successful Application ─────────────────────────────────────
  const handleApplicationSuccess = () => {
    if (selectedJob) {
      setAppliedJobs(prev => new Set([...prev, selectedJob.id]));
    }
  };

  // Convert and filter jobs
  const formattedJobs = jobs.map((job, idx) => formatJobForDisplay(job, idx));

  const filteredJobs = formattedJobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         job.company.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === "All" || job.type === selectedType;
    const matchesLevel = selectedLevel === "All" || job.level === selectedLevel;
    
    let matchesSalary = selectedSalary === "All";
    if (!matchesSalary) {
      const salaryNum = parseInt(job.salary.match(/\d+/)[0]);
      if (selectedSalary === "0-10L") matchesSalary = salaryNum <= 10;
      else if (selectedSalary === "10-15L") matchesSalary = salaryNum >= 10 && salaryNum <= 15;
      else if (selectedSalary === "15-25L") matchesSalary = salaryNum >= 15 && salaryNum <= 25;
      else if (selectedSalary === "25L+") matchesSalary = salaryNum >= 25;
    }

    return matchesSearch && matchesType && matchesLevel && matchesSalary;
  });

  const toggleSave = (id) => setSavedJobs(p => ({ ...p, [id]: !p[id] }));

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500;600&display=swap');
        .syne { font-family: 'Syne', sans-serif; }
        .grad-text { background: linear-gradient(135deg,#4f8ef7,#7c5cfc); -webkit-background-clip:text; -webkit-text-fill-color:transparent; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        .fade-up { animation: fadeUp .4s ease forwards; }
        .fade-up-1 { animation: fadeUp .4s .05s ease both; }
        .fade-up-2 { animation: fadeUp .4s .12s ease both; }
      `}</style>

      {/* ── NAVBAR ── */}
      <UserNavbar currentPage="Jobs" />

      {/* ── MAIN CONTENT ── */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

          {/* ────────── FILTERS (LEFT) ────────── */}
          <aside className="lg:sticky lg:top-20 h-fit">
            <div className="fade-up bg-gray-900 border border-gray-800 rounded-2xl p-4 space-y-4">
              
              {/* Search in filters */}
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">Search</label>
                <div className="flex items-center gap-2 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2">
                  <SearchIcon />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Job title, company..."
                    className="bg-transparent outline-none text-sm w-full text-gray-300 placeholder-gray-600"
                  />
                </div>
              </div>

              {/* Job Type Filter */}
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">Job Type</label>
                <div className="space-y-1.5">
                  {jobTypes.map(type => (
                    <button key={type}
                      onClick={() => setSelectedType(type)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${selectedType === type ? "bg-blue-600/20 text-blue-400 border border-blue-500/30" : "text-gray-400 hover:text-gray-200 hover:bg-gray-800"}`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Level Filter */}
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">Level</label>
                <div className="space-y-1.5">
                  {levels.map(level => (
                    <button key={level}
                      onClick={() => setSelectedLevel(level)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${selectedLevel === level ? "bg-blue-600/20 text-blue-400 border border-blue-500/30" : "text-gray-400 hover:text-gray-200 hover:bg-gray-800"}`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              {/* Salary Filter */}
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">Salary</label>
                <div className="space-y-1.5">
                  {salaryRanges.map(range => (
                    <button key={range}
                      onClick={() => setSelectedSalary(range)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${selectedSalary === range ? "bg-blue-600/20 text-blue-400 border border-blue-500/30" : "text-gray-400 hover:text-gray-200 hover:bg-gray-800"}`}
                    >
                      {range}
                    </button>
                  ))}
                </div>
              </div>

              {/* Clear filters */}
              <button
                onClick={() => {
                  setSelectedType("All");
                  setSelectedLevel("All");
                  setSelectedSalary("All");
                  setSearchQuery("");
                }}
                className="w-full py-2 rounded-lg text-sm font-medium text-gray-400 border border-gray-700 hover:border-red-500/50 hover:text-red-400 transition-all"
              >
                Clear Filters
              </button>
            </div>
          </aside>

          {/* ────────── JOBS (RIGHT) ────────── */}
          <main className="lg:col-span-3">
            <div className="fade-up space-y-4">
              {/* Results count */}
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-100">
                  {loading ? "Loading..." : `${filteredJobs.length} ${filteredJobs.length === 1 ? 'Job' : 'Jobs'} Found`}
                </h2>
              </div>

              {/* Jobs list */}
              {loading ? (
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-12 text-center">
                  <div className="inline-block w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  <p className="text-gray-400 text-sm mt-2">Loading jobs...</p>
                </div>
              ) : error ? (
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-12 text-center">
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              ) : filteredJobs.length > 0 ? (
                <div className="space-y-3">
                  {filteredJobs.map((job, idx) => (
                    <div key={job.id} style={{ animationDelay: `${idx * 0.05}s` }} className="fade-up">
                      <JobCard
                        job={job}
                        saved={savedJobs[job.id]}
                        onSave={toggleSave}
                        onApply={handleApplyClick}
                        isApplied={appliedJobs.has(job.id)}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-12 text-center">
                  <BriefcaseIcon cls="w-16 h-16 text-gray-700 mx-auto mb-4" />
                  <p className="text-gray-400 text-lg font-medium mb-2">No jobs found</p>
                  <p className="text-gray-600 text-sm">Try adjusting your filters or search terms</p>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>

      {/* ── Apply Job Modal ── */}
      <ApplyJobModal
        job={selectedJob}
        isOpen={showApplyModal}
        onClose={() => setShowApplyModal(false)}
        onSuccess={handleApplicationSuccess}
      />
    </div>
  );
}
