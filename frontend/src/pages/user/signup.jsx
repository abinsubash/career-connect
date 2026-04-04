import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useGoogleLogin } from "@react-oauth/google";
import axios from "axios";

// ─────────────────────────────────────────────────────────────────────────────
// CONFIG
// ─────────────────────────────────────────────────────────────────────────────
const API = "http://127.0.0.1:5000/api";

// ─────────────────────────────────────────────────────────────────────────────
// ICONS
// ─────────────────────────────────────────────────────────────────────────────
const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.47 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

const Icon = ({ d, size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    aria-hidden="true">
    <path d={d}/>
  </svg>
);

const EyeIcon = ({ open }) => open ? (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
) : (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);

const Spinner = ({ size = 16, color = "white" }) => (
  <svg className="animate-spin" width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="4" strokeOpacity="0.3"/>
    <path d="M12 2a10 10 0 0 1 10 10" stroke={color} strokeWidth="4" strokeLinecap="round"/>
  </svg>
);

// ─────────────────────────────────────────────────────────────────────────────
// DATA
// ─────────────────────────────────────────────────────────────────────────────
const JOB_TITLES = [
  "Frontend Developer","Backend Developer","Full Stack Developer","React Developer",
  "Vue.js Developer","Angular Developer","Node.js Developer","Python Developer",
  "Java Developer","Android Developer","iOS Developer","Mobile Developer",
  "DevOps Engineer","Cloud Engineer","Data Scientist","Data Analyst",
  "Machine Learning Engineer","AI Engineer","UI/UX Designer","Product Designer",
  "Graphic Designer","Product Manager","Project Manager","Engineering Manager",
  "Software Architect","QA Engineer","Business Analyst","Cybersecurity Engineer",
  "Blockchain Developer","Embedded Systems Engineer","Database Administrator",
  "Site Reliability Engineer","Technical Writer","Scrum Master","Solutions Architect",
];

const SKILLS_LIST = [
  "JavaScript","TypeScript","React","Next.js","Vue.js","Angular","Svelte",
  "Node.js","Express","Python","Django","Flask","FastAPI","Java","Spring Boot",
  "C++","C#",".NET","PHP","Laravel","Ruby on Rails","Go","Rust","Kotlin","Swift",
  "Flutter","React Native","SQL","PostgreSQL","MySQL","MongoDB","Redis","GraphQL",
  "REST APIs","Docker","Kubernetes","AWS","GCP","Azure","Git","CI/CD",
  "Linux","Bash","Tailwind CSS","SASS","Figma","Photoshop","Illustrator",
  "Machine Learning","TensorFlow","PyTorch","Data Analysis","Pandas","NumPy",
  "Tableau","Power BI","Blockchain","Solidity","Web3.js","Cybersecurity","Networking",
];

const EXPERIENCE_LEVELS = [
  { value: "fresher", label: "Fresher",   sub: "0 – 1 year"  },
  { value: "1-2",     label: "1 – 2 Yrs", sub: "Junior"      },
  { value: "3-5",     label: "3 – 5 Yrs", sub: "Mid-level"   },
  { value: "5+",      label: "5+ Years",  sub: "Senior"      },
];

const GENDERS = ["Prefer not to say","Male","Female","Non-binary","Other"];
const STEP_LABELS = ["Sign Up","Personal","Professional","Preferences"];

// ─────────────────────────────────────────────────────────────────────────────
// FORM PRIMITIVES
// ─────────────────────────────────────────────────────────────────────────────
function Label({ children, htmlFor }) {
  return (
    <label htmlFor={htmlFor} className="block text-xs font-semibold text-slate-700 mb-1.5">
      {children}
    </label>
  );
}

function InputWrap({ focused, error, success, children, className = "" }) {
  const ring = error
    ? "border-red-400 ring-2 ring-red-100"
    : success
    ? "border-green-400 ring-2 ring-green-100"
    : focused
    ? "border-blue-500 ring-2 ring-blue-100"
    : "border-slate-200 hover:border-slate-300";
  return (
    <div className={`relative rounded-xl border-2 transition-all duration-150 bg-white ${ring} ${className}`}>
      {children}
    </div>
  );
}

function TextInput({
  id, label, name, value, onChange, placeholder,
  type = "text", iconPath, required, autoComplete, readOnly,
  rightSlot,
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div>
      {label && <Label htmlFor={id || name}>{label}</Label>}
      <InputWrap focused={focused}>
        {iconPath && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
            <Icon d={iconPath}/>
          </span>
        )}
        <input
          id={id || name}
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          required={required}
          autoComplete={autoComplete}
          readOnly={readOnly}
          className={`w-full ${iconPath ? "pl-9" : "pl-4"} ${rightSlot ? "pr-10" : "pr-4"} py-2.5 rounded-xl bg-transparent text-slate-800 placeholder-slate-400 text-sm outline-none disabled:cursor-not-allowed`}
        />
        {rightSlot && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">{rightSlot}</div>
        )}
      </InputWrap>
    </div>
  );
}

