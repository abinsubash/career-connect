import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../redux/authSlice";
import { authAPI } from "../api/authAPI";

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
    .input-field { width:100%; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.1); border-radius:12px; padding:12px 16px; color:#f1f5f9; font-size:14px; outline:none; transition:all .2s; font-family:'DM Sans',sans-serif; }
    .input-field:focus { border-color:#38bdf8; background:rgba(56,189,248,0.05); box-shadow:0 0 0 3px rgba(56,189,248,0.1); }
    .input-field::placeholder { color:#475569; }
    select.input-field option { background:#0f172a; color:#f1f5f9; }
    textarea.input-field { resize: vertical; min-height: 90px; }
    @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
    .fu  { animation:fadeUp .45s ease forwards; }
    .fu1 { animation:fadeUp .45s .07s ease both; }
    .fu2 { animation:fadeUp .45s .14s ease both; }
    @keyframes spin { to { transform:rotate(360deg); } }
    @keyframes barGrow { from{transform:scaleY(0)} to{transform:scaleY(1)} }
    .bar-fill { animation:barGrow .8s ease forwards; transform-origin:bottom; }
    @keyframes modalIn { from{opacity:0;transform:scale(0.96) translateY(12px)} to{opacity:1;transform:scale(1) translateY(0)} }
    .modal-in { animation: modalIn .25s cubic-bezier(.4,0,.2,1) forwards; }
    @keyframes overlayIn { from{opacity:0} to{opacity:1} }
    .overlay-in { animation: overlayIn .2s ease forwards; }
    ::-webkit-scrollbar { width:4px; }
    ::-webkit-scrollbar-thumb { background:#1e293b; border-radius:4px; }

    @media (max-width: 767px) {
      #sidebar { transform: translateX(-100%); }
      #sidebar.open { transform: translateX(0); }
      #mobile-menu-btn { display: flex !important; }
      #overlay { display: block; }
    }
    @media (min-width: 768px) {
      #sidebar { transform: translateX(0) !important; }
      #mobile-menu-btn { display: none !important; }
      #overlay { display: none !important; }
    }
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
const PlusIcon    = () => <svg style={{width:16,height:16}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const MenuIcon    = () => <svg style={{width:20,height:20}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>;

const Logo = () => (
  <div style={{ display:"flex", alignItems:"center" }}>
    <span className="syne" style={{ fontWeight:800, fontSize:"1.2rem", background:"linear-gradient(135deg,#38bdf8,#818cf8)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>NexWork</span>
    <span style={{ marginLeft:"6px", fontSize:"10px", fontWeight:700, color:"#38bdf8", background:"rgba(56,189,248,0.1)", border:"1px solid rgba(56,189,248,0.2)", padding:"2px 6px", borderRadius:"9999px" }}>Recruiter</span>
  </div>
);

const NAV = [
  { label:"Dashboard",    Icon:GridIcon,  badge:null },
  { label:"Job Listings", Icon:BriefIcon, badge:"12" },
  { label:"Applicants",   Icon:UsersIcon, badge:"47" },
  { label:"Messages",     Icon:MsgIcon,   badge:"3" },
  { label:"Analytics",    Icon:ChartIcon, badge:null },
  { label:"Settings",     Icon:SettIcon,  badge:null },
];

export function RecruiterLayout({ children }) {
  const [nav, setNav] = useState("Dashboard");
  const [sideOpen, setSideOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { recruiter } = useSelector((state) => state.auth);

  // Sync nav state with current route on mount and when route changes
  useEffect(() => {
    const pathname = location.pathname;
    if (pathname.includes("/recruiter/home")) {
      setNav("Dashboard");
    } else if (pathname.includes("applicants")) {
      setNav("Applicants");
    } else if (pathname.includes("/recruiter/jobs") && !pathname.includes("/add")) {
      setNav("Job Listings");
    } else if (pathname.includes("messages")) {
      setNav("Messages");
    } else if (pathname.includes("analytics")) {
      setNav("Analytics");
    } else if (pathname.includes("settings")) {
      setNav("Settings");
    }
  }, [location.pathname]);

  const handleLogout = async () => {
    try {
      await authAPI.recruiterLogout();
      localStorage.removeItem("token");
      dispatch(logout());
      navigate("/recruiter/login");
    } catch (err) {
      console.error("Logout failed:", err);
      localStorage.removeItem("token");
      dispatch(logout());
      navigate("/recruiter/login");
    }
  };

  return (
    <>
      <GlobalStyle />

      <div style={{ minHeight:"100vh", display:"flex", fontFamily:"'DM Sans',sans-serif", background:"#020817", position:"relative" }}>
        {/* Mobile overlay */}
        <div
          id="overlay"
          onClick={() => setSideOpen(false)}
          style={{ display:"none", position:"fixed", inset:0, background:"rgba(0,0,0,0.6)", zIndex:40, backdropFilter:"blur(2px)" }}
        />

        {/* SIDEBAR */}
        <aside
          id="sidebar"
          style={{
            width:"224px", flexShrink:0,
            display:"flex", flexDirection:"column",
            background:"rgba(15,23,42,0.95)",
            borderRight:"1px solid #1e293b",
            position:"fixed", top:0, left:0, height:"100vh",
            zIndex:50, transition:"transform .3s ease",
            backdropFilter:"blur(20px)",
          }}
          className={sideOpen ? "open" : ""}
        >
          <div style={{ padding:"20px", borderBottom:"1px solid #1e293b" }}><Logo /></div>
          <nav style={{ flex:1, padding:"12px", display:"flex", flexDirection:"column", gap:"4px", overflowY:"auto" }}>
            {NAV.map(({ label, Icon, badge }) => {
              const active = nav === label;
              return (
                <button key={label} onClick={() => { 
                  setNav(label); 
                  setSideOpen(false);
                  if (label === "Job Listings") {
                    navigate("/recruiter/jobs");
                  } else if (label === "Dashboard") {
                    navigate("/recruiter/home");
                  } else if (label === "Applicants") {
                    navigate("/recruiter/applicants");
                  }
                }}
                  style={{ display:"flex", alignItems:"center", gap:"10px", padding:"10px 12px", borderRadius:"12px", fontSize:"14px", fontWeight:500, border: active ? "1px solid rgba(56,189,248,0.2)" : "1px solid transparent", background: active ? "rgba(56,189,248,0.08)" : "transparent", color: active ? "#38bdf8" : "#64748b", cursor:"pointer", textAlign:"left", width:"100%", transition:"all .2s", fontFamily:"'DM Sans',sans-serif" }}
                  onMouseEnter={e => { if (!active) { e.currentTarget.style.color="#e2e8f0"; e.currentTarget.style.background="rgba(255,255,255,0.04)"; } }}
                  onMouseLeave={e => { if (!active) { e.currentTarget.style.color="#64748b"; e.currentTarget.style.background="transparent"; } }}>
                  <Icon />
                  <span style={{ flex:1 }}>{label}</span>
                  {badge && <span style={{ fontSize:"10px", fontWeight:700, padding:"1px 6px", borderRadius:"9999px", background: active ? "#0ea5e9" : "#1e293b", color: active ? "#fff" : "#64748b" }}>{badge}</span>}
                </button>
              );
            })}
          </nav>
          <div style={{ padding:"12px", borderTop:"1px solid #1e293b" }}>
            <button onClick={handleLogout}
              style={{ width:"100%", display:"flex", alignItems:"center", gap:"10px", padding:"8px 10px", borderRadius:"12px", background:"transparent", border:"none", cursor:"pointer", transition:"background .2s" }}
              onMouseEnter={e => e.currentTarget.style.background="rgba(255,255,255,0.04)"}
              onMouseLeave={e => e.currentTarget.style.background="transparent"}>
              <div style={{ width:32, height:32, borderRadius:"9999px", background:"linear-gradient(135deg,#0ea5e9,#6366f1)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"12px", fontWeight:700, color:"#fff", flexShrink:0 }} className="syne">{recruiter?.name?.charAt(0) || "J"}</div>
              <div style={{ flex:1, minWidth:0, textAlign:"left" }}>
                <p style={{ fontSize:"14px", fontWeight:600, color:"#e2e8f0" }}>{recruiter?.name || "Recruiter"}</p>
                <p style={{ fontSize:"11px", color:"#475569" }}>Click to logout</p>
              </div>
            </button>
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <div style={{ flex:1, display:"flex", flexDirection:"column", minWidth:0, marginLeft:"224px" }} id="main-content">
          {/* Header */}
          <header style={{ position:"sticky", top:0, zIndex:30, height:"56px", display:"flex", alignItems:"center", gap:"16px", padding:"0 24px", background:"rgba(2,8,23,0.9)", backdropFilter:"blur(20px)", borderBottom:"1px solid #1e293b", flexShrink:0 }}>
            <button id="mobile-menu-btn" onClick={() => setSideOpen(!sideOpen)}
              style={{ display:"none", alignItems:"center", justifyContent:"center", width:36, height:36, borderRadius:"10px", background:"rgba(255,255,255,0.04)", border:"1px solid #1e293b", color:"#94a3b8", cursor:"pointer", flexShrink:0 }}>
              <MenuIcon />
            </button>
            <div style={{ flexShrink:0 }}>
              <p style={{ fontSize:"11px", color:"#475569" }}>Good morning 👋</p>
              <h1 className="syne" style={{ fontSize:"15px", fontWeight:700, color:"#fff" }}>Recruiter Dashboard</h1>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:"8px", background:"rgba(255,255,255,0.04)", border:"1px solid #1e293b", borderRadius:"12px", padding:"0 12px", height:"36px", width:"240px", marginLeft:"16px", flexShrink:0 }}>
              <SearchIcon />
              <input style={{ background:"transparent", outline:"none", fontSize:"13px", color:"#cbd5e1", width:"100%", fontFamily:"'DM Sans',sans-serif" }} placeholder="Search jobs, applicants..."/>
            </div>
            <div style={{ marginLeft:"auto", display:"flex", alignItems:"center", gap:"8px" }}>
              <button style={{ position:"relative", width:36, height:36, borderRadius:"10px", background:"rgba(255,255,255,0.04)", border:"1px solid #1e293b", display:"flex", alignItems:"center", justifyContent:"center", color:"#94a3b8", cursor:"pointer" }}>
                <BellIcon />
                <span style={{ position:"absolute", top:"7px", right:"7px", width:"6px", height:"6px", background:"#38bdf8", borderRadius:"9999px" }}/>
              </button>
              <button
                className="btn-grad"
                onClick={() => navigate("/recruiter/jobs/add")}
                style={{ display:"flex", alignItems:"center", gap:"6px", padding:"0 16px", height:36, borderRadius:"10px", color:"#fff", fontSize:"13px", fontWeight:600, border:"none", cursor:"pointer", fontFamily:"'DM Sans',sans-serif", flexShrink:0, transition:"all .2s" }}
                onMouseEnter={e => e.currentTarget.style.transform="translateY(-1px)"}
                onMouseLeave={e => e.currentTarget.style.transform="translateY(0)"}>
                <PlusIcon />Post Job
              </button>
            </div>
          </header>

          {/* Scrollable content */}
          <main style={{ flex:1, overflowY:"auto", padding:"24px", display:"flex", flexDirection:"column", gap:"20px" }}>
            {children}
          </main>
        </div>
      </div>
    </>
  );
}

export default RecruiterLayout;
