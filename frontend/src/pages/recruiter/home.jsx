import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../redux/authSlice";
import { authAPI } from "../../api/authAPI";
import jobAPI from "../../api/jobAPI";
import { useState, useEffect, useCallback } from "react";

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
    @media (max-width: 1023px) {
      .applicant-table-header { display: none !important; }
      .applicant-row { grid-template-columns: 1fr !important; gap: 8px !important; }
      .applicant-row > * { grid-column: auto !important; }
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
const EyeIcon     = () => <svg style={{width:15,height:15}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;
const CheckIcon   = () => <svg style={{width:13,height:13}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>;
const XIcon       = () => <svg style={{width:13,height:13}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const ArrowR      = () => <svg style={{width:14,height:14}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>;
const MenuIcon    = () => <svg style={{width:20,height:20}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>;
const CloseIcon   = () => <svg style={{width:18,height:18}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const TagIcon     = () => <svg style={{width:13,height:13}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>;

const Logo = () => (
  <div style={{ display:"flex", alignItems:"center" }}>
    <span className="syne" style={{ fontWeight:800, fontSize:"1.2rem", background:"linear-gradient(135deg,#38bdf8,#818cf8)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>NexWork</span>
    <span style={{ marginLeft:"6px", fontSize:"10px", fontWeight:700, color:"#38bdf8", background:"rgba(56,189,248,0.1)", border:"1px solid rgba(56,189,248,0.2)", padding:"2px 6px", borderRadius:"9999px" }}>Recruiter</span>
  </div>
);

// ── Data ──────────────────────────────────────────────────────────────────────
const STATS = [
  { label:"Active Jobs",          value:"12",  delta:"+2 this week",  colorA:"#0ea5e9", colorB:"#22d3ee", icon:"💼" },
  { label:"Total Applicants",     value:"348", delta:"+47 this week", colorA:"#8b5cf6", colorB:"#a78bfa", icon:"👥" },
  { label:"Interviews Scheduled", value:"24",  delta:"+6 this week",  colorA:"#10b981", colorB:"#2dd4bf", icon:"📅" },
  { label:"Positions Filled",     value:"8",   delta:"This month",    colorA:"#f97316", colorB:"#fbbf24", icon:"✅" },
];
const JOBS = [
  { id:1, title:"Senior React Developer", dept:"Engineering",    applicants:87,  newCount:12, status:"Active", posted:"3d ago",  type:"Full-time",  gradA:"#0c1a2e", gradB:"#0369a1" },
  { id:2, title:"Product Manager",        dept:"Product",        applicants:54,  newCount:7,  status:"Active", posted:"5d ago",  type:"Full-time",  gradA:"#1e1030", gradB:"#6d28d9" },
  { id:3, title:"UI/UX Design Intern",    dept:"Design",         applicants:112, newCount:23, status:"Active", posted:"1d ago",  type:"Internship", gradA:"#2d1020", gradB:"#be185d" },
  { id:4, title:"Data Scientist",         dept:"Analytics",      applicants:43,  newCount:4,  status:"Paused", posted:"10d ago", type:"Full-time",  gradA:"#0d2018", gradB:"#065f46" },
  { id:5, title:"DevOps Engineer",        dept:"Infrastructure", applicants:29,  newCount:8,  status:"Active", posted:"2d ago",  type:"Full-time",  gradA:"#2d1400", gradB:"#c2410c" },
];
const APPLICANTS = [
  { id:1, name:"Aryan Sharma", role:"React Developer", exp:"3 yrs", loc:"Bengaluru", av:"AS", gradA:"#0c2040", gradB:"#0369a1", status:"Shortlisted", score:92 },
  { id:2, name:"Neha Kapoor",  role:"Product Manager", exp:"5 yrs", loc:"Mumbai",    av:"NK", gradA:"#1e0840", gradB:"#6d28d9", status:"Interview",   score:88 },
  { id:3, name:"Rahul Verma",  role:"Data Scientist",  exp:"2 yrs", loc:"Hyderabad", av:"RV", gradA:"#082018", gradB:"#065f46", status:"Applied",     score:79 },
  { id:4, name:"Priya Singh",  role:"UI/UX Designer",  exp:"4 yrs", loc:"Pune",      av:"PS", gradA:"#2d0820", gradB:"#be185d", status:"Shortlisted", score:95 },
  { id:5, name:"Karan Mehta",  role:"DevOps Engineer", exp:"6 yrs", loc:"Delhi",     av:"KM", gradA:"#2d1000", gradB:"#c2410c", status:"Applied",     score:84 },
];
const ACTIVITY = [
  { text:"Neha Kapoor accepted interview invite",      time:"10 min ago", dot:"#34d399" },
  { text:"New application: UI/UX Intern (Simran D.)", time:"32 min ago", dot:"#38bdf8" },
  { text:"Aryan Sharma moved to final round",          time:"1h ago",     dot:"#a78bfa" },
  { text:"Job post 'DevOps Engineer' published",       time:"3h ago",     dot:"#fbbf24" },
  { text:"5 new applicants for React Developer",       time:"5h ago",     dot:"#f472b6" },
];
const NAV = [
  { label:"Dashboard",    Icon:GridIcon,  badge:null },
  { label:"Job Listings", Icon:BriefIcon, badge:"12" },
  { label:"Applicants",   Icon:UsersIcon, badge:"47" },
  { label:"Explore",      Icon:UsersIcon, badge:null },
  { label:"Posts",        Icon:GridIcon,  badge:null },
];

const SC = {
  Active:      { color:"#34d399", bg:"rgba(52,211,153,0.1)",   border:"rgba(52,211,153,0.2)" },
  Paused:      { color:"#fbbf24", bg:"rgba(251,191,36,0.1)",   border:"rgba(251,191,36,0.2)" },
  Shortlisted: { color:"#38bdf8", bg:"rgba(56,189,248,0.1)",   border:"rgba(56,189,248,0.2)" },
  Interview:   { color:"#a78bfa", bg:"rgba(167,139,250,0.1)",  border:"rgba(167,139,250,0.2)" },
  Applied:     { color:"#94a3b8", bg:"rgba(148,163,184,0.1)",  border:"rgba(148,163,184,0.2)" },
};

const StatusBadge = ({ status }) => {
  const s = SC[status] || SC.Applied;
  return (
    <span style={{ fontSize:"10px", fontWeight:700, padding:"2px 8px", borderRadius:"9999px", color:s.color, background:s.bg, border:`1px solid ${s.border}`, whiteSpace:"nowrap" }}>
      {status}
    </span>
  );
};

// ── Label style ───────────────────────────────────────────────────────────────
const labelSt = {
  display:"block", fontSize:"11px", fontWeight:700,
  color:"#94a3b8", marginBottom:"8px",
  textTransform:"uppercase", letterSpacing:"0.1em",
};

// ── POST JOB MODAL ────────────────────────────────────────────────────────────
const INIT_JOB = {
  title:"", department:"", type:"", location:"", locationType:"",
  salaryMin:"", salaryMax:"", experience:"", openings:"1",
  description:"", requirements:"", benefits:"",
  skills:"", deadline:"", priority:"Normal",
};

function PostJobModal({ onClose, onSubmit }) {
  const [step, setStep]   = useState(0);
  const [form, setForm]   = useState(INIT_JOB);
  const [tags, setTags]   = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [busy, setBusy]   = useState(false);
  const [done, setDone]   = useState(false);

  const set = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const addTag = (e) => {
    if ((e.key === "Enter" || e.key === ",") && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim()) && tags.length < 10)
        setTags(t => [...t, tagInput.trim()]);
      setTagInput("");
    }
  };
  const removeTag = (t) => setTags(ts => ts.filter(x => x !== t));

  const STEPS = ["Basic Info", "Details", "Requirements"];

  const canNext = [
    form.title && form.department && form.type && form.location && form.locationType,
    form.salaryMin && form.experience && form.openings,
    form.description.length > 20,
  ];

  const handleSubmit = async () => {
    setBusy(true);
    await new Promise(r => setTimeout(r, 1200)); // replace with real API call
    setBusy(false);
    setDone(true);
    setTimeout(() => { onSubmit({ ...form, skills: tags }); onClose(); }, 1200);
  };

  if (done) return (
    <ModalShell onClose={onClose}>
      <div style={{ textAlign:"center", padding:"48px 32px" }}>
        <div style={{ width:72, height:72, borderRadius:"9999px", background:"linear-gradient(135deg,#10b981,#34d399)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 20px" }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
        </div>
        <h3 className="syne" style={{ color:"#fff", fontSize:"1.4rem", marginBottom:8 }}>Job Posted! 🎉</h3>
        <p style={{ color:"#64748b", fontSize:"14px" }}>Your listing is now live and accepting applications.</p>
      </div>
    </ModalShell>
  );

  return (
    <ModalShell onClose={onClose}>
      {/* Header */}
      <div style={{ padding:"20px 24px 0", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div>
          <h2 className="syne" style={{ color:"#fff", fontSize:"1.25rem", fontWeight:800 }}>Post a New Job</h2>
          <p style={{ color:"#475569", fontSize:"13px", marginTop:2 }}>Fill in the details to publish your listing</p>
        </div>
        <button onClick={onClose} style={{ width:36, height:36, borderRadius:"10px", background:"rgba(255,255,255,0.05)", border:"1px solid #1e293b", display:"flex", alignItems:"center", justifyContent:"center", color:"#64748b", cursor:"pointer", transition:"all .2s" }}
          onMouseEnter={e => { e.currentTarget.style.background="rgba(255,255,255,0.1)"; e.currentTarget.style.color="#e2e8f0"; }}
          onMouseLeave={e => { e.currentTarget.style.background="rgba(255,255,255,0.05)"; e.currentTarget.style.color="#64748b"; }}>
          <CloseIcon />
        </button>
      </div>

      {/* Step indicators */}
      <div style={{ padding:"16px 24px 0", display:"flex", alignItems:"center", gap:0 }}>
        {STEPS.map((s, i) => (
          <div key={s} style={{ display:"flex", alignItems:"center", flex: i < STEPS.length - 1 ? 1 : "none" }}>
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <div style={{
                width:26, height:26, borderRadius:"9999px",
                display:"flex", alignItems:"center", justifyContent:"center",
                fontSize:"11px", fontWeight:700, flexShrink:0,
                background: i < step ? "linear-gradient(135deg,#10b981,#34d399)" : i === step ? "linear-gradient(135deg,#0ea5e9,#6366f1)" : "rgba(255,255,255,0.05)",
                color: i <= step ? "#fff" : "#475569",
                border: i <= step ? "none" : "1px solid #1e293b",
              }}>
                {i < step ? <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg> : i + 1}
              </div>
              <span style={{ fontSize:"12px", fontWeight:600, color: i === step ? "#cbd5e1" : "#475569", whiteSpace:"nowrap" }}>{s}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div style={{ flex:1, height:"1px", margin:"0 10px", background: i < step ? "#10b981" : "#1e293b", transition:"background .3s" }}/>
            )}
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div style={{ margin:"12px 24px 0", height:3, background:"rgba(255,255,255,0.05)", borderRadius:9999, overflow:"hidden" }}>
        <div style={{ height:"100%", borderRadius:9999, width:`${((step + 1) / STEPS.length) * 100}%`, background:"linear-gradient(90deg,#0ea5e9,#6366f1)", transition:"width .4s cubic-bezier(.4,0,.2,1)" }}/>
      </div>

      {/* Form body */}
      <div style={{ padding:"20px 24px", overflowY:"auto", maxHeight:"52vh", display:"flex", flexDirection:"column", gap:16 }}>

        {/* ── STEP 0: Basic Info ── */}
        {step === 0 && <>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
            <div style={{ gridColumn:"1/-1" }}>
              <label style={labelSt}>Job Title *</label>
              <input name="title" value={form.title} onChange={set} placeholder="e.g. Senior React Developer" className="input-field"/>
            </div>
            <div>
              <label style={labelSt}>Department *</label>
              <select name="department" value={form.department} onChange={set} className="input-field">
                <option value="">Select department</option>
                {["Engineering","Product","Design","Analytics","Marketing","Operations","Finance","HR","Infrastructure","Sales"].map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label style={labelSt}>Job Type *</label>
              <select name="type" value={form.type} onChange={set} className="input-field">
                <option value="">Select type</option>
                {["Full-time","Part-time","Contract","Internship","Freelance"].map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label style={labelSt}>Location *</label>
              <input name="location" value={form.location} onChange={set} placeholder="e.g. Bengaluru, Mumbai" className="input-field"/>
            </div>
            <div>
              <label style={labelSt}>Work Mode *</label>
              <select name="locationType" value={form.locationType} onChange={set} className="input-field">
                <option value="">Select mode</option>
                {["On-site","Remote","Hybrid"].map(m => <option key={m}>{m}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label style={labelSt}>Priority</label>
            <div style={{ display:"flex", gap:8 }}>
              {["Low","Normal","Urgent"].map(p => (
                <button key={p} type="button" onClick={() => setForm(f => ({ ...f, priority: p }))}
                  style={{
                    flex:1, padding:"9px", borderRadius:10, border:"1px solid",
                    fontSize:"13px", fontWeight:600, cursor:"pointer", transition:"all .2s",
                    fontFamily:"'DM Sans',sans-serif",
                    borderColor: form.priority === p ? (p === "Urgent" ? "#f87171" : p === "Low" ? "#34d399" : "#38bdf8") : "#1e293b",
                    background: form.priority === p ? (p === "Urgent" ? "rgba(248,113,113,0.1)" : p === "Low" ? "rgba(52,211,153,0.1)" : "rgba(56,189,248,0.1)") : "rgba(255,255,255,0.03)",
                    color: form.priority === p ? (p === "Urgent" ? "#f87171" : p === "Low" ? "#34d399" : "#38bdf8") : "#64748b",
                  }}>
                  {p === "Urgent" ? "🔴" : p === "Low" ? "🟢" : "🔵"} {p}
                </button>
              ))}
            </div>
          </div>
        </>}

        {/* ── STEP 1: Details ── */}
        {step === 1 && <>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
            <div>
              <label style={labelSt}>Min Salary (₹/yr) *</label>
              <input name="salaryMin" value={form.salaryMin} onChange={set} placeholder="e.g. 800000" className="input-field" type="number"/>
            </div>
            <div>
              <label style={labelSt}>Max Salary (₹/yr)</label>
              <input name="salaryMax" value={form.salaryMax} onChange={set} placeholder="e.g. 1200000" className="input-field" type="number"/>
            </div>
            <div>
              <label style={labelSt}>Experience Required *</label>
              <select name="experience" value={form.experience} onChange={set} className="input-field">
                <option value="">Select level</option>
                {["Fresher (0–1 yr)","Junior (1–3 yrs)","Mid-level (3–5 yrs)","Senior (5–8 yrs)","Lead (8+ yrs)"].map(e => <option key={e}>{e}</option>)}
              </select>
            </div>
            <div>
              <label style={labelSt}>No. of Openings *</label>
              <input name="openings" value={form.openings} onChange={set} className="input-field" type="number" min="1" placeholder="1"/>
            </div>
            <div>
              <label style={labelSt}>Application Deadline</label>
              <input name="deadline" value={form.deadline} onChange={set} className="input-field" type="date"/>
            </div>
          </div>

          {/* Skills tags */}
          <div>
            <label style={labelSt}>Required Skills <span style={{ color:"#475569", textTransform:"none", letterSpacing:0 }}>(press Enter to add)</span></label>
            <div style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:12, padding:"8px 12px", minHeight:48, display:"flex", flexWrap:"wrap", gap:6, alignItems:"center", transition:"border-color .2s" }}
              onClick={e => e.currentTarget.querySelector("input")?.focus()}
              onFocusCapture={e => e.currentTarget.style.borderColor="#38bdf8"}
              onBlurCapture={e => e.currentTarget.style.borderColor="rgba(255,255,255,0.1)"}>
              {tags.map(t => (
                <span key={t} style={{ display:"inline-flex", alignItems:"center", gap:5, background:"rgba(56,189,248,0.1)", border:"1px solid rgba(56,189,248,0.2)", borderRadius:8, padding:"3px 10px", fontSize:12, fontWeight:600, color:"#38bdf8" }}>
                  <TagIcon/>{t}
                  <button type="button" onClick={() => removeTag(t)} style={{ color:"#38bdf8", background:"none", border:"none", cursor:"pointer", lineHeight:1, marginLeft:2 }}>×</button>
                </span>
              ))}
              <input
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={addTag}
                placeholder={tags.length === 0 ? "React, Node.js, Python..." : ""}
                style={{ background:"transparent", border:"none", outline:"none", fontSize:13, color:"#f1f5f9", fontFamily:"'DM Sans',sans-serif", flex:1, minWidth:120 }}
              />
            </div>
          </div>
        </>}

        {/* ── STEP 2: Requirements ── */}
        {step === 2 && <>
          <div>
            <label style={labelSt}>Job Description * <span style={{ color:"#475569", textTransform:"none", letterSpacing:0 }}>({form.description.length} chars)</span></label>
            <textarea name="description" value={form.description} onChange={set} placeholder="Describe the role, responsibilities, and what a typical day looks like..." className="input-field" style={{ minHeight:110 }}/>
          </div>
          <div>
            <label style={labelSt}>Requirements</label>
            <textarea name="requirements" value={form.requirements} onChange={set} placeholder="List qualifications, must-haves, and nice-to-haves..." className="input-field"/>
          </div>
          <div>
            <label style={labelSt}>Perks & Benefits</label>
            <textarea name="benefits" value={form.benefits} onChange={set} placeholder="Health insurance, remote work, stock options, learning budget..." className="input-field" style={{ minHeight:72 }}/>
          </div>

          {/* Preview card */}
          <div style={{ background:"rgba(255,255,255,0.02)", border:"1px solid #1e293b", borderRadius:14, padding:16 }}>
            <p style={{ fontSize:"10px", fontWeight:700, color:"#475569", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:12 }}>Preview</p>
            <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:10 }}>
              <div style={{ width:40, height:40, borderRadius:10, background:"linear-gradient(135deg,#0c1a2e,#0369a1)", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontWeight:700, fontSize:14 }}>
                {form.title?.[0] || "?"}
              </div>
              <div>
                <p style={{ fontSize:14, fontWeight:600, color:"#e2e8f0" }}>{form.title || "Job Title"}</p>
                <p style={{ fontSize:11, color:"#64748b" }}>{form.department} · {form.type} · {form.locationType}</p>
              </div>
            </div>
            <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
              {tags.slice(0,5).map(t => (
                <span key={t} style={{ fontSize:10, fontWeight:600, padding:"2px 8px", borderRadius:9999, background:"rgba(56,189,248,0.08)", border:"1px solid rgba(56,189,248,0.15)", color:"#38bdf8" }}>{t}</span>
              ))}
              {form.priority && (
                <span style={{ fontSize:10, fontWeight:700, padding:"2px 8px", borderRadius:9999, background: form.priority === "Urgent" ? "rgba(248,113,113,0.1)" : "rgba(52,211,153,0.1)", color: form.priority === "Urgent" ? "#f87171" : "#34d399", border:"1px solid transparent" }}>{form.priority}</span>
              )}
            </div>
          </div>
        </>}
      </div>

      {/* Footer nav */}
      <div style={{ padding:"16px 24px", borderTop:"1px solid #1e293b", display:"flex", gap:10 }}>
        {step > 0 && (
          <button type="button" onClick={() => setStep(s => s - 1)}
            style={{ flex:1, padding:12, borderRadius:12, border:"1px solid #334155", background:"transparent", color:"#cbd5e1", fontSize:13, fontWeight:600, cursor:"pointer", transition:"all .2s", fontFamily:"'DM Sans',sans-serif" }}
            onMouseEnter={e => e.currentTarget.style.background="rgba(255,255,255,0.05)"}
            onMouseLeave={e => e.currentTarget.style.background="transparent"}>
            ← Back
          </button>
        )}
        {step < 2 ? (
          <button type="button" onClick={() => setStep(s => s + 1)} disabled={!canNext[step]}
            className="btn-grad"
            style={{ flex:2, padding:12, borderRadius:12, border:"none", color:"#fff", fontSize:13, fontWeight:600, cursor: canNext[step] ? "pointer" : "not-allowed", opacity: canNext[step] ? 1 : 0.4, fontFamily:"'DM Sans',sans-serif", transition:"all .2s" }}>
            Continue →
          </button>
        ) : (
          <button type="button" onClick={handleSubmit} disabled={!canNext[2] || busy}
            className="btn-grad"
            style={{ flex:2, padding:12, borderRadius:12, border:"none", color:"#fff", fontSize:13, fontWeight:600, cursor: canNext[2] && !busy ? "pointer" : "not-allowed", opacity: canNext[2] && !busy ? 1 : 0.5, fontFamily:"'DM Sans',sans-serif", display:"flex", alignItems:"center", justifyContent:"center", gap:8, transition:"all .2s" }}>
            {busy
              ? <><svg style={{width:15,height:15,animation:"spin .7s linear infinite"}} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg> Publishing…</>
              : <>🚀 Publish Job</>}
          </button>
        )}
      </div>
    </ModalShell>
  );
}

function ModalShell({ children, onClose }) {
  return (
    <div className="overlay-in" style={{ position:"fixed", inset:0, zIndex:100, display:"flex", alignItems:"center", justifyContent:"center", padding:16, background:"rgba(2,8,23,0.85)", backdropFilter:"blur(8px)" }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-in" style={{ width:"100%", maxWidth:560, background:"#0f172a", border:"1px solid #1e293b", borderRadius:20, boxShadow:"0 32px 64px rgba(0,0,0,0.6)", overflow:"hidden" }}>
        {children}
      </div>
    </div>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────
export function RecruiterHome({ go }) {
  const [nav, setNav]         = useState("Dashboard");
  const [acts, setActs]       = useState({});
  const [sideOpen, setSideOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  
  // Real data from database
  const [realJobs, setRealJobs] = useState([]);
  const [realApplicants, setRealApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { recruiter } = useSelector((state) => state.auth);

  const act = (id, a) => setActs(p => ({ ...p, [id]: a }));

  // Fetch real data from database
  const fetchDashboardData = useCallback(async () => {
    if (!recruiter) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Fetch recruiter's jobs
      const jobsRes = await jobAPI.getMyJobs(1, 100);
      const jobs = jobsRes.jobs || [];
      setRealJobs(jobs);
      
      // Fetch applicants for all jobs
      let allApplicants = [];
      for (const job of jobs) {
        try {
          const appRes = await jobAPI.getJobApplicants(job.id);
          allApplicants = [...allApplicants, ...(appRes.applications || [])];
        } catch (err) {
          console.error(`Failed to fetch applicants for job ${job.id}:`, err);
        }
      }
      setRealApplicants(allApplicants);
    } catch (err) {
      console.error("Failed to fetch dashboard data:", err);
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  }, [recruiter]);

  useEffect(() => {
    if (recruiter) {
      fetchDashboardData();
    }
  }, [recruiter, fetchDashboardData]);

  const handleLogout = async () => {
    try {
      await authAPI.recruiterLogout();
      localStorage.removeItem("token");
      dispatch(logout());
      navigate("/recruiter/login");
    } catch (err) {
      console.error("Logout failed:", err);
      // Still logout locally even if API fails
      localStorage.removeItem("token");
      dispatch(logout());
      navigate("/recruiter/login");
    }
  };

  return (
    <>
      <GlobalStyle />

      {/* Post Job Modal */}
      {showModal && (
        <PostJobModal
          onClose={() => setShowModal(false)}
          onSubmit={(data) => { console.log("New job:", data); setShowModal(false); }}
        />
      )}

      <div style={{ minHeight:"100vh", display:"flex", fontFamily:"'DM Sans',sans-serif", background:"#020817", position:"relative" }}>

        {/* Mobile overlay */}
        <div
          id="overlay"
          onClick={() => setSideOpen(false)}
          style={{ display:"none", position:"fixed", inset:0, background:"rgba(0,0,0,0.6)", zIndex:40, backdropFilter:"blur(2px)" }}
        />

        {/* ══ SIDEBAR ══════════════════════════════════════════════════ */}
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
                  } else if (label === "Applicants") {
                    navigate("/recruiter/applicants");
                  } else if (label === "Explore") {
                    navigate("/recruiter/explore");
                  } else if (label === "Posts") {
                    navigate("/recruiter/posts");
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

        {/* ══ MAIN CONTENT ════════════════════════════════════════════ */}
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
              {/* ← THIS IS THE BUTTON THAT OPENS THE POST JOB PAGE */}
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

            {/* Stats - Real data from database */}
            <div className="fu" style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))", gap:"16px" }}>
              {(() => {
                // Calculate stats from real data
                const activeJobs = realJobs.filter(j => j.is_active).length;
                const totalApplicants = realApplicants.length;
                const interviewed = realApplicants.filter(a => a.status === 'shortlisted').length;
                const hired = realApplicants.filter(a => a.status === 'hired').length;

                const stats = [
                  { label:"Active Jobs", value: activeJobs, delta:`${realJobs.length} total`, colorA:"#0ea5e9", colorB:"#22d3ee", icon:"💼" },
                  { label:"Total Applicants", value: totalApplicants, delta:`${interviewed} shortlisted`, colorA:"#8b5cf6", colorB:"#a78bfa", icon:"👥" },
                  { label:"Interviews Scheduled", value: interviewed, delta:`${hired} hired`, colorA:"#10b981", colorB:"#2dd4bf", icon:"📅" },
                  { label:"Positions Filled", value: hired, delta:"This month", colorA:"#f97316", colorB:"#fbbf24", icon:"✅" },
                ];

                return stats.map(s => (
                  <div key={s.label} style={{ background:"#0f172a", border:"1px solid #1e293b", borderRadius:"16px", padding:"16px", transition:"border-color .2s" }}
                    onMouseEnter={e => e.currentTarget.style.borderColor="#334155"}
                    onMouseLeave={e => e.currentTarget.style.borderColor="#1e293b"}>
                    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"12px" }}>
                      <span style={{ fontSize:"20px" }}>{s.icon}</span>
                      <span style={{ fontSize:"11px", color:"#64748b", background:"rgba(255,255,255,0.05)", padding:"2px 8px", borderRadius:"9999px" }}>{s.delta}</span>
                    </div>
                    <p className="syne" style={{ fontSize:"2rem", fontWeight:800, background:`linear-gradient(135deg,${s.colorA},${s.colorB})`, WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>{s.value}</p>
                    <p style={{ color:"#64748b", fontSize:"12px", marginTop:"4px", fontWeight:500 }}>{s.label}</p>
                  </div>
                ));
              })()}
            </div>

            {/* Jobs + Activity */}
            <div className="fu1" style={{ display:"grid", gap:"20px" }}>
              <div style={{ display:"grid", gridTemplateColumns:"minmax(0,1fr) 288px", gap:"20px" }} id="jobs-activity-grid">
                <div style={{ background:"#0f172a", border:"1px solid #1e293b", borderRadius:"16px", overflow:"hidden" }}>
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"16px 20px", borderBottom:"1px solid #1e293b" }}>
                    <h2 className="syne" style={{ fontSize:"15px", fontWeight:700, color:"#fff" }}>Active Job Posts</h2>
                    <button onClick={() => navigate("/recruiter/jobs")} style={{ fontSize:"12px", color:"#38bdf8", fontWeight:600, background:"none", border:"none", cursor:"pointer", display:"flex", alignItems:"center", gap:"4px" }}>View all<ArrowR/></button>
                  </div>
                  {loading ? (
                    <div style={{ padding:"24px", textAlign:"center", color:"#64748b" }}>Loading jobs...</div>
                  ) : realJobs.length === 0 ? (
                    <div style={{ padding:"24px", textAlign:"center", color:"#64748b" }}>No jobs posted yet</div>
                  ) : (
                    realJobs.slice(0, 5).map((j, idx) => {
                      const jobApplicants = realApplicants.filter(a => a.job_id === j.id);
                      const colors = [
                        { gradA:"#0c1a2e", gradB:"#0369a1" },
                        { gradA:"#1e1030", gradB:"#6d28d9" },
                        { gradA:"#2d1020", gradB:"#be185d" },
                        { gradA:"#0d2018", gradB:"#065f46" },
                        { gradA:"#2d1400", gradB:"#c2410c" },
                      ];
                      const color = colors[idx % colors.length];
                      const createdDate = new Date(j.created_at);
                      const now = new Date();
                      const daysAgo = Math.floor((now - createdDate) / (1000 * 60 * 60 * 24));
                      const posted = daysAgo === 0 ? "today" : daysAgo === 1 ? "1d ago" : `${daysAgo}d ago`;
                      
                      return (
                        <div key={j.id} style={{ display:"flex", alignItems:"center", gap:"12px", padding:"12px 20px", borderBottom: idx < Math.min(5, realJobs.length) - 1 ? "1px solid #1e293b" : "none", transition:"background .2s", cursor:"pointer" }}
                          onClick={() => navigate(`/recruiter/jobs/${j.id}/applicants`)}
                          onMouseEnter={e => e.currentTarget.style.background="rgba(255,255,255,0.02)"}
                          onMouseLeave={e => e.currentTarget.style.background="transparent"}>
                          <div style={{ width:36, height:36, borderRadius:"10px", background:`linear-gradient(135deg,${color.gradA},${color.gradB})`, display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontSize:"12px", fontWeight:700, flexShrink:0 }}>{j.title[0]}</div>
                          <div style={{ flex:1, minWidth:0 }}>
                            <p style={{ fontSize:"13px", fontWeight:600, color:"#e2e8f0", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{j.title}</p>
                            <p style={{ fontSize:"11px", color:"#64748b" }}>{j.department} · {j.type} · {posted}</p>
                          </div>
                          <div style={{ textAlign:"right", flexShrink:0 }}>
                            <p style={{ fontSize:"13px", fontWeight:700, color:"#e2e8f0" }}>{jobApplicants.length}</p>
                            <p style={{ fontSize:"11px", color:"#64748b" }}>applicants</p>
                          </div>
                          <StatusBadge status={j.is_active ? "Active" : "Paused"} />
                          <button style={{ color:"#475569", background:"none", border:"none", cursor:"pointer", display:"flex", alignItems:"center", flexShrink:0 }}><EyeIcon /></button>
                        </div>
                      );
                    })
                  )}
                </div>

                <div style={{ background:"#0f172a", border:"1px solid #1e293b", borderRadius:"16px", overflow:"hidden", display:"flex", flexDirection:"column" }}>
                  <div style={{ padding:"16px 20px", borderBottom:"1px solid #1e293b" }}>
                    <h2 className="syne" style={{ fontSize:"15px", fontWeight:700, color:"#fff" }}>Recent Activity</h2>
                  </div>
                  <div style={{ padding:"12px", display:"flex", flexDirection:"column", gap:"2px", flex:1 }}>
                    {(() => {
                      // Generate activity from applicants sorted by date
                      const activities = realApplicants
                        .sort((a, b) => new Date(b.applied_at) - new Date(a.applied_at))
                        .slice(0, 5)
                        .map(app => {
                          const statusMessages = {
                            applied: `New application: ${app.user?.name || "Candidate"}`,
                            shortlisted: `${app.user?.name || "Candidate"} shortlisted`,
                            rejected: `${app.user?.name || "Candidate"} rejected`,
                            hired: `${app.user?.name || "Candidate"} hired`,
                            withdrawn: `${app.user?.name || "Candidate"} withdrew`,
                          };
                          const statusDots = {
                            applied: "#38bdf8",
                            shortlisted: "#a78bfa",
                            rejected: "#f87171",
                            hired: "#34d399",
                            withdrawn: "#94a3b8",
                          };
                          const now = new Date();
                          const appDate = new Date(app.applied_at);
                          const diffMs = now - appDate;
                          const diffMins = Math.floor(diffMs / 60000);
                          const diffHours = Math.floor(diffMs / 3600000);
                          const diffDays = Math.floor(diffMs / 86400000);
                          let timeStr = "just now";
                          if (diffMins > 0 && diffMins < 60) timeStr = `${diffMins}m ago`;
                          else if (diffHours > 0 && diffHours < 24) timeStr = `${diffHours}h ago`;
                          else if (diffDays > 0) timeStr = `${diffDays}d ago`;

                          return {
                            text: statusMessages[app.status] || statusMessages.applied,
                            dot: statusDots[app.status] || statusDots.applied,
                            time: timeStr,
                          };
                        });

                      return activities.length === 0 ? (
                        <div style={{ padding:"12px", color:"#64748b", fontSize:"12px", textAlign:"center" }}>No activity yet</div>
                      ) : (
                        activities.map((a, i) => (
                          <div key={i} style={{ display:"flex", alignItems:"flex-start", gap:"12px", padding:"8px", borderRadius:"10px", transition:"background .2s" }}
                            onMouseEnter={e => e.currentTarget.style.background="rgba(255,255,255,0.03)"}
                            onMouseLeave={e => e.currentTarget.style.background="transparent"}>
                            <div style={{ width:8, height:8, borderRadius:"9999px", background:a.dot, marginTop:"5px", flexShrink:0 }}/>
                            <div>
                              <p style={{ fontSize:"13px", color:"#cbd5e1", lineHeight:1.4 }}>{a.text}</p>
                              <p style={{ fontSize:"11px", color:"#475569", marginTop:"2px" }}>{a.time}</p>
                            </div>
                          </div>
                        ))
                      );
                    })()}
                  </div>
                  <div style={{ padding:"12px 20px 16px", borderTop:"1px solid #1e293b" }}>
                    <p style={{ fontSize:"11px", color:"#64748b", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:"10px" }}>Applications Trend</p>
                    <div style={{ display:"flex", alignItems:"flex-end", gap:"4px", height:"48px" }}>
                      {(() => {
                        // Calculate applications per day for last 7 days
                        const last7Days = Array.from({ length: 7 }, (_, i) => {
                          const d = new Date();
                          d.setDate(d.getDate() - (6 - i));
                          d.setHours(0, 0, 0, 0);
                          return d;
                        });

                        const counts = last7Days.map(day => {
                          const nextDay = new Date(day);
                          nextDay.setDate(nextDay.getDate() + 1);
                          return realApplicants.filter(a => {
                            const appDate = new Date(a.applied_at);
                            return appDate >= day && appDate < nextDay;
                          }).length;
                        });

                        const max = Math.max(...counts, 1);
                        return counts.map((h, i) => (
                          <div key={i} className="bar-fill" style={{ flex:1, borderRadius:"3px 3px 0 0", height:`${(h / max) * 100}%`, background:"linear-gradient(to top,#0ea5e9,#6366f1)", opacity: i === 6 ? 1 : 0.3 }}/>
                        ));
                      })()}
                    </div>
                    <div style={{ display:"flex", marginTop:"6px" }}>
                      {["M","T","W","T","F","S","S"].map((d, i) => (
                        <span key={i} style={{ flex:1, textAlign:"center", fontSize:"10px", color: i === 6 ? "#38bdf8" : "#475569", fontWeight: i === 6 ? 700 : 400 }}>{d}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Applicants table - Real data */}
            <div className="fu2" style={{ background:"#0f172a", border:"1px solid #1e293b", borderRadius:"16px", overflow:"hidden" }}>
              <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", padding:"16px 20px", borderBottom:"1px solid #1e293b", gap:"12px" }}>
                <div>
                  <h2 className="syne" style={{ fontSize:"15px", fontWeight:700, color:"#fff" }}>Recent Applicants</h2>
                  <p style={{ fontSize:"12px", color:"#64748b", marginTop:"2px" }}>Review and take action on new applications</p>
                </div>
                <button onClick={() => navigate("/recruiter/jobs")} style={{ fontSize:"12px", color:"#38bdf8", fontWeight:600, background:"none", border:"none", cursor:"pointer", display:"flex", alignItems:"center", gap:"4px", flexShrink:0 }}>View all<ArrowR/></button>
              </div>
              <div className="applicant-table-header" style={{ display:"grid", gridTemplateColumns:"2fr 1.5fr 0.7fr 0.8fr 1fr 120px", gap:"12px", padding:"8px 20px", background:"rgba(255,255,255,0.02)", borderBottom:"1px solid #1e293b" }}>
                {["Candidate","Applied For","Exp","Location","Status","Action"].map(h => (
                  <p key={h} style={{ fontSize:"10px", fontWeight:700, color:"#475569", textTransform:"uppercase", letterSpacing:"0.08em" }}>{h}</p>
                ))}
              </div>
              {loading ? (
                <div style={{ padding:"24px", textAlign:"center", color:"#64748b" }}>Loading applicants...</div>
              ) : realApplicants.length === 0 ? (
                <div style={{ padding:"24px", textAlign:"center", color:"#64748b" }}>No applicants yet</div>
              ) : (
                realApplicants.slice(0, 5).map((a, idx) => {
                  const action = acts[a.id];
                  const user = a.user || {};
                  const gradients = [
                    { gradA:"#0c2040", gradB:"#0369a1" },
                    { gradA:"#1e0840", gradB:"#6d28d9" },
                    { gradA:"#082018", gradB:"#065f46" },
                    { gradA:"#2d0820", gradB:"#be185d" },
                    { gradA:"#2d1000", gradB:"#c2410c" },
                  ];
                  const grad = gradients[idx % gradients.length];
                  const nameInitials = (user.name || "User").split(" ").map(n => n[0]).join("").toUpperCase();
                  const job = realJobs.find(j => j.id === a.job_id);
                  
                  return (
                    <div key={a.id} className="applicant-row"
                      style={{ display:"grid", gridTemplateColumns:"2fr 1.5fr 0.7fr 0.8fr 1fr 120px", gap:"12px", alignItems:"center", padding:"12px 20px", borderBottom: idx < Math.min(5, realApplicants.length) - 1 ? "1px solid #1e293b" : "none", transition:"background .2s", cursor:"pointer" }}
                      onClick={() => navigate(`/recruiter/jobs/${a.job_id}/candidates/${a.id}`)}
                      onMouseEnter={e => e.currentTarget.style.background="rgba(255,255,255,0.02)"}
                      onMouseLeave={e => e.currentTarget.style.background="transparent"}>
                      <div style={{ display:"flex", alignItems:"center", gap:"10px", minWidth:0 }}>
                        <div style={{ width:36, height:36, borderRadius:"9999px", background:`linear-gradient(135deg,${grad.gradA},${grad.gradB})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"11px", fontWeight:700, color:"#fff", flexShrink:0 }}>{nameInitials}</div>
                        <div style={{ minWidth:0 }}>
                          <p style={{ fontSize:"13px", fontWeight:600, color:"#e2e8f0", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{user.name || "Anonymous"}</p>
                          <StatusBadge status={a.status} />
                        </div>
                      </div>
                      <p style={{ fontSize:"13px", color:"#94a3b8", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{job?.title || "Job"}</p>
                      <p style={{ fontSize:"13px", color:"#94a3b8" }}>{user.experience_level || "—"}</p>
                      <p style={{ fontSize:"13px", color:"#94a3b8", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{user.city ? `${user.city}${user.state ? `, ${user.state.slice(0, 2)}` : ""}` : "—"}</p>
                      <span style={{ fontSize:"12px", fontWeight:600, padding:"4px 10px", borderRadius:"8px", color: a.status === "shortlisted" ? "#a78bfa" : a.status === "hired" ? "#34d399" : a.status === "rejected" ? "#f87171" : "#38bdf8", background: a.status === "shortlisted" ? "rgba(167,139,250,0.1)" : a.status === "hired" ? "rgba(52,211,153,0.1)" : a.status === "rejected" ? "rgba(248,113,113,0.1)" : "rgba(56,189,248,0.1)" }}>
                        {a.status.charAt(0).toUpperCase() + a.status.slice(1)}
                      </span>
                      <button onClick={(e) => { e.stopPropagation(); navigate(`/recruiter/jobs/${a.job_id}/candidates/${a.id}`); }} style={{ width:32, height:32, borderRadius:"8px", background:"rgba(255,255,255,0.04)", border:"1px solid #1e293b", color:"#64748b", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}><EyeIcon /></button>
                    </div>
                  );
                })
              )}
            </div>

            {/* ── ANALYTICS SECTION ── */}
            <div className="fu1" style={{ marginTop:"32px", paddingTop:"24px", borderTop:"1px solid #1e293b" }}>
              <h2 className="syne" style={{ fontSize:"15px", fontWeight:700, color:"#fff", marginBottom:"20px" }}>📊 Analytics & Performance</h2>

              {/* Chart Row 1 */}
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(300px, 1fr))", gap:"16px", marginBottom:"20px" }}>
                {/* Applications Timeline */}
                <div style={{ background:"#0f172a", border:"1px solid #1e293b", borderRadius:"16px", padding:"20px" }}>
                  <div style={{ marginBottom:"16px" }}>
                    <h3 style={{ fontSize:"14px", fontWeight:700, color:"#e2e8f0", marginBottom:2 }}>Applications Over Time</h3>
                    <p style={{ fontSize:"11px", color:"#64748b" }}>Last 4 weeks</p>
                  </div>
                  <div style={{ display:"flex", alignItems:"flex-end", gap:8, height:160, justifyContent:"space-around" }}>
                    {[
                      { name:"Week 1", value:23 },
                      { name:"Week 2", value:31 },
                      { name:"Week 3", value:28 },
                      { name:"Week 4", value:45 },
                    ].map((item, idx) => {
                      const maxVal = 45;
                      const percentage = (item.value / maxVal) * 100;
                      return (
                        <div key={idx} style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:8, flex:1 }}>
                          <div style={{ width:"100%", height:`${percentage}%`, minHeight:20, background:"linear-gradient(180deg,#0ea5e9,#6366f1)", borderRadius:"6px 6px 0 0", cursor:"pointer", transition:"all .2s" }} onMouseEnter={e => { e.currentTarget.style.background="linear-gradient(180deg,#38bdf8,#818cf8)"; }} onMouseLeave={e => { e.currentTarget.style.background="linear-gradient(180deg,#0ea5e9,#6366f1)"; }}/>
                          <span style={{ fontSize:"11px", color:"#64748b", textAlign:"center" }}>{item.name}</span>
                          <span style={{ fontSize:"12px", fontWeight:600, color:"#cbd5e1" }}>{item.value}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Job Performance */}
                <div style={{ background:"#0f172a", border:"1px solid #1e293b", borderRadius:"16px", padding:"20px" }}>
                  <div style={{ marginBottom:"16px" }}>
                    <h3 style={{ fontSize:"14px", fontWeight:700, color:"#e2e8f0", marginBottom:2 }}>Top Performing Jobs</h3>
                    <p style={{ fontSize:"11px", color:"#64748b" }}>By applicant count</p>
                  </div>
                  <div style={{ display:"flex", alignItems:"flex-end", gap:8, height:160, justifyContent:"space-around" }}>
                    {(() => {
                      const jobData = realJobs.slice(0, 4).map(job => ({
                        name: job.title.substring(0, 10),
                        value: realApplicants.filter(a => a.job_id === job.id).length,
                      }));
                      const maxVal = Math.max(...jobData.map(d => d.value), 1);
                      return jobData.map((item, idx) => {
                        const percentage = (item.value / maxVal) * 100;
                        return (
                          <div key={idx} style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:8, flex:1 }}>
                            <div style={{ width:"100%", height:`${percentage}%`, minHeight:20, background:"linear-gradient(180deg,#8b5cf6,#a78bfa)", borderRadius:"6px 6px 0 0", cursor:"pointer", transition:"all .2s" }} onMouseEnter={e => { e.currentTarget.style.background="linear-gradient(180deg,#a78bfa,#c4b5fd)"; }} onMouseLeave={e => { e.currentTarget.style.background="linear-gradient(180deg,#8b5cf6,#a78bfa)"; }}/>
                            <span style={{ fontSize:"11px", color:"#64748b", textAlign:"center" }}>{item.name}</span>
                            <span style={{ fontSize:"12px", fontWeight:600, color:"#cbd5e1" }}>{item.value}</span>
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>
              </div>

              {/* Status Breakdown & Funnel */}
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(300px, 1fr))", gap:"16px", marginBottom:"20px" }}>
                {/* Status Breakdown */}
                <div style={{ background:"#0f172a", border:"1px solid #1e293b", borderRadius:"16px", padding:"20px" }}>
                  <h3 style={{ fontSize:"14px", fontWeight:700, color:"#e2e8f0", marginBottom:16 }}>Application Status</h3>
                  <div style={{ display:"flex", flexWrap:"wrap", gap:12 }}>
                    {(() => {
                      const statusBreakdown = realApplicants.reduce((acc, app) => {
                        const status = app.status || "applied";
                        const existing = acc.find(s => s.label === status);
                        if (existing) existing.value++;
                        else acc.push({ label: status, value: 1 });
                        return acc;
                      }, []);
                      const colors = ["#0ea5e9", "#8b5cf6", "#10b981", "#f97316"];
                      return statusBreakdown.map((item, idx) => (
                        <div key={idx} style={{ display:"flex", alignItems:"center", gap:8, background:"rgba(255,255,255,0.03)", padding:"8px 12px", borderRadius:8 }}>
                          <div style={{ width:8, height:8, borderRadius:"50%", background:colors[idx % colors.length] }}/>
                          <span style={{ fontSize:"12px", color:"#cbd5e1", fontWeight:600 }}>
                            {item.label}: <span style={{ color:"#38bdf8", fontWeight:700 }}>{item.value}</span>
                          </span>
                        </div>
                      ));
                    })()}
                  </div>
                </div>

                {/* Hiring Funnel */}
                <div style={{ background:"#0f172a", border:"1px solid #1e293b", borderRadius:"16px", padding:"20px" }}>
                  <h3 style={{ fontSize:"14px", fontWeight:700, color:"#e2e8f0", marginBottom:16 }}>Hiring Funnel</h3>
                  <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                    {(() => {
                      const total = realApplicants.length;
                      const funnelData = [
                        { label:"Applications", value: total },
                        { label:"Screened", value: Math.round(total * 0.7) },
                        { label:"Interview", value: Math.round(total * 0.35) },
                        { label:"Offer", value: Math.round(total * 0.15) },
                        { label:"Hired", value: Math.round(total * 0.1) },
                      ];
                      return funnelData.map((item, idx) => {
                        const percentage = (item.value / Math.max(...funnelData.map(d => d.value))) * 100;
                        const prevValue = idx > 0 ? funnelData[idx - 1].value : item.value;
                        const conversionRate = idx > 0 ? Math.round((item.value / prevValue) * 100) : 100;
                        return (
                          <div key={idx}>
                            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                              <span style={{ fontSize:"13px", fontWeight:600, color:"#cbd5e1" }}>{item.label}</span>
                              <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                                <span style={{ fontSize:"12px", fontWeight:700, color:"#38bdf8" }}>{item.value}</span>
                                {idx > 0 && <span style={{ fontSize:"11px", color:"#64748b" }}>({conversionRate}%)</span>}
                              </div>
                            </div>
                            <div style={{ width:`${percentage}%`, height:24, background:"linear-gradient(90deg,#0ea5e9,#6366f1)", borderRadius:6 }}/>
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>
              </div>

              {/* Top Recruiting Sources */}
              <div style={{ background:"#0f172a", border:"1px solid #1e293b", borderRadius:"16px", padding:"20px", marginBottom:"20px" }}>
                <h3 style={{ fontSize:"14px", fontWeight:700, color:"#e2e8f0", marginBottom:16 }}>Top Recruiting Sources</h3>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(200px, 1fr))", gap:16 }}>
                  {[
                    { source:"LinkedIn", count:145, conversion:"8.4%" },
                    { source:"Indeed", count:89, conversion:"6.2%" },
                    { source:"Referrals", count:52, conversion:"15.1%" },
                    { source:"Campus Drives", count:112, conversion:"9.8%" },
                  ].map((item, idx) => (
                    <div key={idx} style={{ padding:"12px", background:"rgba(255,255,255,0.03)", border:"1px solid #1e293b", borderRadius:10 }}>
                      <p style={{ fontSize:"12px", color:"#64748b", marginBottom:4 }}>{item.source}</p>
                      <p style={{ fontSize:"16px", fontWeight:700, color:"#38bdf8", marginBottom:6 }}>{item.count}</p>
                      <p style={{ fontSize:"11px", color:"#10b981" }}>📈 {item.conversion} conversion</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>

      <style>{`
        @media (max-width: 767px) { #main-content { margin-left: 0 !important; } }
        @media (max-width: 1023px) {
          #jobs-activity-grid { grid-template-columns: 1fr !important; }
          .applicant-table-header { display: none !important; }
          .applicant-row { grid-template-columns: 1fr 1fr !important; gap: 10px 16px !important; }
        }
      `}</style>
    </>
  );
}

export default RecruiterHome;