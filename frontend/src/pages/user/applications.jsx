import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { userLogout } from "../../redux/userAuthSlice";
import jobAPI from "../../api/jobAPI";
import UserNavbar from "../../components/UserNavbar";

// ── Icons ──────────────────────────────────────────────────────────────────
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

// ── Status Colors ─────────────────────────────────────────────────────────
const STATUS_COLORS = {
  applied: { text: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
  shortlisted: { text: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" },
  rejected: { text: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20" },
  hired: { text: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
  withdrawn: { text: "text-gray-400", bg: "bg-gray-500/10", border: "border-gray-500/20" },
};

// ── Side Nav Items ────────────────────────────────────────────────────────
const sideNavItems = [
  { label: "Home Feed", icon: HomeIcon, badge: null },
  { label: "Job Listings", icon: BriefcaseIcon, badge: "New" },
  { label: "Internships", icon: SchoolIcon, badge: null },
  { label: "My Applications", icon: FileIcon, badge: null, active: true },
  { label: "Saved Jobs", icon: BookmarkIcon, badge: null },
  { label: "Network", icon: NetworkIcon, badge: null },
];

const navItems = [
  { label: "Home", icon: HomeIcon, badge: 0 },
  { label: "Network", icon: NetworkIcon, badge: 0 },
  { label: "Jobs", icon: BriefcaseIcon, badge: 0 },
  { label: "Messages", icon: MessageIcon, badge: 3 },
  { label: "Alerts", icon: BellIcon, badge: 5 },
];

// ── Loading Skeleton ──────────────────────────────────────────────────────
function SkeletonRow() {
  return (
    <tr className="border-b border-gray-800">
      <td className="px-6 py-4"><div className="h-4 bg-gray-800 rounded w-40 animate-pulse" /></td>
      <td className="px-6 py-4"><div className="h-4 bg-gray-800 rounded w-32 animate-pulse" /></td>
      <td className="px-6 py-4"><div className="h-4 bg-gray-800 rounded w-24 animate-pulse" /></td>
      <td className="px-6 py-4"><div className="h-4 bg-gray-800 rounded w-28 animate-pulse" /></td>
      <td className="px-6 py-4"><div className="h-8 bg-gray-800 rounded w-20 animate-pulse" /></td>
    </tr>
  );
}

// ── Application Row ───────────────────────────────────────────────────────
function ApplicationRow({ app }) {
  const statusConfig = STATUS_COLORS[app.status] || STATUS_COLORS.applied;
  const appliedDate = new Date(app.applied_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <tr className="border-b border-gray-800 hover:bg-gray-900/40 transition-colors">
      <td className="px-6 py-4"><div className="font-semibold text-gray-100">{app.job?.title || 'N/A'}</div></td>
      <td className="px-6 py-4"><div className="text-sm text-gray-400">{app.job?.recruiter?.company_name || 'Company'}</div></td>
      <td className="px-6 py-4"><div className="text-sm text-gray-400">{app.job?.location || 'Location'}</div></td>
      <td className="px-6 py-4"><div className="text-xs text-gray-500">{appliedDate}</div></td>
      <td className="px-6 py-4">
        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusConfig.text} ${statusConfig.bg} ${statusConfig.border}`}>
          {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
        </span>
      </td>
    </tr>
  );
}

// ── Main Component ────────────────────────────────────────────────────────
export default function ApplicationsPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.userAuth);

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setLoading(true);
        const response = await jobAPI.getUserApplications();
        setApplications(response.applications || []);
      } catch (err) {
        console.error("Failed to fetch applications:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchApplications();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user_auth");
    dispatch(userLogout());
    navigate("/");
  };

  const stats = {
    total: applications.length,
    applied: applications.filter(a => a.status === "applied").length,
    shortlisted: applications.filter(a => a.status === "shortlisted").length,
    rejected: applications.filter(a => a.status === "rejected").length,
    hired: applications.filter(a => a.status === "hired").length,
    withdrawn: applications.filter(a => a.status === "withdrawn").length,
  };

  let filtered = applications;
  if (statusFilter !== "all") {
    filtered = filtered.filter(app => app.status === statusFilter);
  }
  if (searchQuery) {
    filtered = filtered.filter(app =>
      app.job?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.job?.recruiter?.company_name?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

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
      <UserNavbar currentPage="Applications" />

      {/* ── 3-COLUMN LAYOUT ── */}
      <div className="max-w-6xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-[250px_1fr_272px] gap-5">
        
        {/* LEFT SIDEBAR */}
        <aside className="lg:sticky lg:top-20 flex flex-col gap-3">
          <div className="fade-up-1 bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
            <div className="relative h-16 bg-gradient-to-r from-blue-900/20 to-violet-900/20" />
            <div className="px-4 pb-4">
              <div className="relative w-fit -mt-6 mb-2">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center font-extrabold text-lg border-[3px] border-gray-900 syne">
                  {user?.name?.charAt(0) || "U"}
                </div>
                <span className="absolute bottom-0.5 right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-gray-900" />
              </div>
              <p className="syne font-bold text-sm text-gray-100">{user?.name || "User"}</p>
              <p className="text-gray-500 text-xs mt-0.5">{user?.title || "Job Seeker"}</p>
              <div className="grid grid-cols-1 gap-2 mt-3">
                {[[stats.total, "Applied"]].map(([n, l]) => (
                  <div key={l} className="bg-gray-800/60 rounded-xl p-2.5 text-center border border-gray-700">
                    <p className="syne font-bold text-lg text-blue-400">{n}</p>
                    <p className="text-gray-500 text-[10px] mt-0.5">{l}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="fade-up-2 bg-gray-900 border border-gray-800 rounded-2xl p-2">
            {sideNavItems.map(item => (
              <button key={item.label} onClick={() => { if (item.label === "Job Listings") navigate('/jobs'); if (item.label === "Home Feed") navigate('/home'); }} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-left transition-all ${item.active ? "bg-blue-500/10 text-blue-400" : "text-gray-400 hover:bg-gray-800"}`}>
                <item.icon cls="w-4 h-4 flex-shrink-0" />
                <span className="flex-1">{item.label}</span>
                {item.badge && <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${item.badge === "New" ? "bg-blue-500 text-white" : ""}`}>{item.badge}</span>}
              </button>
            ))}
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <main className="flex flex-col gap-4">
          <div className="fade-up">
            <h1 className="syne font-extrabold text-3xl md:text-4xl mb-2">My Applications</h1>
            <p className="text-gray-400">Track your job applications and their status</p>
          </div>

          <div className="fade-up-1 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { label: "Total", count: stats.total, filter: "all" },
              { label: "Applied", count: stats.applied, filter: "applied" },
              { label: "Shortlisted", count: stats.shortlisted, filter: "shortlisted" },
              { label: "Hired", count: stats.hired, filter: "hired" },
              { label: "Rejected", count: stats.rejected, filter: "rejected" },
              { label: "Withdrawn", count: stats.withdrawn, filter: "withdrawn" },
            ].map(({ label, count, filter }) => (
              <button key={label} onClick={() => setStatusFilter(filter)} className={`p-4 rounded-xl border transition-all ${statusFilter === filter ? "border-blue-500/50 bg-blue-500/10" : "border-gray-800 bg-gray-900/40"}`}>
                <div className={`text-xl font-bold ${statusFilter === filter ? "text-blue-400" : "text-gray-300"} mb-1`}>{count}</div>
                <div className="text-xs text-gray-400">{label}</div>
              </button>
            ))}
          </div>

          <div className="fade-up-1 flex items-center gap-3 bg-gray-900/60 border border-gray-800 rounded-xl px-4 py-2.5">
            <SearchIcon />
            <input type="text" placeholder="Search by job title or company..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="bg-transparent outline-none text-sm text-gray-300 placeholder-gray-600 w-full" />
          </div>

          <div className="fade-up-2 border border-gray-800 rounded-xl overflow-hidden bg-gray-900/40">
            <table className="w-full">
              <thead className="border-b border-gray-800 bg-gray-900/60">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Job Title</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Company</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Location</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Applied Date</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? [...Array(5)].map((_, i) => <SkeletonRow key={i} />) : filtered.length === 0 ? (
                  <tr><td colSpan="5" className="px-6 py-12 text-center"><p className="text-gray-400">{searchQuery || statusFilter !== "all" ? "No applications match your filters" : "No applications yet"}</p></td></tr>
                ) : filtered.map(app => <ApplicationRow key={app.id} app={app} />)}
              </tbody>
            </table>
          </div>

          {!loading && filtered.length > 0 && <p className="text-sm text-gray-500">Showing {filtered.length} of {applications.length} applications</p>}
        </main>

        {/* RIGHT SIDEBAR */}
        <aside className="hidden lg:flex" />
      </div>
    </div>
  );
}