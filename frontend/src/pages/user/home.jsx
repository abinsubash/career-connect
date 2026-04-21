import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useJobs } from "../../hooks/useJobs";
import jobAPI from "../../api/jobAPI";
import { userLogout } from "../../redux/userAuthSlice";
import ApplyJobModal from "../../components/ApplyJobModal";
import UserNavbar from "../../components/UserNavbar";

// ── Icons (inline SVG components) ─────────────────────────────────────────────
const HomeIcon = ({ cls }) => (
  <svg className={cls} viewBox="0 0 24 24" fill="currentColor"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" /></svg>
);
const NetworkIcon = ({ cls }) => (
  <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
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
const SearchIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
  </svg>
);
const BookmarkIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
  </svg>
);
const LikeIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z" />
  </svg>
);
const CommentIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);
const RepostIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="17 1 21 5 17 9" /><path d="M3 11V9a4 4 0 0 1 4-4h14" />
    <polyline points="7 23 3 19 7 15" /><path d="M21 13v2a4 4 0 0 1-4 4H3" />
  </svg>
);
const ImageIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" />
  </svg>
);
const VideoIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polygon points="23 7 16 12 23 17 23 7" /><rect x="1" y="5" width="15" height="14" rx="2" />
  </svg>
);
const ArticleIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14,2 14,8 20,8" />
  </svg>
);
const InfoIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" /><path d="M12 8v4m0 4h.01" />
  </svg>
);
const XIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);
const SchoolIcon = ({ cls }) => (
  <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c3 3 9 3 12 0v-5" />
  </svg>
);
const FileIcon = ({ cls }) => (
  <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14,2 14,8 20,8" />
  </svg>
);
const WifiIcon = ({ cls }) => (
  <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="3" /><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14" />
  </svg>
);

// ── Side Nav Items ────────────────────────────────────────────────────────────
const sideNavItems = [
  { label: "Home Feed", icon: HomeIcon, badge: null, active: true },
  { label: "Job Listings", icon: BriefcaseIcon, badge: "New" },
  { label: "Internships", icon: SchoolIcon, badge: null },
  { label: "My Applications", icon: FileIcon, badge: null },
  { label: "Saved Jobs", icon: BookmarkIcon, badge: null },
  { label: "Posts", icon: ImageIcon, badge: null },
];

const navItems = [
  { label: "Home", icon: HomeIcon, active: true, badge: 0 },
  { label: "Jobs", icon: BriefcaseIcon, active: false, badge: 0 },
  { label: "Posts", icon: ImageIcon, active: false, badge: 0 },
  { label: "Messages", icon: MessageIcon, active: false, badge: 3 },
  { label: "Alerts", icon: BellIcon, active: false, badge: 5 },
];

const TABS = ["All", "Jobs", "Internships"];

// ── Sub-components ─────────────────────────────────────────────────────────
function Avatar({ letters, grad, size = "md" }) {
  const sizes = { sm: "w-8 h-8 text-xs", md: "w-10 h-10 text-sm", lg: "w-12 h-12 text-base", xl: "w-14 h-14 text-lg" };
  return (
    <div className={`${sizes[size]} rounded-full bg-gradient-to-br ${grad} flex items-center justify-center font-bold text-white flex-shrink-0`}>
      {letters}
    </div>
  );
}

