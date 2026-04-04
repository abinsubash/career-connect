import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

// ── Axios instance ────────────────────────────────────────────────────────────
const api = axios.create({
  credentials: "include", 
  baseURL: "http://127.0.0.1:5000",
  withCredentials: true,               // sends/receives HttpOnly cookie
  headers: { "Content-Type": "application/json" },
});

// ── Inline global styles ──────────────────────────────────────────────────────
const GlobalStyle = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500;600&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    .syne { font-family: 'Syne', sans-serif; }
    .grad { background: linear-gradient(135deg,#38bdf8,#818cf8); -webkit-background-clip:text; -webkit-text-fill-color:transparent; }
    .btn-grad { background: linear-gradient(135deg,#0ea5e9,#6366f1); }
    .btn-grad:hover { background: linear-gradient(135deg,#38bdf8,#818cf8); }

    .input-field {
      width:100%; background:rgba(255,255,255,0.04);
      border:1px solid rgba(255,255,255,0.1);
      border-radius:12px; padding:12px 16px;
      color:#f1f5f9; font-size:14px; outline:none;
      transition:border-color .2s, background .2s, box-shadow .2s;
      font-family:'DM Sans',sans-serif;
    }
    .input-field:focus {
      border-color:#38bdf8;
      background:rgba(56,189,248,0.05);
      box-shadow:0 0 0 3px rgba(56,189,248,0.1);
    }
    .input-field.error {
      border-color:#f87171 !important;
      background:rgba(248,113,113,0.05) !important;
      box-shadow:0 0 0 3px rgba(248,113,113,0.1) !important;
    }
    .input-field::placeholder { color:#475569; }
    select.input-field option { background:#0f172a; color:#f1f5f9; }

    @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
    .fu  { animation:fadeUp .45s ease forwards; }
    .fu1 { animation:fadeUp .45s .07s ease both; }
    .fu2 { animation:fadeUp .45s .14s ease both; }
    .fu3 { animation:fadeUp .45s .21s ease both; }
    .fu4 { animation:fadeUp .45s .28s ease both; }
    .fu5 { animation:fadeUp .45s .35s ease both; }

    @keyframes spin { to { transform:rotate(360deg); } }
    .spinner { animation:spin .7s linear infinite; }

    @keyframes shake {
      0%,100% { transform:translateX(0); }
      20%,60%  { transform:translateX(-6px); }
      40%,80%  { transform:translateX(6px); }
    }
    .shake { animation:shake .35s ease; }

    @keyframes slideDown { from{opacity:0;transform:translateY(-6px)} to{opacity:1;transform:translateY(0)} }
    .err-msg { animation:slideDown .2s ease forwards; }

    .panel-dots {
      background-image:radial-gradient(rgba(255,255,255,0.06) 1px,transparent 1px);
      background-size:22px 22px;
    }
    ::-webkit-scrollbar { width:4px; }
    ::-webkit-scrollbar-thumb { background:#1e293b; border-radius:4px; }
  `}</style>
);

// ── Icons ─────────────────────────────────────────────────────────────────────
const EyeOff = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);
const EyeOn = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);
const Logo = () => (
  <div style={{ display:"flex", alignItems:"center" }}>
    <span className="syne" style={{ fontWeight:800, fontSize:"1.25rem", background:"linear-gradient(135deg,#38bdf8,#818cf8)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>NexWork</span>
    <span style={{ marginLeft:"6px", fontSize:"10px", fontWeight:700, color:"#38bdf8", background:"rgba(56,189,248,0.1)", border:"1px solid rgba(56,189,248,0.2)", padding:"2px 6px", borderRadius:"9999px" }}>Recruiter</span>
  </div>
);
const Spinner = () => (
  <svg width="16" height="16" className="spinner" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
  </svg>
);
const ErrorIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ flexShrink:0 }}>
    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
);

// ── Validation ────────────────────────────────────────────────────────────────
const VALIDATORS = {
  email: v => {
    if (!v.trim()) return "Email is required.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return "Enter a valid email address.";
    return null;
  },
  password: v => {
    if (!v) return "Password is required.";
    if (v.length < 6) return "Password must be at least 6 characters.";
    return null;
  },
};

const ErrorMsg = ({ msg }) =>
  msg ? (
    <div className="err-msg" style={{ display:"flex", alignItems:"center", gap:5, marginTop:6, color:"#f87171", fontSize:12, fontWeight:500 }}>
      <ErrorIcon /> {msg}
    </div>
  ) : null;

// ── Component ─────────────────────────────────────────────────────────────────
export function LoginPage_recruiter() {
  const navigate = useNavigate();

  const [f, setF]           = useState({ email: "", password: "" });
  const [errs, setErrs]     = useState({});
  const [apiErr, setApiErr] = useState("");
  const [show, setShow]     = useState(false);
  const [busy, setBusy]     = useState(false);
  const [shaking, setShaking] = useState(false);

  const set = e => {
    const { name, value } = e.target;
    setF(prev => ({ ...prev, [name]: value }));
    if (errs[name]) setErrs(prev => ({ ...prev, [name]: null }));
    if (apiErr)     setApiErr("");
  };

  const validate = () => {
    const newErrs = {};
    Object.keys(VALIDATORS).forEach(k => {
      const msg = VALIDATORS[k](f[k]);
      if (msg) newErrs[k] = msg;
    });
    setErrs(newErrs);
    return Object.keys(newErrs).length === 0;
  };

  const shake = () => {
    setShaking(true);
    setTimeout(() => setShaking(false), 400);
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const submit = async e => {
    e.preventDefault();
    if (!validate()) { shake(); return; }

    setBusy(true);
    setApiErr("");

    try {
      await api.post("/api/auth/recruiter/login", {
        email:    f.email.trim().toLowerCase(),
        password: f.password,
      });

      // Success — JWT stored in HttpOnly cookie by backend
      navigate("/recruiter/home");

    } catch (err) {
      const status = err.response?.status;
      const msg =
        status === 401 ? "Incorrect email or password." :
        status === 422 ? (err.response.data?.error || "Invalid input.") :
        status === 429 ? "Too many attempts. Please wait a moment." :
        err.response?.data?.error || "Something went wrong. Please try again.";

      // No response at all = network error
      const finalMsg = err.request && !err.response
        ? "Network error. Check your connection and try again."
        : msg;

      setApiErr(finalMsg);
      shake();
    } finally {
      setBusy(false);
    }
  };

  const labelSt = {
    display:"block", fontSize:"11px", fontWeight:700,
    color:"#94a3b8", marginBottom:"8px",
    textTransform:"uppercase", letterSpacing:"0.1em",
  };

  return (
    <>
      <GlobalStyle />

      <div style={{ minHeight:"100vh", display:"flex", fontFamily:"'DM Sans',sans-serif", background:"#020817" }}>

        {/* ══ LEFT PANEL ══ */}
        <div
          id="left-panel"
          className="panel-dots"
          style={{ flex:"0 0 50%", maxWidth:"50%", display:"flex", flexDirection:"column", justifyContent:"space-between", padding:"56px", position:"relative", overflow:"hidden", background:"linear-gradient(145deg,#0c1220,#0f172a,#0c1628)" }}
        >
          <div style={{ position:"absolute", top:"-96px", left:"-96px", width:"384px", height:"384px", borderRadius:"9999px", opacity:.2, filter:"blur(64px)", pointerEvents:"none", background:"radial-gradient(circle,#0ea5e9,transparent)" }}/>
          <div style={{ position:"absolute", bottom:"-80px", right:"-80px", width:"320px", height:"320px", borderRadius:"9999px", opacity:.15, filter:"blur(64px)", pointerEvents:"none", background:"radial-gradient(circle,#6366f1,transparent)" }}/>

          <div className="fu"><Logo /></div>

          <div className="fu1">
            <p style={{ color:"#64748b", fontSize:"11px", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.15em", marginBottom:"16px" }}>Hiring Platform</p>
            <h1 className="syne" style={{ fontSize:"clamp(2.2rem,3.5vw,3rem)", fontWeight:800, color:"#fff", lineHeight:1.2, marginBottom:"20px" }}>
              Find the<br/><span className="grad">right talent.</span><br/>Fast.
            </h1>
            <p style={{ color:"#94a3b8", fontSize:"15px", lineHeight:1.7, maxWidth:"340px" }}>
              Post jobs, manage applications, and connect with thousands of qualified candidates — all in one place.
            </p>
          </div>

          <div className="fu2" style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"16px" }}>
            {[["12k+","Active Candidates"],["3.8k","Jobs Posted"],["94%","Hire Rate"]].map(([n,l]) => (
              <div key={l} style={{ background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:"16px", padding:"16px" }}>
                <p className="syne" style={{ fontSize:"1.5rem", fontWeight:800, color:"#38bdf8" }}>{n}</p>
                <p style={{ color:"#64748b", fontSize:"11px", marginTop:"4px" }}>{l}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ══ RIGHT PANEL ══ */}
        <div style={{ flex:"1 1 50%", display:"flex", alignItems:"center", justifyContent:"center", padding:"48px 32px", overflowY:"auto" }}>
          <div style={{ width:"100%", maxWidth:"420px" }}>

            <div id="mobile-logo" className="fu" style={{ marginBottom:"32px", textAlign:"center" }}>
              <Logo />
            </div>

            <div className="fu1" style={{ marginBottom:"32px" }}>
              <h2 className="syne" style={{ fontSize:"clamp(1.6rem,3vw,1.875rem)", fontWeight:800, color:"#fff", marginBottom:"6px" }}>Welcome back</h2>
              <p style={{ color:"#64748b", fontSize:"14px" }}>Sign in to your recruiter dashboard</p>
            </div>

            {/* API error banner */}
            {apiErr && (
              <div className="fu err-msg" style={{ display:"flex", alignItems:"center", gap:10, background:"rgba(248,113,113,0.08)", border:"1px solid rgba(248,113,113,0.25)", borderRadius:12, padding:"12px 16px", marginBottom:20, color:"#fca5a5", fontSize:13, fontWeight:500 }}>
                <ErrorIcon />
                {apiErr}
              </div>
            )}

            <form onSubmit={submit} noValidate style={{ display:"flex", flexDirection:"column", gap:"20px" }}>

              {/* Email */}
              <div className={`fu2 ${shaking ? "shake" : ""}`}>
                <label style={labelSt}>Email Address</label>
                <input
                  name="email" type="email" autoComplete="email"
                  placeholder="recruiter@company.com"
                  value={f.email} onChange={set}
                  className={`input-field ${errs.email ? "error" : ""}`}
                />
                <ErrorMsg msg={errs.email} />
              </div>

              {/* Password */}
              <div className={`fu3 ${shaking ? "shake" : ""}`}>
                <label style={labelSt}>Password</label>
                <div style={{ position:"relative" }}>
                  <input
                    name="password" type={show ? "text" : "password"} autoComplete="current-password"
                    placeholder="••••••••"
                    value={f.password} onChange={set}
                    className={`input-field ${errs.password ? "error" : ""}`}
                    style={{ paddingRight:"48px" }}
                  />
                  <button
                    type="button" onClick={() => setShow(s => !s)}
                    style={{ position:"absolute", right:"12px", top:"50%", transform:"translateY(-50%)", color:"#64748b", background:"none", border:"none", cursor:"pointer", display:"flex", alignItems:"center", transition:"color .2s" }}
                    onMouseEnter={e => e.currentTarget.style.color="#cbd5e1"}
                    onMouseLeave={e => e.currentTarget.style.color="#64748b"}
                    tabIndex={-1}
                  >
                    {show ? <EyeOff /> : <EyeOn />}
                  </button>
                </div>
                <ErrorMsg msg={errs.password} />
                <div style={{ display:"flex", justifyContent:"flex-end", marginTop:"8px" }}>
                  <button
                    type="button"
                    style={{ fontSize:"12px", color:"#38bdf8", background:"none", border:"none", cursor:"pointer", transition:"color .2s" }}
                    onMouseEnter={e => e.currentTarget.style.color="#7dd3fc"}
                    onMouseLeave={e => e.currentTarget.style.color="#38bdf8"}
                  >
                    Forgot password?
                  </button>
                </div>
              </div>

              {/* Submit */}
              <div className="fu4">
                <button
                  type="submit" disabled={busy}
                  className="btn-grad"
                  style={{ width:"100%", padding:"14px", borderRadius:"12px", color:"#fff", fontWeight:600, fontSize:"14px", border:"none", cursor:busy?"not-allowed":"pointer", opacity:busy?.7:1, display:"flex", alignItems:"center", justifyContent:"center", gap:"8px", transition:"all .2s", fontFamily:"'DM Sans',sans-serif" }}
                  onMouseEnter={e => { if (!busy) e.currentTarget.style.transform="translateY(-2px)"; }}
                  onMouseLeave={e => { e.currentTarget.style.transform="translateY(0)"; }}
                >
                  {busy ? <><Spinner /> Signing in…</> : "Sign In to Dashboard →"}
                </button>
              </div>

              {/* Divider */}
              <div className="fu4" style={{ display:"flex", alignItems:"center", gap:"12px" }}>
                <div style={{ flex:1, height:"1px", background:"#1e293b" }}/>
                <span style={{ fontSize:"12px", color:"#334155" }}>or</span>
                <div style={{ flex:1, height:"1px", background:"#1e293b" }}/>
              </div>

              {/* Google */}
              <div className="fu5">
                <button
                  type="button"
                  style={{ width:"100%", padding:"12px", borderRadius:"12px", border:"1px solid #334155", background:"rgba(255,255,255,0.03)", color:"#cbd5e1", fontSize:"14px", fontWeight:500, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:"8px", transition:"all .2s", fontFamily:"'DM Sans',sans-serif" }}
                  onMouseEnter={e => { e.currentTarget.style.background="rgba(255,255,255,0.06)"; e.currentTarget.style.borderColor="#475569"; }}
                  onMouseLeave={e => { e.currentTarget.style.background="rgba(255,255,255,0.03)"; e.currentTarget.style.borderColor="#334155"; }}
                >
                  <svg style={{ width:"16px", height:"16px", flexShrink:0 }} viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continue with Google
                </button>
              </div>
            </form>

            <p className="fu5" style={{ textAlign:"center", fontSize:"14px", color:"#475569", marginTop:"32px" }}>
              Don't have an account?{" "}
              <button
                onClick={() => navigate("/recruiter/signup")}
                style={{ color:"#38bdf8", fontWeight:600, background:"none", border:"none", cursor:"pointer", transition:"color .2s" }}
                onMouseEnter={e => e.currentTarget.style.color="#7dd3fc"}
                onMouseLeave={e => e.currentTarget.style.color="#38bdf8"}
              >
                Create one →
              </button>
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width:1023px) {
          #left-panel  { display:none !important; }
          #mobile-logo { display:flex !important; justify-content:center; }
        }
        @media (min-width:1024px) {
          #mobile-logo { display:none !important; }
        }
      `}</style>
    </>
  );
}

export default LoginPage_recruiter;