function SelectInput({ label, name, value, onChange, options, placeholder }) {
  const [focused, setFocused] = useState(false);
  return (
    <div>
      {label && <Label htmlFor={name}>{label}</Label>}
      <InputWrap focused={focused}>
        <select
          id={name} name={name} value={value} onChange={onChange}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          className="w-full px-4 py-2.5 rounded-xl bg-transparent text-slate-800 text-sm outline-none appearance-none cursor-pointer"
        >
          <option value="" disabled>{placeholder}</option>
          {options.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </span>
      </InputWrap>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// AUTOCOMPLETE
// ─────────────────────────────────────────────────────────────────────────────
function Autocomplete({ list, value, onChange, placeholder, label, iconPath }) {
  const [query, setQuery] = useState(value || "");
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const ref = useRef(null);

  const filtered = query.length > 0
    ? list.filter(i => i.toLowerCase().includes(query.toLowerCase())).slice(0, 8)
    : list.slice(0, 8);

  useEffect(() => {
    const close = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  return (
    <div ref={ref} className="relative">
      {label && <Label>{label}</Label>}
      <InputWrap focused={focused}>
        {iconPath && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
            <Icon d={iconPath}/>
          </span>
        )}
        <input
          type="text" value={query}
          onChange={e => { setQuery(e.target.value); onChange(e.target.value); setOpen(true); }}
          onFocus={() => { setFocused(true); setOpen(true); }}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          className={`w-full ${iconPath ? "pl-9" : "pl-4"} pr-9 py-2.5 rounded-xl bg-transparent text-slate-800 placeholder-slate-400 text-sm outline-none`}
        />
        {query && (
          <button type="button" onClick={() => { setQuery(""); onChange(""); setOpen(false); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition-colors">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        )}
      </InputWrap>
      {open && filtered.length > 0 && (
        <div className="absolute z-50 mt-1.5 w-full bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden max-h-52 overflow-y-auto">
          {filtered.map(item => (
            <button key={item} type="button"
              onMouseDown={() => { setQuery(item); onChange(item); setOpen(false); }}
              className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors flex items-center gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-300 flex-shrink-0"/>
              {item}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SKILLS MULTI-SELECT
// ─────────────────────────────────────────────────────────────────────────────
function SkillsSelect({ selected, onChange }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const ref = useRef(null);

  const filtered = SKILLS_LIST.filter(s =>
    s.toLowerCase().includes(query.toLowerCase()) && !selected.includes(s)
  ).slice(0, 8);

  useEffect(() => {
    const close = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  return (
    <div ref={ref}>
      <Label>Skills <span className="text-slate-400 font-normal">(add up to 10)</span></Label>
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {selected.map(s => (
            <span key={s} className="inline-flex items-center gap-1 bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold px-2.5 py-1 rounded-lg">
              {s}
              <button type="button" onClick={() => onChange(selected.filter(x => x !== s))}
                className="text-blue-300 hover:text-blue-600 ml-0.5 transition-colors" aria-label={`Remove ${s}`}>
                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </span>
          ))}
        </div>
      )}
      {selected.length < 10 && (
        <div className="relative">
          <InputWrap focused={focused}>
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
            </span>
            <input type="text" value={query}
              onChange={e => { setQuery(e.target.value); setOpen(true); }}
              onFocus={() => { setFocused(true); setOpen(true); }}
              onBlur={() => { setFocused(false); setTimeout(() => setOpen(false), 150); }}
              placeholder="Search and add skills…"
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-transparent text-slate-800 placeholder-slate-400 text-sm outline-none"
            />
          </InputWrap>
          {open && filtered.length > 0 && (
            <div className="absolute z-50 mt-1.5 w-full bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden max-h-52 overflow-y-auto">
              {filtered.map(s => (
                <button key={s} type="button"
                  onMouseDown={() => { onChange([...selected, s]); setQuery(""); }}
                  className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors flex items-center gap-2.5">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                  </svg>
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PHOTO UPLOAD
// ─────────────────────────────────────────────────────────────────────────────
function PhotoUpload({ value, onChange }) {
  const fileRef = useRef(null);
  const [preview, setPreview] = useState(null);

  const handle = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    onChange(file);
    setPreview(URL.createObjectURL(file));
  };

  return (
    <div className="flex flex-col items-center gap-2 py-2">
      <button type="button" onClick={() => fileRef.current.click()}
        aria-label="Upload profile photo"
        className="w-24 h-24 rounded-full border-4 border-dashed border-blue-200 bg-blue-50 flex items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-100 transition-all duration-200 overflow-hidden relative group focus:outline-none focus:ring-2 focus:ring-blue-400">
        {preview
          ? <img src={preview} alt="Profile preview" className="w-full h-full object-cover"/>
          : (
            <div className="flex flex-col items-center gap-1 text-blue-400">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
              <span className="text-xs font-semibold">Upload</span>
            </div>
          )
        }
        <div className="absolute inset-0 bg-black/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
            <circle cx="12" cy="13" r="4"/>
          </svg>
        </div>
      </button>
      <input ref={fileRef} type="file" accept="image/*" className="sr-only" onChange={handle}/>
      <p className="text-xs text-slate-400">Click to upload profile photo</p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// STEP PROGRESS BAR
// ─────────────────────────────────────────────────────────────────────────────
function StepBar({ steps, current }) {
  return (
    <div className="flex items-center justify-center gap-0 mb-5" role="progressbar"
      aria-valuenow={current + 1} aria-valuemin={1} aria-valuemax={steps.length}>
      {steps.map((label, i) => (
        <div key={i} className="flex items-center">
          <div className="flex flex-col items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
              i < current  ? "bg-blue-600 text-white"
              : i === current ? "bg-blue-600 text-white ring-4 ring-blue-100"
              : "bg-slate-100 text-slate-400"
            }`}>
              {i < current
                ? <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                : i + 1}
            </div>
            <span className={`text-xs mt-1 font-medium hidden sm:block ${
              i === current ? "text-blue-600" : i < current ? "text-slate-500" : "text-slate-300"
            }`}>{label}</span>
          </div>
          {i < steps.length - 1 && (
            <div className={`h-0.5 w-8 sm:w-12 mx-1 mb-4 transition-all duration-500 ${
              i < current ? "bg-blue-500" : "bg-slate-200"
            }`}/>
          )}
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CARD SHELL
// ─────────────────────────────────────────────────────────────────────────────
function Card({ title, subtitle, children }) {
  return (
    <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-100 overflow-hidden">
      <div className="bg-gradient-to-br from-blue-600 to-blue-700 px-6 pt-5 pb-6 relative overflow-hidden">
        <div className="absolute -top-6 -right-6 w-28 h-28 bg-white/10 rounded-full pointer-events-none" aria-hidden="true"/>
        <div className="absolute -bottom-6 -left-4 w-20 h-20 bg-white/10 rounded-full pointer-events-none" aria-hidden="true"/>
        <p className="text-blue-200 text-xs font-semibold mb-0.5 relative z-10 tracking-widest uppercase">CareerConnect</p>
        <h2 className="text-white text-xl font-bold relative z-10 leading-snug">{title}</h2>
        <p className="text-blue-200 text-xs mt-1 relative z-10">{subtitle}</p>
      </div>
      <div className="px-6 py-5 space-y-4">{children}</div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// NAV BUTTONS
// ─────────────────────────────────────────────────────────────────────────────
function NavButtons({ onBack, onNext, disabled, nextLabel }) {
  return (
    <div className="flex items-center justify-between gap-3 pt-1">
      {onBack
        ? (
          <button type="button" onClick={onBack}
            className="flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors px-4 py-2.5 rounded-xl border-2 border-slate-200 hover:border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-300">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
            Back
          </button>
        ) : <div/>}
      <button type="button" onClick={onNext} disabled={disabled}
        className="flex items-center gap-1.5 text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl transition-all shadow-lg shadow-blue-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2">
        {nextLabel ?? (
          <>
            Continue
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
          </>
        )}
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ERROR BANNER
// ─────────────────────────────────────────────────────────────────────────────
function ErrorBanner({ message, onClose }) {
  if (!message) return null;
  return (
    <div role="alert" className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="flex-shrink-0 mt-0.5">
        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
      <span className="flex-1">{message}</span>
      {onClose && (
        <button type="button" onClick={onClose} className="text-red-400 hover:text-red-600 transition-colors" aria-label="Dismiss error">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// GOOGLE DIVIDER
// ─────────────────────────────────────────────────────────────────────────────
function Divider({ label = "or sign up with email" }) {
  return (
    <div className="flex items-center gap-3" aria-hidden="true">
      <div className="flex-1 h-px bg-slate-100"/>
      <span className="text-slate-400 text-xs font-medium">{label}</span>
      <div className="flex-1 h-px bg-slate-100"/>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// STEP 0 — SIGNUP
// ─────────────────────────────────────────────────────────────────────────────
function StepSignup({ data, onChange, onNext, onGoogleSuccess }) {
  const [showPass, setShowPass]       = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [agreed, setAgreed]           = useState(false);
  const [loading, setLoading]         = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError]             = useState("");

  const pwMatch    = data.confirm.length > 0 && data.password === data.confirm;
  const pwMismatch = data.confirm.length > 0 && data.password !== data.confirm;
  const canSubmit  = !pwMismatch && agreed && data.firstName && data.email && data.password && data.confirm;

  // ── Google OAuth login ──────────────────────────────────────────────────
  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setGoogleLoading(true);
      setError("");
      try {
        // Exchange authorization code for tokens on the backend
        const { data: authData } = await axios.post(`${API}/auth/google-callback`, {
          code: tokenResponse.code,
        });
        // Populate form with Google data, then advance to personal step
        onGoogleSuccess({
          firstName: authData.firstName  || "",
          lastName:  authData.lastName   || "",
          email:     authData.email      || "",
          avatar:    authData.avatar     || "",
          authToken: authData.token      || "",
        });
      } catch (err) {
        const msg = err?.response?.data?.message || "Google sign-in failed. Please try again.";
        setError(msg);
      } finally {
        setGoogleLoading(false);
      }
    },
    onError: (err) => {
      setError("Google sign-in was cancelled or failed.");
      setGoogleLoading(false);
    },
    flow: "auth-code",  // Uses redirect flow instead of popup - avoids COOP policy issues
  });

  // ── Email/Password signup ───────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    setLoading(true);
    setError("");
    try {
      await axios.post(`${API}/auth/signup`, {
        firstName: data.firstName,
        lastName:  data.lastName,
        email:     data.email,
        phone:     data.phone,
        password:  data.password,
      });
      onNext();
    } catch (err) {
      const msg = err?.response?.data?.message || "Sign-up failed. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card
      title="Create your account"
      subtitle="Join thousands of professionals finding their dream jobs"
    >
      {/* Google OAuth button */}
      <button
        type="button"
        onClick={() => { setError(""); googleLogin(); }}
        disabled={googleLoading}
        className="w-full flex items-center justify-center gap-3 border-2 border-slate-200 rounded-xl py-2.5 px-4 text-slate-700 font-medium text-sm hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 group disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-300"
      >
        {googleLoading ? <Spinner size={18} color="#3b82f6"/> : <GoogleIcon/>}
        <span className="group-hover:text-blue-700 transition-colors">
          {googleLoading ? "Signing in with Google…" : "Continue with Google"}
        </span>
      </button>

      <Divider/>

      {/* Error */}
      <ErrorBanner message={error} onClose={() => setError("")}/>

      <form onSubmit={handleSubmit} className="space-y-3" noValidate>
        {/* Name row */}
        <div className="grid grid-cols-2 gap-3">
          <TextInput
            label="First Name" name="firstName" value={data.firstName} onChange={onChange}
            placeholder="John" required
            iconPath="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z"
          />
          <TextInput
            label="Last Name" name="lastName" value={data.lastName} onChange={onChange}
            placeholder="Doe" required
          />
        </div>

        {/* Email */}
        <TextInput
          label="Email Address" name="email" value={data.email} onChange={onChange}
          type="email" placeholder="you@email.com" required autoComplete="email"
          iconPath="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z M22 6l-10 7L2 6"
        />

        {/* Phone */}
        <TextInput
          label="Phone Number" name="phone" value={data.phone} onChange={onChange}
          type="tel" placeholder="+91 98765 43210" autoComplete="tel"
          iconPath="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"
        />

        {/* Password */}
        <TextInput
          label="Password" name="password" value={data.password} onChange={onChange}
          type={showPass ? "text" : "password"} placeholder="Create a strong password"
          required autoComplete="new-password"
          iconPath="M3 11h18v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V11z M7 11V7a5 5 0 0 1 10 0v4"
          rightSlot={
            <button type="button" onClick={() => setShowPass(p => !p)}
              className="text-slate-400 hover:text-slate-600 transition-colors" aria-label={showPass ? "Hide password" : "Show password"}>
              <EyeIcon open={showPass}/>
            </button>
          }
        />

        {/* Confirm Password */}
        <div>
          <Label htmlFor="confirm">Confirm Password</Label>
          <InputWrap focused={false} error={pwMismatch} success={pwMatch}>
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
            </span>
            <input
              id="confirm" type={showConfirm ? "text" : "password"}
              name="confirm" value={data.confirm} onChange={onChange}
              placeholder="Re-enter your password"
              autoComplete="new-password" required
              className="w-full pl-10 pr-16 py-2.5 rounded-xl bg-transparent text-slate-800 placeholder-slate-400 text-sm outline-none"
            />
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
              {pwMatch && (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              )}
              {pwMismatch && (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              )}
              <button type="button" onClick={() => setShowConfirm(p => !p)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
                aria-label={showConfirm ? "Hide password" : "Show password"}>
                <EyeIcon open={showConfirm}/>
              </button>
            </div>
          </InputWrap>
          {pwMismatch && <p className="text-xs text-red-500 mt-1 ml-1" role="alert">Passwords do not match</p>}
        </div>

        {/* Terms */}
        <div className="flex items-start gap-2 pt-0.5">
          <input type="checkbox" id="agree" checked={agreed} onChange={e => setAgreed(e.target.checked)}
            className="w-4 h-4 mt-0.5 accent-blue-600 rounded flex-shrink-0" required/>
          <label htmlFor="agree" className="text-xs text-slate-500 select-none leading-relaxed">
            I agree to the{" "}
            <a href="#" className="text-blue-600 hover:underline font-medium">Terms of Service</a>{" "}and{" "}
            <a href="#" className="text-blue-600 hover:underline font-medium">Privacy Policy</a>
          </label>
        </div>

        <button type="submit" disabled={loading || !canSubmit}
          className="w-full bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-semibold py-3 rounded-xl transition-all duration-200 text-sm shadow-lg shadow-blue-200 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2">
          {loading
            ? <><Spinner/>Creating account…</>
            : (
              <>
                Create Account
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              </>
            )}
        </button>
      </form>

      <p className="text-center text-sm text-slate-500">
        Already have an account?{" "}
        <a href="/login" className="text-blue-600 font-semibold hover:underline">Sign in</a>
      </p>
    </Card>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// STEP 1 — PERSONAL INFO
// ─────────────────────────────────────────────────────────────────────────────
function StepPersonal({ data, onChange, onNext, onBack }) {
  const canContinue = data.headline && data.dob && data.city && data.country;

  return (
    <Card title="Personal Info" subtitle="Tell us a bit about yourself">
      <PhotoUpload value={data.photo}
        onChange={f => onChange({ target: { name: "photo", value: f } })}/>

      <TextInput
        label="Headline" name="headline" value={data.headline} onChange={onChange}
        placeholder='e.g. "Frontend Developer | React | Node.js"'
        iconPath="M20 14.66V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h5.34 M18 2l4 4-10 10H8v-4L18 2z"
      />

      <div className="grid grid-cols-2 gap-3">
        <TextInput
          label="Date of Birth" name="dob" value={data.dob} onChange={onChange} type="date"
          iconPath="M3 4h18v16a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4z M16 2v4 M8 2v4 M3 10h18"
        />
        <SelectInput
          label="Gender (optional)" name="gender" value={data.gender}
          onChange={onChange} options={GENDERS} placeholder="Select gender"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <TextInput
          label="City" name="city" value={data.city} onChange={onChange} placeholder="Your city"
          iconPath="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z M12 7a3 3 0 1 0 0 6 3 3 0 0 0 0-6z"
        />
        <TextInput
          label="State" name="state" value={data.state} onChange={onChange} placeholder="State / Province"
        />
      </div>

      <TextInput
        label="Country" name="country" value={data.country} onChange={onChange} placeholder="Country"
        iconPath="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z M2 12h20 M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"
      />

      <NavButtons onBack={onBack} onNext={onNext} disabled={!canContinue}/>
    </Card>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// STEP 2 — PROFESSIONAL INFO
// ─────────────────────────────────────────────────────────────────────────────
function StepProfessional({ data, onChange, onNext, onBack }) {
  const canContinue = data.jobTitle && data.experienceLevel && data.skills.length > 0;

  return (
    <Card title="Professional Info" subtitle="Share your professional background">
      <Autocomplete
        list={JOB_TITLES} value={data.jobTitle}
        onChange={v => onChange({ target: { name: "jobTitle", value: v } })}
        placeholder="Search your current job title…"
        label="Current Job Title"
        iconPath="M2 7h20v14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7z M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"
      />

      <div>
        <Label>Experience Level</Label>
        <div className="grid grid-cols-2 gap-2">
          {EXPERIENCE_LEVELS.map(lvl => (
            <button key={lvl.value} type="button"
              onClick={() => onChange({ target: { name: "experienceLevel", value: lvl.value } })}
              aria-pressed={data.experienceLevel === lvl.value}
              className={`rounded-xl border-2 px-4 py-3 text-left transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-300 ${
                data.experienceLevel === lvl.value
                  ? "border-blue-500 bg-blue-50 shadow-sm shadow-blue-100"
                  : "border-slate-200 hover:border-blue-200 hover:bg-slate-50"
              }`}>
              <p className={`text-sm font-semibold ${data.experienceLevel === lvl.value ? "text-blue-700" : "text-slate-700"}`}>
                {lvl.label}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">{lvl.sub}</p>
            </button>
          ))}
        </div>
      </div>

      <SkillsSelect
        selected={data.skills}
        onChange={v => onChange({ target: { name: "skills", value: v } })}
      />

      <NavButtons onBack={onBack} onNext={onNext} disabled={!canContinue}/>
    </Card>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// STEP 3 — PREFERENCES
// ─────────────────────────────────────────────────────────────────────────────
function StepPreferences({ data, onChange, onSubmit, onBack, submitting }) {
  const canSubmit = data.preferredRole && data.preferredLocation && data.expectedSalary;

  return (
    <Card title="Your Preferences" subtitle="Tell us what you're looking for">
      <Autocomplete
        list={JOB_TITLES} value={data.preferredRole}
        onChange={v => onChange({ target: { name: "preferredRole", value: v } })}
        placeholder="Search preferred job role…"
        label="Preferred Job Role"
        iconPath="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z M12 8v4l2 2"
      />

      <TextInput
        label="Preferred Job Location" name="preferredLocation"
        value={data.preferredLocation} onChange={onChange}
        placeholder="e.g. Bangalore, Remote, Anywhere"
        iconPath="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z M12 7a3 3 0 1 0 0 6 3 3 0 0 0 0-6z"
      />

      <div>
        <Label htmlFor="expectedSalary">Expected Salary (per annum)</Label>
        <div className="relative rounded-xl border-2 border-slate-200 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all bg-white">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 font-semibold text-sm pointer-events-none">₹</span>
          <input
            id="expectedSalary" type="text" name="expectedSalary"
            value={data.expectedSalary} onChange={onChange}
            placeholder="e.g. 8,00,000 – 12,00,000"
            className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-transparent text-slate-800 placeholder-slate-400 text-sm outline-none"
          />
        </div>
      </div>

      {/* Profile Summary */}
      <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Profile Summary</p>
        <div className="space-y-1.5">
          {[
            ["Name",       `${data.firstName || ""} ${data.lastName || ""}`.trim() || "—"],
            ["Email",      data.email    || "—"],
            ["Headline",   data.headline || "—"],
            ["Location",   [data.city, data.country].filter(Boolean).join(", ") || "—"],
            ["Job Title",  data.jobTitle || "—"],
            ["Experience", EXPERIENCE_LEVELS.find(l => l.value === data.experienceLevel)?.label || "—"],
            ["Skills",     data.skills?.length
              ? data.skills.slice(0, 3).join(", ") + (data.skills.length > 3 ? ` +${data.skills.length - 3}` : "")
              : "—"],
          ].map(([k, v]) => (
            <div key={k} className="flex items-center gap-2 text-xs">
              <span className="text-slate-400 w-20 flex-shrink-0 font-medium">{k}</span>
              <span className="text-slate-700 font-semibold truncate">{v}</span>
            </div>
          ))}
        </div>
      </div>

      <NavButtons
        onBack={onBack}
        onNext={onSubmit}
        disabled={!canSubmit || submitting}
        nextLabel={submitting
          ? <><Spinner/>Saving…</>
          : (
            <>
              Complete Profile
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </>
          )}
      />
    </Card>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SUCCESS SCREEN
// ─────────────────────────────────────────────────────────────────────────────
function SuccessScreen({ name }) {
  return (
    <div className="text-center max-w-sm mx-auto py-8">
      <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-5 shadow-lg shadow-green-200">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      </div>
      <h2 className="text-2xl font-bold text-slate-800 mb-2">You're all set, {name}! 🎉</h2>
      <p className="text-slate-500 text-sm mb-8 leading-relaxed">
        Your profile is live. We'll match you with jobs that fit your skills and preferences.
      </p>
      <div className="space-y-3">
        <a href="/jobs"
          className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-xl transition-colors shadow-lg shadow-blue-200 text-sm text-center">
          Browse Matching Jobs →
        </a>
        <a href="/profile"
          className="block w-full border-2 border-slate-200 hover:border-blue-200 text-slate-600 hover:text-blue-600 font-semibold px-8 py-3 rounded-xl transition-all text-sm text-center">
          Complete Your Profile
        </a>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// NAVBAR
// ─────────────────────────────────────────────────────────────────────────────
function Navbar() {
  return (
    <>
      <div className="h-1 flex-shrink-0 bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-400" aria-hidden="true"/>
      <nav className="flex-shrink-0 px-6 py-3 flex items-center justify-between bg-white border-b border-slate-100 shadow-sm">
        <a href="/" className="flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-blue-400 rounded-lg">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="7" width="20" height="14" rx="2"/>
              <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/><path d="M2 12h20"/>
            </svg>
          </div>
          <span className="text-lg font-bold text-slate-800 tracking-tight">
            Career<span className="text-blue-600">Connect</span>
          </span>
        </a>
        <div className="hidden sm:flex items-center gap-5 text-sm text-slate-500">
          <a href="/jobs"      className="hover:text-blue-600 transition-colors">Find Jobs</a>
          <a href="/companies" className="hover:text-blue-600 transition-colors">Companies</a>
          <a href="/salary"    className="hover:text-blue-600 transition-colors">Salary Guide</a>
        </div>
      </nav>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// INITIAL STATE
// ─────────────────────────────────────────────────────────────────────────────
const INIT = {
  // Step 0
  firstName: "", lastName: "", email: "", phone: "", password: "", confirm: "",
  // Step 1
  photo: null, avatar: "", headline: "", dob: "", gender: "", city: "", state: "", country: "",
  // Step 2
  jobTitle: "", experienceLevel: "", skills: [],
  // Step 3
  preferredRole: "", preferredLocation: "", expectedSalary: "",
  // Auth
  authToken: "",
};

// ─────────────────────────────────────────────────────────────────────────────
// ROOT
// ─────────────────────────────────────────────────────────────────────────────
export default function SignupOnboarding() {
  const navigate    = useNavigate();
  const [step, setStep]           = useState(0);
  const [form, setForm]           = useState(INIT);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone]           = useState(false);

  // Scroll to top on step change
  useEffect(() => { window.scrollTo({ top: 0, behavior: "smooth" }); }, [step]);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  }, []);

  // Called after successful Google OAuth on step 0
  const handleGoogleSuccess = useCallback((googleData) => {
    setForm(f => ({
      ...f,
      firstName: googleData.firstName,
      lastName:  googleData.lastName,
      email:     googleData.email,
      avatar:    googleData.avatar,
      authToken: googleData.authToken,
    }));
    setStep(1); // skip to personal info
  }, []);

  // Final submission
  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      // Build multipart form data if photo is a File object
      const payload = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (k === "photo" && v instanceof File) {
          payload.append("photo", v);
        } else if (k === "skills") {
          payload.append("skills", JSON.stringify(v));
        } else if (v !== null && v !== undefined) {
          payload.append(k, v);
        }
      });

      await axios.post(`${API}/auth/onboarding`, payload, {
        headers: {
          "Content-Type": "multipart/form-data",
          ...(form.authToken ? { Authorization: `Bearer ${form.authToken}` } : {}),
        },
      });
      setDone(true);
      // Optionally redirect: navigate("/dashboard");
    } catch (err) {
      console.error("Onboarding failed:", err?.response?.data || err.message);
      alert(err?.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────
  if (done) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
        <Navbar/>
        <main className="flex-1 flex items-center justify-center px-4 py-8">
          <SuccessScreen name={form.firstName || "there"}/>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar/>
      <main className="flex-1 flex items-start justify-center px-4 py-8">
        <div className="w-full max-w-md">

          {step > 0 && (
            <>
              <p className="text-center text-xs text-slate-400 uppercase tracking-widest font-semibold mb-1">
                Step {step} of {STEP_LABELS.length - 1}
              </p>
              <h1 className="text-center text-2xl font-bold text-slate-800 mb-4">
                {STEP_LABELS[step]}
              </h1>
              <StepBar steps={STEP_LABELS.slice(1)} current={step - 1}/>
            </>
          )}

          {step === 0 && (
            <StepSignup
              data={form}
              onChange={handleChange}
              onNext={() => setStep(1)}
              onGoogleSuccess={handleGoogleSuccess}
            />
          )}
          {step === 1 && (
            <StepPersonal
              data={form}
              onChange={handleChange}
              onNext={() => setStep(2)}
              onBack={() => setStep(0)}
            />
          )}
          {step === 2 && (
            <StepProfessional
              data={form}
              onChange={handleChange}
              onNext={() => setStep(3)}
              onBack={() => setStep(1)}
            />
          )}
          {step === 3 && (
            <StepPreferences
              data={form}
              onChange={handleChange}
              onSubmit={handleSubmit}
              onBack={() => setStep(2)}
              submitting={submitting}
            />
          )}

          <p className="text-center text-xs text-slate-400 mt-4">
            {step === 0
              ? <>Already have an account? <a href="/login" className="text-blue-600 font-semibold hover:underline">Sign in</a></>
              : "You can update your profile anytime from settings"}
          </p>

        </div>
      </main>
    </div>
  );
}