import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../../redux/authSlice";
import { authAPI } from "../../api/authAPI";
import jobAPI from "../../api/jobAPI";

// ── Global Styles ─────────────────────────────────────────────────────────────
const GlobalStyle = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500;600&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: #020817; }
    .syne { font-family: 'Syne', sans-serif; }
    .grad { background: linear-gradient(135deg,#38bdf8,#818cf8); -webkit-background-clip:text; -webkit-text-fill-color:transparent; }
    .btn-grad { background: linear-gradient(135deg,#0ea5e9,#6366f1); }
    .btn-grad:hover { background: linear-gradient(135deg,#38bdf8,#818cf8); }
    @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
    .fu  { animation:fadeUp .45s ease forwards; }
    .fu1 { animation:fadeUp .45s .07s ease both; }
    .fu2 { animation:fadeUp .45s .14s ease both; }
    .fu3 { animation:fadeUp .45s .21s ease both; }
    @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
    .pulse { animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
    ::-webkit-scrollbar { width:4px; }
    ::-webkit-scrollbar-thumb { background:#1e293b; border-radius:4px; }
    @media (max-width: 767px) { #sidebar { transform: translateX(-100%); } #sidebar.open { transform: translateX(0); } #mobile-menu-btn { display: flex !important; } #overlay { display: block; } }
    @media (min-width: 768px) { #sidebar { transform: translateX(0) !important; } #mobile-menu-btn { display: none !important; } #overlay { display: none !important; } }
  `}</style>
);

// ── Icons ─────────────────────────────────────────────────────────────────────
const SearchIcon  = () => <svg style={{width:16,height:16}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>;
const BellIcon    = () => <svg style={{width:20,height:20}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>;
const GridIcon    = () => <svg style={{width:18,height:18}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg>;
const BriefIcon   = () => <svg style={{width:18,height:18}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>;
const UsersIcon   = () => <svg style={{width:18,height:18}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
const MsgIcon     = () => <svg style={{width:18,height:18}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>;
const ChartIcon   = () => <svg style={{width:18,height:18}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>;
const SettIcon    = () => <svg style={{width:18,height:18}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/></svg>;
const MenuIcon    = () => <svg style={{width:20,height:20}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>;
const DownloadIcon = () => <svg style={{width:16,height:16}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>;
const TrendUpIcon = () => <svg style={{width:16,height:16}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 17"/><polyline points="17 6 23 6 23 12"/></svg>;
const TrendDownIcon = () => <svg style={{width:16,height:16}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 18 13.5 8.5 8.5 13.5 1 7"/><polyline points="17 18 23 18 23 12"/></svg>;

const Logo = () => (
  <div style={{ display:"flex", alignItems:"center" }}>
    <span className="syne" style={{ fontWeight:800, fontSize:"1.2rem", background:"linear-gradient(135deg,#38bdf8,#818cf8)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>NexWork</span>
    <span style={{ marginLeft:"6px", fontSize:"10px", fontWeight:700, color:"#38bdf8", background:"rgba(56,189,248,0.1)", border:"1px solid rgba(56,189,248,0.2)", padding:"2px 6px", borderRadius:"9999px" }}>Recruiter</span>
  </div>
);

// ── Side Nav Items ────────────────────────────────────────────────────────────
const NAV = [
  { label:"Dashboard",    Icon:GridIcon,  badge:null },
  { label:"Job Listings", Icon:BriefIcon, badge:"12" },
  { label:"Applicants",   Icon:UsersIcon, badge:"47" },
  { label:"Messages",     Icon:MsgIcon,   badge:"3" },
  { label:"Analytics",    Icon:ChartIcon, badge:null, active: true },
  { label:"Settings",     Icon:SettIcon,  badge:null },
];

// ── Sample Chart Component (Simple Bar Chart) ────────────────────────────────
function SimpleBarChart({ data, label, maxValue }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 160, justifyContent: "space-around" }}>
      {data.map((item, idx) => {
        const percentage = (item.value / maxValue) * 100;
        return (
          <div key={idx} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, flex: 1 }}>
            <div style={{
              width: "100%",
              height: `${percentage}%`,
              minHeight: 20,
              background: "linear-gradient(180deg,#0ea5e9,#6366f1)",
              borderRadius: "6px 6px 0 0",
              cursor: "pointer",
              transition: "all .2s",
            }} onMouseEnter={e => { e.currentTarget.style.background = "linear-gradient(180deg,#38bdf8,#818cf8)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "linear-gradient(180deg,#0ea5e9,#6366f1)"; }}/>
            <span style={{ fontSize: "11px", color: "#64748b", textAlign: "center" }}>{item.name}</span>
            <span style={{ fontSize: "12px", fontWeight: 600, color: "#cbd5e1" }}>{item.value}</span>
          </div>
        );
      })}
    </div>
  );
}

// ── Simple Line Chart Component ────────────────────────────────────────────────
function SimpleLineChart({ data }) {
  const maxValue = Math.max(...data.map(d => d.value));
  const points = data.map((d, idx) => {
    const x = (idx / (data.length - 1)) * 100;
    const y = 100 - (d.value / maxValue) * 100;
    return `${x},${y}`;
  }).join(" ");

  return (
    <svg style={{ width: "100%", height: 120 }} viewBox="0 0 100 100">
      <polyline points={points} fill="none" stroke="url(#grad1)" strokeWidth="2" vectorEffect="non-scaling-stroke" />
      <defs>
        <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#0ea5e9" />
          <stop offset="100%" stopColor="#6366f1" />
        </linearGradient>
      </defs>
      {data.map((d, idx) => {
        const x = (idx / (data.length - 1)) * 100;
        const y = 100 - (d.value / maxValue) * 100;
        return <circle key={idx} cx={x} cy={y} r="1.5" fill="#0ea5e9" />;
      })}
    </svg>
  );
}

// ── KPI Card ──────────────────────────────────────────────────────────────────
function KPICard({ icon, label, value, delta, color }) {
  const isPositive = delta >= 0;
  return (
    <div className="fu" style={{
      background: "rgba(15,23,42,0.6)",
      border: "1px solid #1e293b",
      borderRadius: 16,
      padding: "16px",
      display: "flex",
      alignItems: "flex-start",
      gap: 12,
    }}>
      <div style={{
        width: 48,
        height: 48,
        borderRadius: 12,
        background: `${color}1a`,
        border: `1px solid ${color}33`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 20,
        flexShrink: 0,
      }}>
        {icon}
      </div>
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: "11px", color: "#64748b", textTransform: "uppercase", fontWeight: 700, marginBottom: 4 }}>{label}</p>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
          <p className="syne" style={{ fontSize: "24px", fontWeight: 800, color: "#e2e8f0" }}>{value}</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          {isPositive ? <TrendUpIcon /> : <TrendDownIcon />}
          <span style={{ fontSize: "11px", color: isPositive ? "#34d399" : "#f87171", fontWeight: 600 }}>
            {isPositive ? "+" : ""}{delta}% vs last month
          </span>
        </div>
      </div>
    </div>
  );
}

// ── Chart Card ────────────────────────────────────────────────────────────────
function ChartCard({ title, children, subtitle }) {
  return (
    <div className="fu1" style={{
      background: "rgba(15,23,42,0.6)",
      border: "1px solid #1e293b",
      borderRadius: 16,
      padding: "20px",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div>
          <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#e2e8f0", marginBottom: 2 }}>{title}</h3>
          {subtitle && <p style={{ fontSize: "11px", color: "#64748b" }}>{subtitle}</p>}
        </div>
        <button style={{
          padding: "6px 12px",
          borderRadius: 8,
          background: "rgba(255,255,255,0.05)",
          border: "1px solid #1e293b",
          color: "#64748b",
          fontSize: "11px",
          fontWeight: 600,
          cursor: "pointer",
          transition: "all .2s",
        }} onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.1)"; e.currentTarget.style.color = "#cbd5e1"; }} onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.color = "#64748b"; }}>
          <DownloadIcon /> Export
        </button>
      </div>
      {children}
    </div>
  );
}

// ── Conversion Funnel ─────────────────────────────────────────────────────────
function ConversionFunnel({ data }) {
  const maxValue = Math.max(...data.map(d => d.value));
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {data.map((item, idx) => {
        const percentage = (item.value / maxValue) * 100;
        const prevValue = idx > 0 ? data[idx - 1].value : item.value;
        const conversionRate = idx > 0 ? Math.round((item.value / prevValue) * 100) : 100;

        return (
          <div key={idx}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ fontSize: "13px", fontWeight: 600, color: "#cbd5e1" }}>{item.label}</span>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <span style={{ fontSize: "12px", fontWeight: 700, color: "#38bdf8" }}>{item.value}</span>
                {idx > 0 && <span style={{ fontSize: "11px", color: "#64748b" }}>({conversionRate}%)</span>}
              </div>
            </div>
            <div style={{
              width: `${percentage}%`,
              height: 24,
              background: "linear-gradient(90deg,#0ea5e9,#6366f1)",
              borderRadius: 6,
            }} />
          </div>
        );
      })}
    </div>
  );
}

// ── Main Analytics Component ────────────────────────────────────────────────────
export default function AnalyticsPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { recruiter } = useSelector((state) => state.auth);

  const [sideOpen, setSideOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState("30days");
  const [jobs, setJobs] = useState([]);
  const [applicants, setApplicants] = useState([]);

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const jobsRes = await jobAPI.getMyJobs(1, 100);
        const allJobs = jobsRes.jobs || [];
        setJobs(allJobs);

        let allApplicants = [];
        for (const job of allJobs) {
          try {
            const appRes = await jobAPI.getJobApplicants(job.id);
            allApplicants = [...allApplicants, ...(appRes.applications || [])];
          } catch (err) {
            console.error(`Failed to fetch applicants for job ${job.id}:`, err);
          }
        }
        setApplicants(allApplicants);
      } catch (err) {
        console.error("Failed to fetch analytics data:", err);
      } finally {
        setLoading(false);
      }
    };

    if (recruiter) fetchData();
  }, [recruiter]);

  const handleLogout = async () => {
    try {
      await authAPI.recruiterLogout();
      localStorage.removeItem("token");
      dispatch(logout());
      navigate("/recruiter/login");
    } catch (err) {
      localStorage.removeItem("token");
      dispatch(logout());
      navigate("/recruiter/login");
    }
  };

  // Calculate stats
  const stats = {
    totalApplicants: applicants.length,
    totalApplications: applicants.length,
    activeJobs: jobs.filter(j => j.status === "active").length,
    avgTimeToHire: 14,
    conversionRate: applicants.length > 0 ? Math.round((applicants.filter(a => a.status === "hired").length / applicants.length) * 100) : 0,
  };

  // Application status breakdown
  const statusBreakdown = applicants.reduce((acc, app) => {
    const status = app.status || "applied";
    const existing = acc.find(s => s.label === status);
    if (existing) existing.value++;
    else acc.push({ label: status, value: 1 });
    return acc;
  }, []);

  // Chart data
  const applicationsTimeline = [
    { name: "Week 1", value: 23 },
    { name: "Week 2", value: 31 },
    { name: "Week 3", value: 28 },
    { name: "Week 4", value: 45 },
  ];

  const jobPerformance = jobs.slice(0, 5).map(job => ({
    name: job.title.substring(0, 12),
    value: applicants.filter(a => a.job_id === job.id).length,
  }));

  const funnelData = [
    { label: "Total Applications", value: applicants.length },
    { label: "Screened", value: Math.round(applicants.length * 0.7) },
    { label: "Interview", value: Math.round(applicants.length * 0.35) },
    { label: "Offer", value: Math.round(applicants.length * 0.15) },
    { label: "Hired", value: Math.round(applicants.length * 0.1) },
  ];

  return (
    <>
      <GlobalStyle />
      <div style={{ minHeight: "100vh", display: "flex", fontFamily: "'DM Sans',sans-serif", background: "#020817", position: "relative" }}>

        {/* Mobile overlay */}
        <div id="overlay" onClick={() => setSideOpen(false)} style={{ display: "none", position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 40, backdropFilter: "blur(2px)" }} />

        {/* ══ SIDEBAR ══════════════════════════════════════════════════ */}
        <aside id="sidebar" style={{
          width: "224px", flexShrink: 0, display: "flex", flexDirection: "column",
          background: "rgba(15,23,42,0.95)", borderRight: "1px solid #1e293b",
          position: "fixed", top: 0, left: 0, height: "100vh",
          zIndex: 50, transition: "transform .3s ease", backdropFilter: "blur(20px)",
        }} className={sideOpen ? "open" : ""}>
          <div style={{ padding: "20px", borderBottom: "1px solid #1e293b" }}><Logo /></div>
          <nav style={{ flex: 1, padding: "12px", display: "flex", flexDirection: "column", gap: "4px", overflowY: "auto" }}>
            {NAV.map(({ label, Icon, badge, active }) => (
              <button key={label} onClick={() => {
                setSideOpen(false);
                if (label === "Dashboard") navigate("/recruiter/home");
                else if (label === "Job Listings") navigate("/recruiter/jobs");
                else if (label === "Applicants") navigate("/recruiter/applicants");
              }}
                style={{
                  display: "flex", alignItems: "center", gap: "10px", padding: "10px 12px", borderRadius: "12px",
                  fontSize: "14px", fontWeight: 500,
                  border: active ? "1px solid rgba(56,189,248,0.2)" : "1px solid transparent",
                  background: active ? "rgba(56,189,248,0.08)" : "transparent",
                  color: active ? "#38bdf8" : "#64748b", cursor: "pointer", textAlign: "left", width: "100%",
                  transition: "all .2s", fontFamily: "'DM Sans',sans-serif",
                }} onMouseEnter={e => { if (!active) { e.currentTarget.style.color = "#e2e8f0"; e.currentTarget.style.background = "rgba(255,255,255,0.04)"; } }} onMouseLeave={e => { if (!active) { e.currentTarget.style.color = "#64748b"; e.currentTarget.style.background = "transparent"; } }}>
                <Icon />
                <span style={{ flex: 1 }}>{label}</span>
                {badge && <span style={{ fontSize: "10px", fontWeight: 700, padding: "1px 6px", borderRadius: "9999px", background: active ? "#0ea5e9" : "#1e293b", color: active ? "#fff" : "#64748b" }}>{badge}</span>}
              </button>
            ))}
          </nav>
          <div style={{ padding: "12px", borderTop: "1px solid #1e293b" }}>
            <button onClick={handleLogout} style={{
              width: "100%", display: "flex", alignItems: "center", gap: "10px", padding: "8px 10px",
              borderRadius: "12px", background: "transparent", border: "none", cursor: "pointer", transition: "background .2s",
            }} onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.04)"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
              <div style={{
                width: 32, height: 32, borderRadius: "9999px",
                background: "linear-gradient(135deg,#0ea5e9,#6366f1)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "12px", fontWeight: 700, color: "#fff", flexShrink: 0,
              }} className="syne">{recruiter?.name?.charAt(0) || "J"}</div>
              <div style={{ flex: 1, minWidth: 0, textAlign: "left" }}>
                <p style={{ fontSize: "14px", fontWeight: 600, color: "#e2e8f0" }}>{recruiter?.name || "Recruiter"}</p>
                <p style={{ fontSize: "11px", color: "#475569" }}>Click to logout</p>
              </div>
            </button>
          </div>
        </aside>

        {/* ══ MAIN CONTENT ════════════════════════════════════════════ */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, marginLeft: "224px" }} id="main-content">

          {/* Header */}
          <header style={{
            position: "sticky", top: 0, zIndex: 30, height: "56px",
            display: "flex", alignItems: "center", gap: "16px", padding: "0 24px",
            background: "rgba(2,8,23,0.9)", backdropFilter: "blur(20px)", borderBottom: "1px solid #1e293b", flexShrink: 0,
          }}>
            <button id="mobile-menu-btn" onClick={() => setSideOpen(!sideOpen)} style={{
              display: "none", alignItems: "center", justifyContent: "center", width: 36, height: 36, borderRadius: "10px",
              background: "rgba(255,255,255,0.04)", border: "1px solid #1e293b", color: "#94a3b8", cursor: "pointer", flexShrink: 0,
            }}>
              <MenuIcon />
            </button>
            <div style={{ flexShrink: 0 }}>
              <p style={{ fontSize: "11px", color: "#475569" }}>📊 Performance Insights</p>
              <h1 className="syne" style={{ fontSize: "15px", fontWeight: 700, color: "#fff" }}>Analytics Dashboard</h1>
            </div>
            <div style={{
              display: "flex", alignItems: "center", gap: "8px", background: "rgba(255,255,255,0.04)",
              border: "1px solid #1e293b", borderRadius: "12px", padding: "0 12px", height: "36px",
              width: "240px", marginLeft: "16px", flexShrink: 0,
            }}>
              <SearchIcon />
              <input style={{
                background: "transparent", outline: "none", fontSize: "13px", color: "#cbd5e1",
                width: "100%", fontFamily: "'DM Sans',sans-serif",
              }} placeholder="Search..." />
            </div>
            <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "12px" }}>
              <select value={dateRange} onChange={(e) => setDateRange(e.target.value)} style={{
                padding: "6px 10px", borderRadius: "8px", background: "rgba(255,255,255,0.05)",
                border: "1px solid #1e293b", color: "#cbd5e1", fontSize: "12px", fontFamily: "'DM Sans',sans-serif",
                cursor: "pointer",
              }}>
                <option value="7days">Last 7 days</option>
                <option value="30days">Last 30 days</option>
                <option value="90days">Last 90 days</option>
                <option value="6months">Last 6 months</option>
                <option value="1year">Last 1 year</option>
              </select>
              <button style={{
                position: "relative", width: 36, height: 36, borderRadius: "10px",
                background: "rgba(255,255,255,0.04)", border: "1px solid #1e293b",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#94a3b8", cursor: "pointer",
              }}>
                <BellIcon />
                <span style={{ position: "absolute", top: "7px", right: "7px", width: "6px", height: "6px", background: "#38bdf8", borderRadius: "9999px" }} />
              </button>
            </div>
          </header>

          {/* Content */}
          <main style={{ flex: 1, overflowY: "auto", padding: "24px" }}>
            {loading ? (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "400px", color: "#64748b" }}>
                <div className="pulse" style={{ fontSize: "32px" }}>⏳ Loading analytics...</div>
              </div>
            ) : (
              <>
                {/* KPI Row 1 */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, marginBottom: 24 }}>
                  <KPICard icon="📊" label="Total Applicants" value={stats.totalApplicants} delta={12} color="#0ea5e9" />
                  <KPICard icon="💼" label="Active Jobs" value={stats.activeJobs} delta={5} color="#8b5cf6" />
                  <KPICard icon="⏱️" label="Avg Time to Hire" value={`${stats.avgTimeToHire}d`} delta={-3} color="#10b981" />
                  <KPICard icon="✅" label="Conversion Rate" value={`${stats.conversionRate}%`} delta={8} color="#f97316" />
                </div>

                {/* Charts Row 1 */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16, marginBottom: 24 }}>
                  <ChartCard title="Applications Over Time" subtitle="Last 4 weeks">
                    <SimpleBarChart data={applicationsTimeline} label="Applications" maxValue={Math.max(...applicationsTimeline.map(d => d.value))} />
                  </ChartCard>

                  <ChartCard title="Job Performance" subtitle="Top performing jobs">
                    <SimpleBarChart data={jobPerformance.length > 0 ? jobPerformance : [{ name: "No Jobs", value: 0 }]} label="Applicants" maxValue={Math.max(...(jobPerformance.length > 0 ? jobPerformance : [{ value: 1 }]).map(d => d.value), 1)} />
                  </ChartCard>
                </div>

                {/* Charts Row 2 */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16, marginBottom: 24 }}>
                  <ChartCard title="Application Status Breakdown" subtitle="Current application states">
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
                      {statusBreakdown.map((item, idx) => (
                        <div key={idx} style={{
                          display: "flex", alignItems: "center", gap: 8,
                          background: "rgba(255,255,255,0.03)", padding: "8px 12px", borderRadius: 8,
                        }}>
                          <div style={{
                            width: 8, height: 8, borderRadius: "50%",
                            background: ["#0ea5e9", "#8b5cf6", "#10b981", "#f97316"][idx % 4],
                          }} />
                          <span style={{ fontSize: "12px", color: "#cbd5e1", fontWeight: 600 }}>
                            {item.label}: <span style={{ color: "#38bdf8", fontWeight: 700 }}>{item.value}</span>
                          </span>
                        </div>
                      ))}
                    </div>
                  </ChartCard>

                  <ChartCard title="Hiring Funnel" subtitle="Conversion at each stage">
                    <ConversionFunnel data={funnelData} />
                  </ChartCard>
                </div>

                {/* Detailed Stats Tables */}
                <div className="fu2" style={{ background: "rgba(15,23,42,0.6)", border: "1px solid #1e293b", borderRadius: 16, padding: "20px", marginBottom: 24 }}>
                  <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#e2e8f0", marginBottom: 16 }}>Top Recruiting Sources</h3>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
                    {[
                      { source: "LinkedIn", count: 145, conversion: "8.4%" },
                      { source: "Indeed", count: 89, conversion: "6.2%" },
                      { source: "Referrals", count: 52, conversion: "15.1%" },
                      { source: "Campus Drives", count: 112, conversion: "9.8%" },
                    ].map((item, idx) => (
                      <div key={idx} style={{
                        padding: "12px", background: "rgba(255,255,255,0.03)",
                        border: "1px solid #1e293b", borderRadius: 10,
                      }}>
                        <p style={{ fontSize: "12px", color: "#64748b", marginBottom: 4 }}>{item.source}</p>
                        <p style={{ fontSize: "16px", fontWeight: 700, color: "#38bdf8", marginBottom: 6 }}>{item.count}</p>
                        <p style={{ fontSize: "11px", color: "#10b981" }}>📈 {item.conversion} conversion</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Export Section */}
                <div className="fu3" style={{ background: "rgba(15,23,42,0.6)", border: "1px solid #1e293b", borderRadius: 16, padding: "20px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#e2e8f0", marginBottom: 2 }}>Export Analytics Report</h3>
                      <p style={{ fontSize: "12px", color: "#64748b" }}>Download comprehensive analytics in PDF or CSV format</p>
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button style={{
                        padding: "8px 16px", borderRadius: 8, background: "rgba(255,255,255,0.05)",
                        border: "1px solid #1e293b", color: "#cbd5e1", fontSize: "12px", fontWeight: 600,
                        cursor: "pointer", transition: "all .2s", display: "flex", alignItems: "center", gap: 6,
                      }} onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.1)"; e.currentTarget.style.color = "#e2e8f0"; }} onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.color = "#cbd5e1"; }}>
                        <DownloadIcon /> CSV
                      </button>
                      <button style={{
                        padding: "8px 16px", borderRadius: 8, background: "linear-gradient(135deg,#0ea5e9,#6366f1)",
                        border: "none", color: "#fff", fontSize: "12px", fontWeight: 600, cursor: "pointer",
                        display: "flex", alignItems: "center", gap: 6, transition: "all .2s",
                      }} onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"} onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}>
                        <DownloadIcon /> PDF
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </main>
        </div>
      </div>
    </>
  );
}
