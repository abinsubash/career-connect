import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  authStarting,
  signupSuccess,
  authError,
  clearError,
} from "../../redux/authSlice";
import { authAPI } from "../../api/authAPI";

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
    .input-field.error { border-color:#ef4444 !important; background:rgba(239,68,68,0.05) !important; }
    .input-field.error:focus { box-shadow:0 0 0 3px rgba(239,68,68,0.1) !important; }
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
    .error-text { color:#ef4444; font-size:12px; margin-top:6px; display:flex; align-items:center; gap:6px; }
    .error-icon { width:14px; height:14px; flex-shrink:0; }

    @media (max-width: 1023px) {
      #left-panel-signup { display: none !important; }
      #mobile-logo-signup { display: flex !important; justify-content: center; }
    }
    @media (min-width: 1024px) {
      #mobile-logo-signup { display: none !important; }
    }
  `}</style>
);

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
const ErrorIcon = () => (
  <svg className="error-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" y1="8" x2="12" y2="12"/>
    <line x1="12" y1="16" x2="12.01" y2="16"/>
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

// ── Validation rules ───────────────────────────────────────────────────────────
const validateField = (name, value) => {
  switch (name) {
    case "name":
      if (!value.trim()) return "Full name is required";
      if (value.trim().length < 2) return "Full name must be at least 2 characters";
      if (value.trim().length > 100) return "Full name must not exceed 100 characters";
      return "";
    
    case "email":
      if (!value.trim()) return "Email is required";
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) return "Please enter a valid email address";
      return "";
    
    case "password":
      if (!value) return "Password is required";
      if (value.length < 8) return "Password must be at least 8 characters";
      if (value.length > 128) return "Password must not exceed 128 characters";
      if (!/[A-Z]/.test(value)) return "Password must contain at least one uppercase letter";
      if (!/[a-z]/.test(value)) return "Password must contain at least one lowercase letter";
      if (!/[0-9]/.test(value)) return "Password must contain at least one number";
      return "";
    
    case "company":
      if (!value.trim()) return "Company name is required";
      if (value.trim().length < 2) return "Company name must be at least 2 characters";
      if (value.trim().length > 100) return "Company name must not exceed 100 characters";
      return "";
    
    case "website":
      if (value.trim() && !isValidUrl(value)) return "Please enter a valid website URL";
      return "";
    
    case "size":
      if (!value) return "Company size is required";
      return "";
    
    case "role":
      if (!value.trim()) return "Job title is required";
      if (value.trim().length < 2) return "Job title must be at least 2 characters";
      if (value.trim().length > 100) return "Job title must not exceed 100 characters";
      return "";
    
    case "department":
      if (!value) return "Department is required";
      return "";
    
    default:
      return "";
  }
};

const isValidUrl = (string) => {
  try {
    new URL(string.startsWith("http") ? string : `https://${string}`);
    return true;
  } catch (_) {
    return false;
  }
};



