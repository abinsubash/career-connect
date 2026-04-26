import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { userLogout } from "../redux/userAuthSlice";
import { authAPI } from "../api/authAPI";

// ── Icons ──────────────────────────────────────────────────────────────────────
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
const FileIcon = ({ cls }) => (
  <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14,2 14,8 20,8" />
  </svg>
);
const ImageIcon = ({ cls }) => (
  <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" />
  </svg>
);

const navItems = [
  { label: "Home", icon: HomeIcon, badge: 0 },
  { label: "Jobs", icon: BriefcaseIcon, badge: 0 },
  { label: "Posts", icon: ImageIcon, badge: 0 },
];

export default function UserNavbar({ currentPage = "Home" }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.userAuth);

  const handleLogout = async () => {
    try {
      await authAPI.logout();
    } catch (err) {
      console.error("Logout API failed:", err);
    }
    localStorage.removeItem("token");
    localStorage.removeItem("user_auth");
    dispatch(userLogout());
    navigate("/");
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-800 bg-gray-950/90 backdrop-blur-xl h-14 flex items-center px-4 md:px-6 gap-4">
      {/* Logo */}
      <h1 
        className="syne font-extrabold text-xl grad-text flex-shrink-0 tracking-tight cursor-pointer" 
        onClick={() => navigate('/home')}
        style={{ background: "linear-gradient(135deg,#4f8ef7,#7c5cfc)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}
      >
        NexWork
      </h1>

      {/* Search */}
      <div className="flex items-center gap-2 bg-gray-800/60 border border-gray-700 rounded-xl px-3 h-9 max-w-xs w-full hover:border-blue-500/50 transition-colors focus-within:border-blue-500">
        <SearchIcon />
        <input 
          className="bg-transparent outline-none text-sm text-gray-300 placeholder-gray-600 w-full" 
          placeholder="Search jobs, people, companies..." 
        />
      </div>

      {/* Nav links */}
      <div className="flex items-center gap-1 ml-auto">
        {navItems.map(n => (
          <button 
            key={n.label}
            onClick={() => {
              if (n.label === "Jobs") navigate('/jobs');
              if (n.label === "Home") navigate('/home');
              if (n.label === "Posts") navigate('/posts');
            }}
            className={`relative flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              currentPage === n.label 
                ? "text-blue-400" 
                : "text-gray-500 hover:text-gray-200 hover:bg-gray-800"
            }`}
          >
            <n.icon cls="w-5 h-5" />
            {n.badge > 0 && (
              <span className="absolute top-0.5 right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                {n.badge}
              </span>
            )}
            <span className="hidden md:block">{n.label}</span>
            {currentPage === n.label && <span className="absolute bottom-0 left-1/4 right-1/4 h-0.5 bg-blue-500 rounded-t-full" />}
          </button>
        ))}

        {/* Applications button */}
        <button 
          onClick={() => navigate('/applications')}
          className={`relative flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            currentPage === "Applications"
              ? "text-blue-400"
              : "text-gray-500 hover:text-gray-200 hover:bg-gray-800"
          }`}
        >
          <FileIcon cls="w-5 h-5" />
          <span className="hidden md:block">Applications</span>
          {currentPage === "Applications" && <span className="absolute bottom-0 left-1/4 right-1/4 h-0.5 bg-blue-500 rounded-t-full" />}
        </button>

        {/* User avatar dropdown */}
        <div className="relative group">
          <button className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center font-bold text-sm ml-2 border-2 border-gray-700 hover:border-blue-500 transition-colors cursor-pointer">
            {user?.name?.charAt(0) || "A"}
          </button>
          {/* Dropdown menu */}
          <div className="absolute right-0 mt-2 w-48 bg-gray-900 border border-gray-800 rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
            <button
              onClick={() => navigate('/profile')}
              className="w-full text-left px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-gray-800/50 transition-colors first:rounded-t-lg"
            >
              👤 View Profile
            </button>
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors rounded-b-lg border-t border-gray-800"
            >
              🚪 Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