function FeedCard({ item, isApplied, onApply }) {
  const [liked, setLiked] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="p-5 border-b border-gray-800 last:border-b-0 hover:bg-gray-900/40 transition-colors">
      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        <Avatar letters={item.avatar} grad={item.avatarGrad} size="md" />
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-100 text-sm leading-tight">{item.poster}</p>
          <p className="text-gray-500 text-xs mt-0.5">{item.role}</p>
        </div>
        <span className="text-gray-600 text-xs flex-shrink-0">{item.time}</span>
      </div>

      {/* Body */}
      <p className="text-gray-400 text-sm leading-relaxed mb-3 whitespace-pre-line">{item.body}</p>

      {/* Job embed */}
      {item.job && (
        <div className="bg-gray-900 border border-gray-700 rounded-xl p-3 mb-3 hover:border-blue-500/50 transition-colors cursor-pointer">
          <div className="flex items-center gap-2 mb-2">
            <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${item.job.logoGrad} flex items-center justify-center text-white text-xs font-bold`}>
              {item.avatar}
            </div>
            <div>
              <p className="font-bold text-gray-100 text-sm">{item.job.title}</p>
              <p className="text-gray-500 text-xs">{item.job.company}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="text-xs font-semibold text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-2 py-0.5 rounded-full">✦ {item.job.type}</span>
            <span className="text-xs font-semibold text-orange-400 bg-orange-400/10 border border-orange-400/20 px-2 py-0.5 rounded-full">{item.job.pay}</span>
            <span className="text-xs text-gray-400 bg-gray-800 border border-gray-700 px-2 py-0.5 rounded-full">{item.job.mode}</span>
          </div>
        </div>
      )}

      {/* Footer actions */}
      <div className="flex items-center gap-1 pt-1">
        <button
          onClick={() => setLiked(!liked)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${liked ? "text-blue-400 bg-blue-500/10" : "text-gray-500 hover:text-gray-200 hover:bg-gray-800"}`}
        >
          <LikeIcon /> Like
        </button>
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-500 hover:text-gray-200 hover:bg-gray-800 transition-all">
          <CommentIcon /> Comment
        </button>
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-500 hover:text-gray-200 hover:bg-gray-800 transition-all">
          <RepostIcon /> Repost
        </button>
        {item.job && (
          <button 
            onClick={() => onApply(item.job)}
            disabled={isApplied}
            className={`ml-auto flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              isApplied 
                ? "bg-gray-800 text-gray-500 cursor-default opacity-60" 
                : "bg-gradient-to-r from-blue-600 to-violet-600 text-white hover:opacity-90 hover:-translate-y-0.5 shadow-lg shadow-blue-500/20"
            }`}
          >
            {isApplied ? "✓ Applied" : "Apply Now →"}
          </button>
        )}
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────
export default function HomePage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.userAuth);
  const { jobs, loading, error } = useJobs(20);
  const [activeTab, setActiveTab] = useState("All");
  const [activeNav, setActiveNav] = useState("Home Feed");
  const [showAlert, setShowAlert] = useState(true);
  const [savedJobs, setSavedJobs] = useState({});
  const [appliedJobs, setAppliedJobs] = useState(new Set());
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [loadingApplications, setLoadingApplications] = useState(true);

  // ── Fetch user's applications on mount ────────────────────────────────
  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setLoadingApplications(true);
        const response = await jobAPI.getUserApplications();
        const appliedJobIds = new Set(response.applications?.map(app => app.job_id) || []);
        setAppliedJobs(appliedJobIds);
      } catch (err) {
        console.error("Failed to fetch applications:", err);
      } finally {
        setLoadingApplications(false);
      }
    };

    fetchApplications();
  }, []);

  const toggleSave = (id) => setSavedJobs(p => ({ ...p, [id]: !p[id] }));

  // ── Handle Apply Button Click ─────────────────────────────────────────
  const handleApplyClick = (job) => {
    const formattedJob = {
      id: job.id || job.jobId,
      title: job.title,
      company: job.company,
      location: job.company?.split('·')[1]?.trim() || "Location",
    };
    setSelectedJob(formattedJob);
    setShowApplyModal(true);
  };

  // ── Handle Successful Application ─────────────────────────────────────
  const handleApplicationSuccess = () => {
    if (selectedJob) {
      setAppliedJobs(prev => new Set([...prev, selectedJob.id]));
    }
  };

  // ── Logout Handler ────────────────────────────────────────────────────
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user_auth");
    dispatch(userLogout());
    navigate("/");
  };

  // ── Convert backend job to feed format ─────────────────────────────────
  const jobToFeedItem = (job, index) => {
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

    const getLetterFromString = (str) => (str || "J")[0].toUpperCase();
    const recruiterName = job.recruiter?.company_name || "Recruiter";
    const grad = getGradient(index);

    return {
      id: job.id,
      jobId: job.id,
      type: "job",
      poster: recruiterName,
      role: `${job.department} · Job Opening`,
      avatar: getLetterFromString(recruiterName),
      avatarGrad: grad,
      time: new Date(job.created_at).toLocaleDateString(),
      body: job.description || "Join our team for an exciting opportunity!",
      job: {
        jobId: job.id,
        title: job.title,
        company: `${recruiterName} · ${job.location}`,
        type: job.type,
        pay: `₹${(job.salary_min / 100000).toFixed(1)}L${job.salary_max ? `-₹${(job.salary_max / 100000).toFixed(1)}L` : ""}`,
        mode: job.location_type,
        logoGrad: grad,
      },
      likes: 0,
      comments: job.applications?.length || 0,
    };
  };

  // Convert jobs to feed format
  const feedItems = jobs.map((job, idx) => jobToFeedItem(job, idx));

  // Filter by tab
  const filteredFeed = feedItems.filter(item => {
    if (activeTab === "All") return true;
    if (activeTab === "Jobs") return item.type === "job";
    if (activeTab === "Internships") return item.job?.type === "Internship";
    return true;
  });

  // Extract unique recruiters/companies for "People You May Know" section
  const getRecommendedPeople = () => {
    const seen = new Set();
    const people = [];
    
    jobs.forEach((job, idx) => {
      if (!seen.has(job.recruiter?.id) && people.length < 3) {
        seen.add(job.recruiter?.id);
        const grad = ["from-blue-900 to-blue-600", "from-purple-900 to-fuchsia-600", "from-emerald-900 to-emerald-500"][idx % 3];
        people.push({
          id: job.recruiter?.id || idx,
          name: job.recruiter?.name || "Recruiter",
          title: `Hiring at ${job.recruiter?.company_name || "Company"}`,
          mutual: Math.floor(Math.random() * 20) + 1,
          av: (job.recruiter?.company_name || "J")[0].toUpperCase(),
          grad,
        });
      }
    });
    
    return people;
  };

  // Extract job types/departments for trending
  const getTrendingTags = () => {
    const jobTypes = {};
    jobs.forEach(job => {
      const dept = job.department || "General";
      jobTypes[dept] = (jobTypes[dept] || 0) + 1;
    });

    return Object.entries(jobTypes)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([tag, count]) => ({
        tag: `#${tag}`,
        count: `${count} job${count > 1 ? "s" : ""} available`,
      }));
  };

  const recommendedPeople = getRecommendedPeople();
  const trendingTags = getTrendingTags();

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500;600&display=swap');
        .syne { font-family: 'Syne', sans-serif; }
        .grad-text { background: linear-gradient(135deg,#4f8ef7,#7c5cfc); -webkit-background-clip:text; -webkit-text-fill-color:transparent; }
        .progress-fill { width: 72%; background: linear-gradient(90deg,#4f8ef7,#7c5cfc); border-radius:4px; height:100%; }
        @keyframes fillBar { from{width:0} to{width:72%} }
        .animate-fill { animation: fillBar 1.2s cubic-bezier(.4,0,.2,1) forwards; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        .fade-up { animation: fadeUp .4s ease forwards; }
        .fade-up-1 { animation: fadeUp .4s .05s ease both; }
        .fade-up-2 { animation: fadeUp .4s .12s ease both; }
        .fade-up-3 { animation: fadeUp .4s .2s ease both; }
        .fade-up-4 { animation: fadeUp .4s .28s ease both; }
        .fade-up-5 { animation: fadeUp .4s .36s ease both; }
        .cover-pattern { background: linear-gradient(135deg,#1a2a4a,#2a1a4a,#1a3a2a); }
        .cover-pattern::before { content:''; position:absolute; inset:0; background:repeating-linear-gradient(45deg,transparent,transparent 10px,rgba(255,255,255,.02) 10px,rgba(255,255,255,.02) 11px); }
      `}</style>

      {/* ── NAVBAR ── */}
      <UserNavbar currentPage="Home" />

      {/* ── 3-COLUMN LAYOUT ── */}
      <div className="max-w-6xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-[250px_1fr_272px] gap-5 items-start">

        {/* ────────── LEFT SIDEBAR ────────── */}
        <aside className="lg:sticky lg:top-20 flex flex-col gap-3">

          {/* Profile Card */}
          <div className="fade-up-1 bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden hover:border-blue-500/30 transition-colors">
            <div className="cover-pattern relative h-16" />
            <div className="px-4 pb-4">
              <div className="relative w-fit -mt-6 mb-2">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center font-extrabold text-lg border-[3px] border-gray-900 syne">
                  {user?.name?.charAt(0) || "A"}
                </div>
                <span className="absolute bottom-0.5 right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-gray-900" />
              </div>
              <p className="syne font-bold text-sm text-gray-100">{user?.name || "User"}</p>
              <p className="text-gray-500 text-xs mt-0.5 leading-snug">{user?.title || "Job Seeker"}</p>

              {/* Stats */}
              <div className="grid grid-cols-1 gap-2 mt-3">
                {[[appliedJobs.size, "Applied"]].map(([n, l]) => (
                  <div key={l} className="bg-gray-800/60 rounded-xl p-2.5 text-center border border-gray-700 hover:border-blue-500/40 hover:bg-blue-500/5 transition-all cursor-pointer">
                    <p className="syne font-bold text-lg text-blue-400">{n}</p>
                    <p className="text-gray-500 text-[10px] mt-0.5">{l}</p>
                  </div>
                ))}
              </div>

              {/* Profile completion */}
              <div className="mt-3">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-[10px] text-gray-500">Profile Strength</span>
                  <span className="text-[10px] text-blue-400 font-semibold">60%</span>
                </div>
                <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                  <div style={{ width: "60%" }} className="bg-gradient-to-r from-blue-600 to-violet-600 h-full rounded-full" />
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Nav */}
          <div className="fade-up-2 bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden hover:border-blue-500/30 transition-colors">
            <div className="p-2">
              {sideNavItems.map(item => (
                <button key={item.label}
                  onClick={() => {
                    if (item.label === "Job Listings") navigate('/jobs');
                    if (item.label === "My Applications") navigate('/applications');
                    if (item.label === "Posts") navigate('/posts');
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left ${activeNav === item.label ? "bg-blue-500/10 text-blue-400" : "text-gray-400 hover:bg-gray-800 hover:text-gray-100"}`}
                >
                  <item.icon cls="w-4 h-4 flex-shrink-0" />
                  <span className="flex-1">{item.label}</span>
                  {item.badge && (
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${item.badge === "New" ? "bg-blue-500 text-white" : "bg-blue-500/20 text-blue-400"}`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* ────────── MAIN FEED ────────── */}
        <main className="flex flex-col gap-4 min-w-0">

          {/* Alert Banner */}
          {showAlert && (
            <div className="fade-up bg-gradient-to-r from-blue-500/10 to-violet-500/10 border border-blue-500/20 rounded-2xl px-4 py-3 flex items-center gap-3">
              <InfoIcon />
              <p className="text-sm text-gray-400 flex-1">
                <span className="text-gray-100 font-semibold">New opportunities</span> added this week. Complete your profile to get better matches.
              </p>
              <button onClick={() => setShowAlert(false)} className="text-gray-600 hover:text-gray-300 transition-colors">
                <XIcon />
              </button>
            </div>
          )}

          {/* Post Box */}
          <div className="fade-up-1 bg-gray-900 border border-gray-800 rounded-2xl p-4 hover:border-blue-500/30 transition-colors">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center font-bold text-sm flex-shrink-0">{user?.name?.charAt(0) || "A"}</div>
              <div className="flex-1 bg-gray-800 rounded-2xl px-4 py-2.5 text-sm text-gray-500 cursor-pointer hover:bg-gray-700/70 hover:border-blue-500/40 border border-gray-700 transition-all">
                Share an update, achievement, or opportunity...
              </div>
            </div>
            <div className="flex items-center gap-1 border-t border-gray-800 pt-3">
              {[["Photo", ImageIcon], ["Video", VideoIcon], ["Article", ArticleIcon]].map(([label, Icon]) => (
                <button key={label} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-gray-500 hover:text-gray-200 hover:bg-gray-800 transition-all">
                  <Icon />{label}
                </button>
              ))}
            </div>
          </div>

          {/* Feed Tabs + Cards */}
          <div className="fade-up-2 bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden hover:border-blue-500/30 transition-colors">
            {/* Tabs */}
            <div className="flex gap-2 px-4 py-3 border-b border-gray-800">
              {TABS.map(tab => (
                <button key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${activeTab === tab ? "bg-blue-500/15 text-blue-400 border border-blue-500/30" : "text-gray-500 hover:text-gray-200 border border-transparent hover:border-gray-700"}`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Feed items */}
            {loading ? (
              <div className="p-8 text-center">
                <div className="inline-block w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-gray-400 text-sm mt-2">Loading jobs...</p>
              </div>
            ) : error ? (
              <div className="p-8 text-center">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            ) : filteredFeed.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-gray-400 text-sm">No jobs available at the moment.</p>
              </div>
            ) : (
              filteredFeed.map(item => (
                <FeedCard 
                  key={item.id} 
                  item={item} 
                  isApplied={appliedJobs.has(item.jobId)}
                  onApply={handleApplyClick}
                />
              ))
            )}
          </div>
        </main>

        {/* ────────── RIGHT SIDEBAR ────────── */}
        <aside className="hidden lg:flex flex-col gap-3 sticky top-20">

          {/* Jobs for You */}
          <div className="fade-up-2 bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden hover:border-blue-500/30 transition-colors">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
              <h3 className="syne font-bold text-sm text-gray-100">Jobs for You</h3>
              <button onClick={() => navigate('/jobs')} className="text-xs text-blue-400 font-semibold hover:underline">See all →</button>
            </div>
            {loading ? (
              <div className="p-4 text-center">
                <div className="inline-block w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : jobs.slice(0, 4).map((job, i) => {
              const grad = ["from-blue-900 to-blue-600", "from-purple-900 to-fuchsia-600", "from-emerald-900 to-emerald-500", "from-orange-900 to-orange-500"][i % 4];
              const letter = (job.recruiter?.company_name || "J")[0].toUpperCase();
              return (
                <div key={job.id} className="flex items-center gap-2.5 px-4 py-3 border-b border-gray-800 last:border-0 hover:bg-gray-800/50 transition-colors cursor-pointer">
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${grad} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                    {letter}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-200 truncate">{job.title}</p>
                    <p className="text-xs text-gray-500">{job.recruiter?.company_name || "Recruiter"} · ₹{(job.salary_min / 100000).toFixed(1)}L</p>
                  </div>
                  <button
                    onClick={() => toggleSave(job.id)}
                    className={`flex-shrink-0 transition-colors ${savedJobs[job.id] ? "text-blue-400" : "text-gray-600 hover:text-blue-400"}`}
                  >
                    <BookmarkIcon />
                  </button>
                </div>
              );
            })}
          </div>

          {/* People/Recruiters You May Know */}
          {recommendedPeople.length > 0 && (
            <div className="fade-up-3 bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden hover:border-blue-500/30 transition-colors">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
                <h3 className="syne font-bold text-sm text-gray-100">Recruiters to Follow</h3>
                <button onClick={() => navigate('/jobs')} className="text-xs text-blue-400 font-semibold hover:underline">See all →</button>
              </div>
              {recommendedPeople.map(p => (
                <div key={p.id} className="flex items-center gap-2.5 px-4 py-3 border-b border-gray-800 last:border-0 hover:bg-gray-800/50 transition-colors">
                  <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${p.grad} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                    {p.av}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-200 truncate">{p.name}</p>
                    <p className="text-xs text-gray-500 truncate">{p.title}</p>
                  </div>
                  <button className="flex-shrink-0 text-xs font-semibold text-blue-400 border border-blue-500/30 px-2.5 py-1 rounded-full hover:bg-blue-500/10 transition-colors">
                    + Follow
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Trending Skills */}
          {trendingTags.length > 0 && (
            <div className="fade-up-4 bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden hover:border-blue-500/30 transition-colors">
              <div className="px-4 py-3 border-b border-gray-800">
                <h3 className="syne font-bold text-sm text-gray-100">Trending Jobs</h3>
              </div>
              {trendingTags.map((t, i) => (
                <div key={i} className="px-4 py-2.5 border-b border-gray-800 last:border-0 hover:bg-gray-800/50 transition-colors cursor-pointer">
                  <p className="text-xs font-bold text-blue-400">{t.tag}</p>
                  <p className="text-xs text-gray-600 mt-0.5">{t.count}</p>
                </div>
              ))}
            </div>
          )}

        </aside>
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