// ── Component ────────────────────────────────────────────────────────────────
export function SignupPage_recruiter({ go }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticating, error } = useSelector((state) => state.auth);

  const [step, setStep] = useState(0);
  const [show, setShow] = useState(false);
  const [f, setF] = useState({ name:"", email:"", password:"", company:"", website:"", size:"", role:"", department:"" });
  const [fieldErrors, setFieldErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Handle field change
  const set = e => {
    const { name, value } = e.target;
    setF({ ...f, [name]: value });
    // Clear error when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors({ ...fieldErrors, [name]: "" });
    }
    if (error) {
      dispatch(clearError());
    }
  };

  // Handle field blur for validation
  const handleBlur = e => {
    const { name, value } = e.target;
    setTouched({ ...touched, [name]: true });
    const error = validateField(name, value);
    if (error) {
      setFieldErrors({ ...fieldErrors, [name]: error });
    }
  };

  // Validate all fields in current step
  const validateStep = () => {
    let stepFields = [];
    if (step === 0) stepFields = ["name", "email", "password"];
    else if (step === 1) stepFields = ["company", "size"];
    else if (step === 2) stepFields = ["role", "department"];

    const newErrors = {};
    let isValid = true;

    stepFields.forEach(field => {
      const error = validateField(field, f[field]);
      if (error) {
        newErrors[field] = error;
        isValid = false;
      }
    });

    setFieldErrors({ ...fieldErrors, ...newErrors });
    stepFields.forEach(field => setTouched(prev => ({ ...prev, [field]: true })));
    return isValid;
  };

  // Handle next/submit
  const next = async (e) => {
    e.preventDefault();

    // Validate current step
    if (!validateStep()) {
      return;
    }

    // Move to next step or submit
    if (step < 2) {
      setStep(step + 1);
      return;
    }

    // Final step - submit
    dispatch(authStarting());
    try {
      const response = await authAPI.recruiterSignup({
        name:       f.name,
        email:      f.email,
        password:   f.password,
        company:    f.company,
        website:    f.website,
        size:       f.size,
        role:       f.role,
        department: f.department,
      });

      const token = response.token;
      const recruiter = response.recruiter;
      
      // ✅ Save to localStorage BEFORE navigating or dispatching
      // This ensures axios interceptor can find the token immediately
      if (token && recruiter) {
        localStorage.setItem("recruiter_auth", JSON.stringify({ recruiter, token }));
        localStorage.setItem("token", token);
      }

      // Now dispatch to Redux
      dispatch(
        signupSuccess({
          recruiter: recruiter,
          token: token || "jwt-token",
        })
      );

      // Navigate
      navigate("/recruiter/home");
    } catch (err) {
      const msg = err?.response?.data?.message || err?.response?.data?.error || "Signup failed. Please try again.";
      dispatch(authError(msg));
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

            {/* ── API Error Alert ───────────────────────────────────────────────────── */}
            {error && (
              <div className="fu1" style={{ background:"rgba(239,68,68,0.1)", border:"1px solid rgba(239,68,68,0.3)", borderRadius:"12px", padding:"12px 16px", marginBottom:"16px" }}>
                <div style={{ display:"flex", alignItems:"flex-start", gap:"12px" }}>
                  <ErrorIcon />
                  <p style={{ color:"#fca5a5", fontSize:"14px", lineHeight:1.5 }}>{error}</p>
                </div>
              </div>
            )}

            {/* ── Form ───────────────────────────────────────────────── */}
            <form onSubmit={next} style={{ display:"flex", flexDirection:"column", gap:"18px" }}>

              {/* STEP 0 — Account */}
              {step === 0 && <>
                <div className="fu1" style={{ marginBottom:"4px" }}>
                  <h2 className="syne" style={{ fontSize:"clamp(1.4rem,2.5vw,1.6rem)", fontWeight:800, color:"#fff" }}>Create your account</h2>
                  <p style={{ color:"#64748b", fontSize:"14px", marginTop:"4px" }}>Your personal login credentials</p>
                </div>

                {/* Full Name */}
                <div className="fu1">
                  <label style={labelStyle}>Full Name</label>
                  <input 
                    name="name" 
                    type="text"  
                    placeholder="Jane Doe" 
                    value={f.name} 
                    onChange={set}
                    onBlur={handleBlur}
                    className={`input-field ${fieldErrors.name ? "error" : ""}`}
                  />
                  {fieldErrors.name && touched.name && (
                    <div className="error-text">
                      <ErrorIcon />
                      {fieldErrors.name}
                    </div>
                  )}
                </div>

                {/* Email */}
                <div className="fu2">
                  <label style={labelStyle}>Work Email</label>
                  <input 
                    name="email" 
                    type="email" 
                    placeholder="jane@company.com" 
                    value={f.email} 
                    onChange={set}
                    onBlur={handleBlur}
                    className={`input-field ${fieldErrors.email ? "error" : ""}`}
                  />
                  {fieldErrors.email && touched.email && (
                    <div className="error-text">
                      <ErrorIcon />
                      {fieldErrors.email}
                    </div>
                  )}
                </div>

                {/* Password */}
                <div className="fu3">
                  <label style={labelStyle}>Password</label>
                  <div style={{ position:"relative" }}>
                    <input
                      name="password" 
                      type={show ? "text" : "password"} 
                      placeholder="Min. 8 characters" 
                      value={f.password} 
                      onChange={set}
                      onBlur={handleBlur}
                      className={`input-field ${fieldErrors.password ? "error" : ""}`}
                      style={{ paddingRight:"48px" }}
                    />
                    <button
                      type="button" 
                      onClick={() => setShow(!show)}
                      style={{ position:"absolute", right:"12px", top:"50%", transform:"translateY(-50%)", color:"#64748b", background:"none", border:"none", cursor:"pointer", display:"flex", alignItems:"center", transition:"color .2s" }}
                      onMouseEnter={e => e.currentTarget.style.color="#cbd5e1"}
                      onMouseLeave={e => e.currentTarget.style.color="#64748b"}
                    >
                      {show ? <EyeOffSm /> : <EyeOnSm />}
                    </button>
                  </div>
                  {fieldErrors.password && touched.password && (
                    <div className="error-text">
                      <ErrorIcon />
                      {fieldErrors.password}
                    </div>
                  )}
                  {f.password.length > 0 && !fieldErrors.password && (
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

                {/* Company Name */}
                <div className="fu1">
                  <label style={labelStyle}>Company Name</label>
                  <input 
                    name="company" 
                    type="text" 
                    placeholder="Acme Corp" 
                    value={f.company} 
                    onChange={set}
                    onBlur={handleBlur}
                    className={`input-field ${fieldErrors.company ? "error" : ""}`}
                  />
                  {fieldErrors.company && touched.company && (
                    <div className="error-text">
                      <ErrorIcon />
                      {fieldErrors.company}
                    </div>
                  )}
                </div>

                {/* Website */}
                <div className="fu2">
                  <label style={labelStyle}>Website (Optional)</label>
                  <input 
                    name="website" 
                    type="url" 
                    placeholder="https://yourcompany.com" 
                    value={f.website} 
                    onChange={set}
                    onBlur={handleBlur}
                    className={`input-field ${fieldErrors.website ? "error" : ""}`}
                  />
                  {fieldErrors.website && touched.website && (
                    <div className="error-text">
                      <ErrorIcon />
                      {fieldErrors.website}
                    </div>
                  )}
                </div>

                {/* Company Size */}
                <div className="fu3">
                  <label style={labelStyle}>Company Size</label>
                  <select 
                    name="size" 
                    value={f.size} 
                    onChange={set}
                    onBlur={handleBlur}
                    className={`input-field ${fieldErrors.size ? "error" : ""}`}
                  >
                    <option value="">Select size</option>
                    {["1–10","11–50","51–200","201–1000","1000+"].map(s => (
                      <option key={s}>{s} employees</option>
                    ))}
                  </select>
                  {fieldErrors.size && touched.size && (
                    <div className="error-text">
                      <ErrorIcon />
                      {fieldErrors.size}
                    </div>
                  )}
                </div>
              </>}

              {/* STEP 2 — Role */}
              {step === 2 && <>
                <div className="fu1" style={{ marginBottom:"4px" }}>
                  <h2 className="syne" style={{ fontSize:"clamp(1.4rem,2.5vw,1.6rem)", fontWeight:800, color:"#fff" }}>Your role</h2>
                  <p style={{ color:"#64748b", fontSize:"14px", marginTop:"4px" }}>Help us personalize your experience</p>
                </div>

                {/* Job Title */}
                <div className="fu1">
                  <label style={labelStyle}>Job Title</label>
                  <input 
                    name="role" 
                    type="text" 
                    placeholder="e.g. HR Manager" 
                    value={f.role} 
                    onChange={set}
                    onBlur={handleBlur}
                    className={`input-field ${fieldErrors.role ? "error" : ""}`}
                  />
                  {fieldErrors.role && touched.role && (
                    <div className="error-text">
                      <ErrorIcon />
                      {fieldErrors.role}
                    </div>
                  )}
                </div>

                {/* Department */}
                <div className="fu2">
                  <label style={labelStyle}>Department</label>
                  <select 
                    name="department" 
                    value={f.department} 
                    onChange={set}
                    onBlur={handleBlur}
                    className={`input-field ${fieldErrors.department ? "error" : ""}`}
                  >
                    <option value="">Select department</option>
                    {["Human Resources","Talent Acquisition","Engineering","Product","Operations","Finance","Marketing"].map(d => (
                      <option key={d}>{d}</option>
                    ))}
                  </select>
                  {fieldErrors.department && touched.department && (
                    <div className="error-text">
                      <ErrorIcon />
                      {fieldErrors.department}
                    </div>
                  )}
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
                    type="button" 
                    onClick={() => setStep(step - 1)}
                    disabled={isAuthenticating}
                    style={{ flex:1, padding:"13px", borderRadius:"12px", border:"1px solid #334155", background:"transparent", color:"#cbd5e1", fontSize:"14px", fontWeight:600, cursor:isAuthenticating?"not-allowed":"pointer", opacity:isAuthenticating?0.6:1, transition:"all .2s", fontFamily:"'DM Sans',sans-serif" }}
                    onMouseEnter={e => !isAuthenticating && (e.currentTarget.style.background="rgba(255,255,255,0.06)")}
                    onMouseLeave={e => !isAuthenticating && (e.currentTarget.style.background="transparent")}
                  >
                    ← Back
                  </button>
                )}
                <button
                  type="submit" 
                  disabled={isAuthenticating}
                  className="btn-grad"
                  style={{ flex:1, padding:"13px", borderRadius:"12px", border:"none", color:"#fff", fontSize:"14px", fontWeight:600, cursor:isAuthenticating?"not-allowed":"pointer", opacity:isAuthenticating?0.6:1, display:"flex", alignItems:"center", justifyContent:"center", gap:"8px", transition:"all .2s", fontFamily:"'DM Sans',sans-serif" }}
                  onMouseEnter={e => { if (!isAuthenticating) e.currentTarget.style.transform="translateY(-2px)"; }}
                  onMouseLeave={e => { e.currentTarget.style.transform="translateY(0)"; }}
                >
                  {isAuthenticating ? <><Spinner />Creating...</> : step < 2 ? "Continue →" : "Create Account →"}
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