/*  GLOBAL STYLES                                                               */
export const G = () => (
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
    @keyframes barGrow { from{transform:scaleY(0)} to{transform:scaleY(1)} }
    .bar-fill { animation:barGrow .8s ease forwards; transform-origin:bottom; }
    ::-webkit-scrollbar { width:4px; }
    ::-webkit-scrollbar-thumb { background:#1e293b; border-radius:4px; }
  `}</style>
);

/* ─────────────────────────────────────────────────────────────────────────── */
/*  ICONS                                                                       */
/* ─────────────────────────────────────────────────────────────────────────── */
export const SearchIcon  = () => <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>;
export const BellIcon = () => <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>;
export const GridIcon = () => <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg>;
export const BriefIcon   = () => <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>;
export const UsersIcon   = () => <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
export const MsgIcon  = () => <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>;
export const ChartIcon   = () => <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>;
export const SettIcon = () => <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/></svg>;
export const PlusIcon = () => <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
export const EyeIcon  = () => <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;
export const EyeOffSm   = () => <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>;
export const EyeOnSm = () => <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;
export const CheckIcon   = () => <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>;
export const XIcon    = () => <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
export const ArrowR      = () => <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>;

export const Logo = () => (
  <>
    <span className="syne font-extrabold text-xl grad">NexWork</span>
    <span className="ml-1.5 text-[10px] font-bold text-sky-400 bg-sky-400/10 border border-sky-400/20 px-1.5 py-0.5 rounded-full">Recruiter</span>
  </>
);

export const Spinner = () => (
  <svg className="w-4 h-4 spinner" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
);
