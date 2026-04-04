import { useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";

// ── Inline global styles ─────────────────────────────────────────────────────
const GlobalStyle = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500;600&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    .syne { font-family: 'Syne', sans-serif; }
    .grad { background: linear-gradient(135deg,#38bdf8,#818cf8); -webkit-background-clip:text; -webkit-text-fill-color:transparent; }
    .btn-grad { background: linear-gradient(135deg,#0ea5e9,#6366f1); }
    .btn-grad:hover { background: linear-gradient(135deg,#38bdf8,#818cf8); }
    .input-field { width:100%; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.1); border-radius:12px; padding:12px 16px; color:#f1f5f9; font-size:14px; outline:none; transition:all .2s; font-family:'DM Sans',sans-serif; }
    .input-field:focus { border-color:#38bdf8; background:rgba(56,189,248,0.05); box-shadow:0 0 0 3px rgba(56,189,248,0.1); }
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
    .step-progress { transition:width .4s cubic-bezier(.4,0,.2,1); }
    .panel-dots { background-image:radial-gradient(rgba(255,255,255,0.06) 1px,transparent 1px); background-size:22px 22px; }
    ::-webkit-scrollbar { width:4px; }
    ::-webkit-scrollbar-thumb { background:#1e293b; border-radius:4px; }

    @media (max-width: 1023px) {
      #left-panel-signup { display: none !important; }
      #mobile-logo-signup { display: flex !important; justify-content: center; }
    }
    @media (min-width: 1024px) {
      #mobile-logo-signup { display: none !important; }
    }
  `}</style>
);

const next = async (e) => {
  e.preventDefault();
  if (step < 2) {
    setStep(step + 1);
    return;
  }
  // Final step — submit
  setBusy(true);
  try {
    await axios.post("http://127.0.0.1:5000/api/auth/recruiter/signup", {
      name:       f.name,
      email:      f.email,
      password:   f.password,
      company:    f.company,
      website:    f.website,
      size:       f.size,
      role:       f.role,
      department: f.department,
    });
    navigate("/recruiter/home");
  } catch (err) {
    const msg = err?.response?.data?.message || "Signup failed. Please try again.";
    alert(msg);
  } finally {
    setBusy(false);
  }
};
// ── Icons & Logo ─────────────────────────────────────────────────────────────
const EyeOffSm = () => (
  <svg style={{ width:20, height:20 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);
const EyeOnSm = () => (
  <svg style={{ width:20, height:20 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);
const CheckIcon = () => (
  <svg style={{ width:14, height:14 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);
const Logo = () => (
  <div style={{ display:"flex", alignItems:"center" }}>
    <span className="syne" style={{ fontWeight:800, fontSize:"1.25rem", background:"linear-gradient(135deg,#38bdf8,#818cf8)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>NexWork</span>
    <span style={{ marginLeft:"6px", fontSize:"10px", fontWeight:700, color:"#38bdf8", background:"rgba(56,189,248,0.1)", border:"1px solid rgba(56,189,248,0.2)", padding:"2px 6px", borderRadius:"9999px" }}>Recruiter</span>
  </div>
);
const Spinner = () => (
  <svg className="spinner" style={{ width:16, height:16 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
  </svg>
);

// ── Step labels ───────────────────────────────────────────────────────────────
const STEPS = ["Account", "Company", "Role"];


// ── Component ────────────────────────────────────────────────────────────────
export function SignupPage_recruiter({ go }) {
  const [step, setStep] = useState(0);
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [f, setF] = useState({ name:"", email:"", password:"", company:"", website:"", size:"", role:"", department:"" });
  const set = e => setF({ ...f, [e.target.name]: e.target.value });
  const navigate = useNavigate();

  const next = async (e) => {
     e.preventDefault();
    if (step < 2) {
      setStep(step + 1);
      return;
    }
    setBusy(true);
    try {
      await axios.post("http://127.0.0.1:5000/api/auth/recruiter/signup", {
        name:       f.name,
        email:      f.email,
        password:   f.password,
        company:    f.company,
        website:    f.website,
        size:       f.size,
        role:       f.role,
        department: f.department,
      });
      navigate("/recruiter/home");
    } catch (err) {
      const msg = err?.response?.data?.message || "Signup failed. Please try again.";
      alert(msg);
    } finally {
      setBusy(false);
    }
  };


  const pwStrength = f.password.length < 4 ? "Weak" : f.password.length < 8 ? "Fair" : "Strong";
  const pwColor    = f.password.length < 4 ? "#ef4444" : f.password.length < 8 ? "#f59e0b" : "#38bdf8";

  return (
    <>
      <GlobalStyle />

      <div style={{ minHeight:"100vh", display:"flex", fontFamily:"'DM Sans',sans-serif", background:"#020817" }}>

        {/* ══ LEFT PANEL ══════════════════════════════════════════════════ */}
        <div
          id="left-panel-signup"
          className="panel-dots"
          style={{
            flex: "0 0 41.666%",
            maxWidth: "41.666%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "48px",
            position: "relative",
            overflow: "hidden",
            background: "linear-gradient(145deg,#0c1220,#0f172a,#0c1628)",
          }}
        >
          {/* Glow orbs */}
          <div style={{ position:"absolute", top:"-80px", right:"-64px", width:"320px", height:"320px", borderRadius:"9999px", opacity:0.15, filter:"blur(64px)", pointerEvents:"none", background:"radial-gradient(circle,#6366f1,transparent)" }}/>
          <div style={{ position:"absolute", bottom:"-64px", left:"-64px", width:"256px", height:"256px", borderRadius:"9999px", opacity:0.15, filter:"blur(64px)", pointerEvents:"none", background:"radial-gradient(circle,#0ea5e9,transparent)" }}/>

          {/* Logo */}
          <div><Logo /></div>

          {/* Headline & features */}
          <div>
            <p style={{ color:"#64748b", fontSize:"11px", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.15em", marginBottom:"16px" }}>Join 3,800+ recruiters</p>
            <h1 className="syne" style={{ fontSize:"clamp(2rem,3vw,2.5rem)", fontWeight:800, color:"#fff", lineHeight:1.25, marginBottom:"20px" }}>
              Start hiring<br/><span className="grad">smarter today.</span>
            </h1>
            <p style={{ color:"#94a3b8", fontSize:"14px", lineHeight:1.7, maxWidth:"300px", marginBottom:"32px" }}>
              Create your recruiter account in 3 simple steps and start reaching top talent within minutes.
            </p>
            <div style={{ display:"flex", flexDirection:"column", gap:"12px" }}>
              {[
                "Post unlimited job listings",
                "AI-matched candidate suggestions",
                "Real-time application tracking",
                "Direct messaging with applicants",
              ].map(t => (
                <div key={t} style={{ display:"flex", alignItems:"center", gap:"12px" }}>
                  <span style={{ color:"#38bdf8", fontSize:"14px", flexShrink:0 }}>✦</span>
                  <span style={{ color:"#cbd5e1", fontSize:"14px" }}>{t}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Footer note */}
          <p style={{ color:"#334155", fontSize:"12px" }}>By signing up you agree to our Terms & Privacy Policy.</p>
        </div>

        {/* ══ RIGHT PANEL ═════════════════════════════════════════════════ */}
        <div
          style={{
            flex: "1 1 0%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "48px 32px",
            overflowY: "auto",
          }}
        >
          <div style={{ width:"100%", maxWidth:"448px" }}>

            {/* Mobile logo */}
            <div id="mobile-logo-signup" className="fu" style={{ marginBottom:"32px" }}>
              <Logo />
            </div>

            {/* ── Step indicator ─────────────────────────────────────── */}
            <div className="fu" style={{ marginBottom:"28px" }}>
              {/* Dots row */}
              <div style={{ display:"flex", alignItems:"center", marginBottom:"12px" }}>
                {STEPS.map((s, i) => (
                  <div key={s} style={{ display:"flex", alignItems:"center", flex: i < STEPS.length - 1 ? "1" : "none" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:"8px" }}>
                      {/* Circle */}
                      <div style={{
                        width:"28px", height:"28px", borderRadius:"9999px",
                        display:"flex", alignItems:"center", justifyContent:"center",
                        fontSize:"12px", fontWeight:700,
                        flexShrink: 0,
                        transition:"all .3s",
                        background: i <= step ? "linear-gradient(135deg,#0ea5e9,#6366f1)" : "rgba(255,255,255,0.06)",
                        color: i <= step ? "#fff" : "#64748b",
                        border: i <= step ? "none" : "1px solid rgba(255,255,255,0.08)",
                      }}>
                        {i < step
                          ? <CheckIcon />
                          : <span>{i + 1}</span>
                        }
                      </div>
                      {/* Label */}
                      <span style={{ fontSize:"12px", fontWeight:600, color: i <= step ? "#cbd5e1" : "#475569", whiteSpace:"nowrap" }}>{s}</span>
                    </div>
                    {/* Connector line */}
                    {i < STEPS.length - 1 && (
                      <div style={{ flex:1, height:"1px", margin:"0 12px", background: i < step ? "#0ea5e9" : "#1e293b", transition:"background .3s" }}/>
                    )}
                  </div>
                ))}
              </div>

              {/* Progress bar */}
              <div style={{ height:"4px", background:"rgba(255,255,255,0.06)", borderRadius:"9999px", overflow:"hidden" }}>
                <div
                  className="step-progress"
                  style={{
                    height:"100%", borderRadius:"9999px",
                    width:`${((step + 1) / STEPS.length) * 100}%`,
                    background:"linear-gradient(90deg,#0ea5e9,#6366f1)",
                  }}
                />
              </div>
            </div>

            {/* ── Form ───────────────────────────────────────────────── */}
            <form onSubmit={next} style={{ display:"flex", flexDirection:"column", gap:"18px" }}>

              {/* STEP 0 — Account */}
              {step === 0 && <>
                <div className="fu1" style={{ marginBottom:"4px" }}>
                  <h2 className="syne" style={{ fontSize:"clamp(1.4rem,2.5vw,1.6rem)", fontWeight:800, color:"#fff" }}>Create your account</h2>
                  <p style={{ color:"#64748b", fontSize:"14px", marginTop:"4px" }}>Your personal login credentials</p>
                </div>

                <div className="fu1">
                  <label style={labelStyle}>Full Name</label>
                  <input name="name" type="text" required placeholder="Jane Doe" value={f.name} onChange={set} className="input-field"/>
                </div>

                <div className="fu2">
                  <label style={labelStyle}>Work Email</label>
                  <input name="email" type="email" required placeholder="jane@company.com" value={f.email} onChange={set} className="input-field"/>
                </div>

                <div className="fu3">
                  <label style={labelStyle}>Password</label>
                  <div style={{ position:"relative" }}>
                    <input
                      name="password" type={show ? "text" : "password"} required
                      placeholder="Min. 8 characters" value={f.password} onChange={set}
                      className="input-field" style={{ paddingRight:"48px" }}
                    />
                    <button
                      type="button" onClick={() => setShow(!show)}
                      style={{ position:"absolute", right:"12px", top:"50%", transform:"translateY(-50%)", color:"#64748b", background:"none", border:"none", cursor:"pointer", display:"flex", alignItems:"center", transition:"color .2s" }}
                      onMouseEnter={e => e.currentTarget.style.color="#cbd5e1"}
                      onMouseLeave={e => e.currentTarget.style.color="#64748b"}
                    >
                      {show ? <EyeOffSm /> : <EyeOnSm />}
                    </button>
                  </div>
                  {f.password.length > 0 && (
                    <div style={{ marginTop:"8px", display:"flex", alignItems:"center", gap:"4px" }}>
                      {[1,2,3,4].map(i => (
                        <div key={i} style={{ flex:1, height:"4px", borderRadius:"9999px", transition:"background .3s", background: f.password.length >= i * 2 ? pwColor : "rgba(255,255,255,0.06)" }}/>
                      ))}
                      <span style={{ fontSize:"11px", marginLeft:"8px", color:"#64748b", minWidth:"36px" }}>{pwStrength}</span>
                    </div>
                  )}
                </div>
              </>}

              {/* STEP 1 — Company */}
              {step === 1 && <>
                <div className="fu1" style={{ marginBottom:"4px" }}>
                  <h2 className="syne" style={{ fontSize:"clamp(1.4rem,2.5vw,1.6rem)", fontWeight:800, color:"#fff" }}>Company info</h2>
                  <p style={{ color:"#64748b", fontSize:"14px", marginTop:"4px" }}>Tell us about your organization</p>
                </div>

                <div className="fu1">
                  <label style={labelStyle}>Company Name</label>
                  <input name="company" type="text" required placeholder="Acme Corp" value={f.company} onChange={set} className="input-field"/>
                </div>

                <div className="fu2">
                  <label style={labelStyle}>Website</label>
                  <input name="website" type="url" placeholder="https://yourcompany.com" value={f.website} onChange={set} className="input-field"/>
                </div>

                <div className="fu3">
                  <label style={labelStyle}>Company Size</label>
                  <select name="size" required value={f.size} onChange={set} className="input-field">
                    <option value="">Select size</option>
                    {["1–10","11–50","51–200","201–1000","1000+"].map(s => (
                      <option key={s}>{s} employees</option>
                    ))}
                  </select>
                </div>
              </>}

              {/* STEP 2 — Role */}
              {step === 2 && <>
                <div className="fu1" style={{ marginBottom:"4px" }}>
                  <h2 className="syne" style={{ fontSize:"clamp(1.4rem,2.5vw,1.6rem)", fontWeight:800, color:"#fff" }}>Your role</h2>
                  <p style={{ color:"#64748b", fontSize:"14px", marginTop:"4px" }}>Help us personalize your experience</p>
                </div>

                <div className="fu1">
                  <label style={labelStyle}>Job Title</label>
                  <input name="role" type="text" required placeholder="e.g. HR Manager" value={f.role} onChange={set} className="input-field"/>
                </div>

                <div className="fu2">
                  <label style={labelStyle}>Department</label>
                  <select name="department" required value={f.department} onChange={set} className="input-field">
                    <option value="">Select department</option>
                    {["Human Resources","Talent Acquisition","Engineering","Product","Operations","Finance","Marketing"].map(d => (
                      <option key={d}>{d}</option>
                    ))}
                  </select>
                </div>

                {/* Summary card */}
                <div className="fu3" style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:"16px", padding:"16px" }}>
                  <p style={{ fontSize:"11px", fontWeight:700, color:"#64748b", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:"12px" }}>Summary</p>
                  {[["Name", f.name], ["Email", f.email], ["Company", f.company], ["Size", f.size]].map(([k, v]) => (
                    <div key={k} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"8px 0", borderBottom:"1px solid rgba(255,255,255,0.05)" }}
                      className="last-no-border">
                      <span style={{ color:"#64748b", fontSize:"13px" }}>{k}</span>
                      <span style={{ color:"#e2e8f0", fontWeight:500, fontSize:"13px" }}>{v || "—"}</span>
                    </div>
                  ))}
                </div>
              </>}

              {/* Navigation buttons */}
              <div className="fu4" style={{ display:"flex", gap:"12px", paddingTop:"4px" }}>
                {step > 0 && (
                  <button
                    type="button" onClick={() => setStep(step - 1)}
                    style={{ flex:1, padding:"13px", borderRadius:"12px", border:"1px solid #334155", background:"transparent", color:"#cbd5e1", fontSize:"14px", fontWeight:600, cursor:"pointer", transition:"all .2s", fontFamily:"'DM Sans',sans-serif" }}
                    onMouseEnter={e => e.currentTarget.style.background="rgba(255,255,255,0.06)"}
                    onMouseLeave={e => e.currentTarget.style.background="transparent"}
                  >
                    ← Back
                  </button>
                )}
                <button
                  type="submit" disabled={busy}
                  className="btn-grad"
                  style={{ flex:1, padding:"13px", borderRadius:"12px", border:"none", color:"#fff", fontSize:"14px", fontWeight:600, cursor:busy?"not-allowed":"pointer", opacity:busy?0.6:1, display:"flex", alignItems:"center", justifyContent:"center", gap:"8px", transition:"all .2s", fontFamily:"'DM Sans',sans-serif" }}
                  onMouseEnter={e => { if (!busy) e.currentTarget.style.transform="translateY(-2px)"; }}
                  onMouseLeave={e => { e.currentTarget.style.transform="translateY(0)"; }}
                >
                  {busy ? <><Spinner />Creating...</> : step < 2 ? "Continue →" : "Create Account →"}
                </button>
              </div>
            </form>

            {/* Sign in link */}
            <p className="fu5" style={{ textAlign:"center", fontSize:"14px", color:"#475569", marginTop:"28px" }}>
              Already have an account?{" "}
              <button
                onClick={() => navigate("/recruiter/login")}
                style={{ color:"#38bdf8", fontWeight:600, background:"none", border:"none", cursor:"pointer", transition:"color .2s" }}
                onMouseEnter={e => e.currentTarget.style.color="#7dd3fc"}
                onMouseLeave={e => e.currentTarget.style.color="#38bdf8"}
              >
                Sign in →
              </button>
            </p>

          </div>
        </div>
      </div>

      {/* Remove border from last summary row */}
      <style>{`.last-no-border:last-child { border-bottom: none !important; }`}</style>
    </>
  );
}

// ── Shared label style ────────────────────────────────────────────────────────
const labelStyle = {
  display: "block",
  fontSize: "11px",
  fontWeight: 700,
  color: "#94a3b8",
  marginBottom: "8px",
  textTransform: "uppercase",
  letterSpacing: "0.1em",
};

export default SignupPage_recruiter;