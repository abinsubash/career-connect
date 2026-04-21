// pages/recruiter/ApplicantsPage.jsx
import { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import styled, { keyframes, css } from "styled-components";
import jobAPI from "../../api/jobAPI";
import { RecruiterLayout } from "../../components/RecruiterLayout";

// ── Animations ────────────────────────────────────────────────────────────────
const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(14px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const slideIn = keyframes`
  from { opacity: 0; transform: translateX(40px); }
  to   { opacity: 1; transform: translateX(0); }
`;

const slideInRight = keyframes`
  from { opacity: 0; transform: translateX(-40px); }
  to   { opacity: 1; transform: translateX(0); }
`;

const shimmer = keyframes`
  0%   { background-position: -600px 0; }
  100% { background-position:  600px 0; }
`;

const pulse = keyframes`
  0%, 100% { box-shadow: 0 0 0 0 rgba(56, 189, 248, 0.4); }
  50% { box-shadow: 0 0 0 8px rgba(56, 189, 248, 0); }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-4px); }
`;

// ── Layout ────────────────────────────────────────────────────────────────────
const Page = styled.div`
  width: 100%;
  color: #e2e8f0;
  font-family: "DM Sans", sans-serif;
  animation: ${fadeUp} 0.4s ease both;
  position: relative;
`;

const Inner = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
`;

// ── Hero Section ───────────────────────────────────────────────────────────────
const HeroSection = styled.div`
  background: linear-gradient(135deg, rgba(56,189,248,0.1) 0%, rgba(99,102,241,0.05) 100%);
  border: 1px solid rgba(56,189,248,0.2);
  border-radius: 16px;
  padding: 32px 28px;
  margin-bottom: 28px;
  animation: ${fadeUp} 0.5s ease both;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    right: -40%;
    width: 400px;
    height: 400px;
    background: radial-gradient(circle, rgba(56,189,248,0.08) 0%, transparent 70%);
    border-radius: 50%;
    pointer-events: none;
  }
`;

const HeroContent = styled.div`
  position: relative;
  z-index: 1;
`;

const HeroTitle = styled.h1`
  font-family: 'Syne', sans-serif;
  font-size: 32px;
  font-weight: 800;
  margin: 0;
  background: linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 8px;
  letter-spacing: -0.6px;
`;

const HeroSubtitle = styled.p`
  font-size: 14px;
  color: #94a3b8;
  margin: 0;
  line-height: 1.6;
`;

const JobMeta = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 16px;
  animation: ${slideInRight} 0.6s ease both;
  animation-delay: 0.1s;
`;

const MetaChip = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  background: rgba(30,41,59,0.9);
  border: 1px solid rgba(56,189,248,0.3);
  color: #cbd5e1;
  transition: all 0.2s;

  &:hover {
    border-color: rgba(56,189,248,0.6);
    background: rgba(56,189,248,0.1);
  }
`;

// ── Stats bar ─────────────────────────────────────────────────────────────────
const StatsBar = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 16px;
  margin-bottom: 28px;

  @media (max-width: 768px) { 
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (max-width: 500px) {
    grid-template-columns: 1fr;
  }
`;

const StatCard = styled.button`
  background: linear-gradient(145deg, rgba(30,41,59,0.8), rgba(15,23,42,0.6));
  border: 1px solid ${p => p.$color ? p.$color + "40" : "#1e293b"};
  border-radius: 14px;
  padding: 18px 16px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, ${p => p.$color ? p.$color + "0a" : "transparent"} 0%, transparent 100%);
    pointer-events: none;
  }

  ${p => p.$active && css`
    border-color: ${p.$color};
    box-shadow: 0 0 0 3px ${p.$color}20, inset 0 0 20px ${p.$color}08;
    transform: translateY(-2px);
  `}
  
  ${p => p.$clickable && css`
    &:hover {
      border-color: ${p.$color || "#334155"};
      transform: translateY(-4px);
      box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
      background: linear-gradient(145deg, rgba(30,41,59,1), rgba(15,23,42,0.8));
    }
  `}

  .val {
    font-family: 'Syne', sans-serif;
    font-size: 28px;
    font-weight: 800;
    color: ${p => p.$color || "#e2e8f0"};
    line-height: 1;
    margin-bottom: 6px;
    text-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
  }
  
  .lbl {
    font-size: 11px;
    color: #64748b;
    text-transform: uppercase;
    letter-spacing: 0.7px;
    font-weight: 600;
  }
`;

// ── Toolbar ───────────────────────────────────────────────────────────────────
const Toolbar = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
  flex-wrap: wrap;
  animation: ${fadeUp} 0.6s ease both;
  animation-delay: 0.2s;
`;

const SearchBox = styled.div`
  position: relative;
  flex: 1;
  min-width: 280px;
  max-width: 380px;

  svg {
    position: absolute;
    left: 14px;
    top: 50%;
    transform: translateY(-50%);
    color: #475569;
    pointer-events: none;
  }

  input {
    width: 100%;
    padding: 10px 14px 10px 38px;
    background: linear-gradient(145deg, rgba(30,41,59,0.8), rgba(15,23,42,0.6));
    border: 1px solid rgba(56,189,248,0.2);
    border-radius: 10px;
    color: #e2e8f0;
    font-size: 13px;
    font-family: "DM Sans", sans-serif;
    transition: all 0.3s;

    &:focus {
      outline: none;
      border-color: rgba(56,189,248,0.6);
      background: linear-gradient(145deg, rgba(56,189,248,0.1), rgba(15,23,42,0.8));
      box-shadow: 0 0 0 3px rgba(56,189,248,0.1);
    }
    &::placeholder { color: #475569; }
  }
`;

const FilterTabs = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
`;

const FilterTab = styled.button`
  padding: 8px 14px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  background: ${p => p.$active ? "rgba(56,189,248,0.2)" : "rgba(30,41,59,0.6)"};
  border: 1px solid ${p => p.$active ? "rgba(56,189,248,0.5)" : "#1e293b"};
  color: ${p => p.$active ? "#38bdf8" : "#94a3b8"};
  cursor: pointer;
  transition: all 0.2s;
  font-family: "DM Sans", sans-serif;

  &:hover {
    border-color: rgba(56,189,248,0.4);
    background: rgba(56,189,248,0.1);
    color: #38bdf8;
  }
`;

const ToolbarEnd = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-left: auto;
  font-size: 12px;
  color: #64748b;
  font-weight: 500;
`;

// ── Toast ─────────────────────────────────────────────────────────────────────
const Toast = styled.div`
  position: fixed;
  top: 24px;
  right: 24px;
  z-index: 1000;
  padding: 14px 20px;
  border-radius: 11px;
  font-size: 14px;
  font-weight: 500;
  animation: ${slideIn} 0.3s ease both;
  max-width: 340px;
  box-shadow: 0 12px 28px rgba(0,0,0,0.5);
  backdrop-filter: blur(10px);

  ${p => p.$type === "success" && css`
    background: rgba(16,185,129,0.15);
    border: 1px solid rgba(16,185,129,0.4);
    color: #6ee7b7;
  `}
  ${p => p.$type === "error" && css`
    background: rgba(239,68,68,0.15);
    border: 1px solid rgba(239,68,68,0.4);
    color: #fca5a5;
  `}
`;

// ── Table ─────────────────────────────────────────────────────────────────────
const TableWrap = styled.div`
  background: linear-gradient(145deg, rgba(30,41,59,0.8), rgba(15,23,42,0.6));
  border: 1px solid rgba(56,189,248,0.15);
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0,0,0,0.2);
  animation: ${fadeUp} 0.6s ease both;
  animation-delay: 0.3s;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const Thead = styled.thead`
  background: linear-gradient(135deg, rgba(56,189,248,0.05) 0%, rgba(99,102,241,0.05) 100%);
  border-bottom: 1px solid rgba(56,189,248,0.15);

  th {
    padding: 16px 18px;
    text-align: left;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.8px;
    text-transform: uppercase;
    color: #64748b;
    white-space: nowrap;
  }
`;

const Tbody = styled.tbody``;

const Tr = styled.tr`
  border-bottom: 1px solid rgba(56,189,248,0.08);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  animation: ${fadeUp} 0.35s ease both;
  animation-delay: ${p => p.$i * 50}ms;
  cursor: pointer;

  &:last-child { border-bottom: none; }
  
  &:hover {
    background: linear-gradient(135deg, rgba(56,189,248,0.08) 0%, rgba(99,102,241,0.05) 100%);
    box-shadow: inset 0 0 0 1px rgba(56,189,248,0.1);
  }
`;

const Td = styled.td`
  padding: 18px 18px;
  font-size: 13px;
  color: #cbd5e1;
  vertical-align: middle;
`;

// ── Applicant identity cell ───────────────────────────────────────────────────
const UserCell = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
  transition: transform 0.2s;

  &:hover {
    transform: translateX(2px);
  }
`;

const Avatar = styled.div`
  width: 42px;
  height: 42px;
  border-radius: 10px;
  background: linear-gradient(135deg, ${p => p.$color || "#0ea5e9"} 0%, ${p => p.$color2 || "#06b6d4"} 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: 700;
  font-family: 'Syne', sans-serif;
  color: #fff;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  position: relative;

  &::after {
    content: '';
    position: absolute;
    inset: -2px;
    border-radius: 10px;
    background: linear-gradient(135deg, ${p => p.$color || "#0ea5e9"} 0%, ${p => p.$color2 || "#06b6d4"} 100%);
    opacity: 0.2;
    z-index: -1;
  }
`;

const UserInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 3px;

  .name {
    font-weight: 700;
    color: #e2e8f0;
    font-size: 14px;
    font-family: 'Syne', sans-serif;
    letter-spacing: -0.3px;
  }
  
  .email {
    font-size: 11px;
    color: #64748b;
    transition: color 0.2s;
  }

  @media (max-width: 600px) {
    .email { display: none; }
  }
`;

// ── Status badge ──────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  applied:     { color: "#38bdf8", bg: "rgba(56,189,248,0.1)",    label: "Applied",     icon: "📬" },
  shortlisted: { color: "#f59e0b", bg: "rgba(245,158,11,0.1)",   label: "Shortlisted", icon: "⭐" },
  rejected:    { color: "#ef4444", bg: "rgba(239,68,68,0.1)",    label: "Rejected",    icon: "❌" },
  hired:       { color: "#10b981", bg: "rgba(16,185,129,0.1)",   label: "Hired",       icon: "✅" },
  withdrawn:   { color: "#64748b", bg: "rgba(100,116,139,0.1)",  label: "Withdrawn",   icon: "🚫" },
};

// Status workflow: which statuses can transition to which
const ALLOWED_TRANSITIONS = {
  applied:     ["shortlisted"],           // Applied → can only go to Shortlisted
  shortlisted: ["hired", "rejected"],     // Shortlisted → can go to Hired or Rejected
  hired:       [],                        // Hired (final, no changes)
  rejected:    [],                        // Rejected (final, no changes)
  withdrawn:   [],                        // Withdrawn (final, no changes)
};

const StatusBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.3px;
  background: ${p => STATUS_CONFIG[p.$s]?.bg || "rgba(100,116,139,0.1)"};
  color: ${p => STATUS_CONFIG[p.$s]?.color || "#94a3b8"};
  border: 1px solid ${p => STATUS_CONFIG[p.$s]?.color ? STATUS_CONFIG[p.$s]?.color + "40" : "transparent"};
  transition: all 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px ${p => STATUS_CONFIG[p.$s]?.color ? STATUS_CONFIG[p.$s]?.color + "20" : "transparent"};
  }
`;

// ── Status dropdown ───────────────────────────────────────────────────────────
const StatusSelect = styled.select`
  padding: 8px 28px 8px 12px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  font-family: "DM Sans", sans-serif;
  cursor: pointer;
  background: linear-gradient(145deg, rgba(30,41,59,0.8), rgba(15,23,42,0.6));
  border: 1px solid rgba(56,189,248,0.2);
  color: #e2e8f0;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%2364748b' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 8px center;
  transition: all 0.3s;

  &:hover {
    border-color: rgba(56,189,248,0.5);
    background-color: linear-gradient(145deg, rgba(30,41,59,1), rgba(15,23,42,0.8));
  }

  &:focus {
    outline: none;
    border-color: rgba(56,189,248,0.8);
    box-shadow: 0 0 0 3px rgba(56,189,248,0.1);
  }

  option { background: #0f172a; }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;

// ── Cover letter expand ───────────────────────────────────────────────────────
const CLBtn = styled.button`
  font-size: 12px;
  color: #38bdf8;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  font-family: "DM Sans", sans-serif;
  font-weight: 600;
  transition: color 0.2s;
  
  &:hover {
    color: #6ee7b7;
    text-decoration: underline;
  }
`;

const CLBox = styled.div`
  margin-top: 10px;
  padding: 14px;
  background: linear-gradient(135deg, rgba(56,189,248,0.08) 0%, rgba(99,102,241,0.05) 100%);
  border: 1px solid rgba(56,189,248,0.2);
  border-radius: 10px;
  font-size: 13px;
  color: #cbd5e1;
  line-height: 1.6;
  animation: ${fadeUp} 0.2s ease both;
  max-height: 200px;
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 4px;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(56,189,248,0.3);
    border-radius: 2px;
  }
`;

// ── Skeleton ──────────────────────────────────────────────────────────────────
const SkeletonPulse = styled.div`
  background: linear-gradient(90deg, #1e293b 25%, #263348 50%, #1e293b 75%);
  background-size: 600px 100%;
  animation: ${shimmer} 1.4s infinite linear;
  border-radius: 6px;
`;

// ── Empty ─────────────────────────────────────────────────────────────────────
const Empty = styled.div`
  text-align: center;
  padding: 80px 24px;
  color: #64748b;

  .icon {
    font-size: 48px;
    margin-bottom: 16px;
    display: block;
  }
  
  .title {
    font-size: 16px;
    font-weight: 700;
    color: #e2e8f0;
    margin-bottom: 8px;
    font-family: 'Syne', sans-serif;
  }
  
  p {
    font-size: 14px;
    margin: 0;
    line-height: 1.5;
  }
`;

// ─────────────────────────────────────────────────────────────────────────────
// Avatar gradient pool
const AVATAR_COLORS = [
  ["#0ea5e9","#06b6d4"], ["#8b5cf6","#6d28d9"], ["#f59e0b","#d97706"],
  ["#10b981","#059669"], ["#ef4444","#dc2626"], ["#ec4899","#db2777"],
];

const initials = (name = "") =>
  name.split(" ").map(p => p[0]).slice(0, 2).join("").toUpperCase() || "?";

const fmtDate = (iso) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

// ── Inline cover-letter row component ────────────────────────────────────────
const ApplicantRow = ({ app, index, onStatusChange, updating, jobId, onNavigate }) => {
  const [open, setOpen] = useState(false);
  const user = app.user || {};
  const name = user.name || user.full_name || `User #${app.user_id}`;
  const [c1, c2] = AVATAR_COLORS[index % AVATAR_COLORS.length];

  const handleRowClick = (e) => {
    // Don't navigate if clicking on dropdown or status change elements
    if (e.target.closest('select') || e.target.closest('button')) {
      return;
    }
    onNavigate(jobId, app.id);
  };

  const appliedDate = new Date(app.applied_at).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

  return (
    <Tr $i={index} onClick={handleRowClick}>
      {/* Applicant */}
      <Td>
        <UserCell>
          <Avatar $color={c1} $color2={c2}>{initials(name)}</Avatar>
          <UserInfo>
            <div className="name">{name}</div>
            <div className="email">{user.email || "—"}</div>
          </UserInfo>
        </UserCell>
      </Td>

      {/* Applied on */}
      <Td>{appliedDate}</Td>

      {/* Cover letter */}
      <Td>
        {app.cover_letter ? (
          <div>
            <CLBtn onClick={() => setOpen(o => !o)}>
              {open ? "▲ Hide Letter" : "▼ View Letter"}
            </CLBtn>
            {open && <CLBox>{app.cover_letter}</CLBox>}
          </div>
        ) : (
          <span style={{ color: "#475569", fontSize: "12px" }}>—</span>
        )}
      </Td>

      {/* Status badge */}
      <Td>
        <StatusBadge $s={app.status}>
          {STATUS_CONFIG[app.status]?.icon} {STATUS_CONFIG[app.status]?.label || app.status}
        </StatusBadge>
      </Td>

      {/* Status update */}
      <Td>
        <StatusSelect
          value={app.status}
          disabled={updating === app.id || ALLOWED_TRANSITIONS[app.status]?.length === 0}
          onChange={e => onStatusChange(app.id, e.target.value)}
        >
          <option value={app.status}>{STATUS_CONFIG[app.status]?.label}</option>
          {ALLOWED_TRANSITIONS[app.status]?.map(allowedStatus => (
            <option key={allowedStatus} value={allowedStatus}>
              → {STATUS_CONFIG[allowedStatus]?.label}
            </option>
          ))}
        </StatusSelect>
      </Td>
    </Tr>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
const ApplicantsPage = () => {
  const navigate         = useNavigate();
  const { jobId }        = useParams();
  const { recruiter }    = useSelector(s => s.auth);

  const [job,         setJob]         = useState(null);
  const [apps,        setApps]        = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [filter,      setFilter]      = useState("all");   // "all" or status value
  const [search,      setSearch]      = useState("");
  const [updating,    setUpdating]    = useState(null);    // app id being updated
  const [toast,       setToast]       = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3200);
  };

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [jobRes, appRes] = await Promise.all([
        jobAPI.getJob(jobId),
        jobAPI.getJobApplicants(jobId),
      ]);
      setJob(jobRes.job);
      setApps(appRes.applications);
    } catch (err) {
      showToast(err?.errors?.general || "Failed to load applicants", "error");
    } finally {
      setLoading(false);
    }
  }, [jobId]);

  useEffect(() => {
    if (!recruiter) { navigate("/recruiter/login"); return; }
    fetchData();
  }, [recruiter, navigate, fetchData]);

  const handleStatusChange = async (appId, newStatus) => {
    try {
      setUpdating(appId);
      await jobAPI.updateApplicationStatus(jobId, appId, newStatus);
      setApps(prev => prev.map(a => a.id === appId ? { ...a, status: newStatus } : a));
      showToast(`Status updated to "${STATUS_CONFIG[newStatus]?.label}"`);
    } catch (err) {
      showToast(err?.errors?.general || "Failed to update status", "error");
    } finally {
      setUpdating(null);
    }
  };

  const handleNavigateToCandidate = (jId, appId) => {
    navigate(`/recruiter/jobs/${jId}/candidates/${appId}`);
  };

  // ── Counts for stat bar ────────────────────────────────────────────
  const counts = apps.reduce((acc, a) => {
    acc[a.status] = (acc[a.status] || 0) + 1;
    return acc;
  }, {});

  // ── Filtered list ──────────────────────────────────────────────────
  const visible = apps
    .filter(a => filter === "all" || a.status === filter)
    .filter(a => {
      if (!search.trim()) return true;
      const name  = (a.user?.name || a.user?.full_name || "").toLowerCase();
      const email = (a.user?.email || "").toLowerCase();
      const q     = search.toLowerCase();
      return name.includes(q) || email.includes(q);
    });

  if (!recruiter) return null;

  return (
    <RecruiterLayout>
      <Page>
        <Inner>
          {toast && <Toast $type={toast.type}>{toast.msg}</Toast>}

          {/* ── Hero Section ── */}
          <HeroSection>
            <HeroContent>
              <HeroTitle>
                {loading ? "📋 Loading Applicants…" : `📋 ${job?.title || "Job Applicants"}`}
              </HeroTitle>
              <HeroSubtitle>
                {loading
                  ? "Fetching applicant data..."
                  : `Manage and review ${apps.length} application${apps.length !== 1 ? "s" : ""} for this position`}
              </HeroSubtitle>
              
              {job && (
                <JobMeta>
                  <MetaChip>💼 {job.type}</MetaChip>
                  <MetaChip>📍 {job.location_type} · {job.location}</MetaChip>
                  <MetaChip>🎯 {job.experience}</MetaChip>
                  <MetaChip>
                    {job.is_active ? "🟢 Active" : "⚫ Inactive"}
                  </MetaChip>
                </JobMeta>
              )}
            </HeroContent>
          </HeroSection>

          {/* ── Stats bar ── */}
          {!loading && (
            <StatsBar>
              <StatCard
                $color="#94a3b8"
                $clickable
                $active={filter === "all"}
                onClick={() => setFilter("all")}
              >
                <div className="val">{apps.length}</div>
                <div className="lbl">Total</div>
              </StatCard>
              {Object.entries(STATUS_CONFIG).map(([key, { color, label }]) => (
                <StatCard
                  key={key}
                  $color={color}
                  $clickable
                  $active={filter === key}
                  onClick={() => setFilter(filter === key ? "all" : key)}
                >
                  <div className="val">{counts[key] || 0}</div>
                  <div className="lbl">{label}</div>
                </StatCard>
              ))}
            </StatsBar>
          )}

          {/* ── Toolbar & Filters ── */}
          <Toolbar>
            <SearchBox>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              <input
                placeholder="Search by name or email…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </SearchBox>
            <ToolbarEnd>
              Showing {visible.length} of {apps.length}
              {filter !== "all" && ` · ${STATUS_CONFIG[filter]?.label}`}
            </ToolbarEnd>
          </Toolbar>

          {/* ── Table ── */}
          <TableWrap>
            <Table>
              <Thead>
                <tr>
                  <th>💁 Applicant</th>
                  <th>📅 Applied Date</th>
                  <th>💌 Cover Letter</th>
                  <th>📊 Current Status</th>
                  <th>⚙️ Update Status</th>
                </tr>
              </Thead>
              <Tbody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <Tr key={i} $i={0}>
                      <Td>
                        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                          <SkeletonPulse style={{ width: 42, height: 42, borderRadius: "10px" }} />
                          <div style={{ flex: 1 }}>
                            <SkeletonPulse style={{ height: 16, width: "60%", marginBottom: 6 }} />
                            <SkeletonPulse style={{ height: 12, width: "40%" }} />
                          </div>
                        </div>
                      </Td>
                      {[1,2,3,4].map(j => (
                        <Td key={j}><SkeletonPulse style={{ height: 14, width: "70%" }} /></Td>
                      ))}
                    </Tr>
                  ))
                ) : visible.length === 0 ? (
                  <tr>
                    <td colSpan={5}>
                      <Empty>
                        <span className="icon">🔍</span>
                        <div className="title">
                          {search
                            ? "No results found"
                            : filter !== "all"
                            ? `No ${STATUS_CONFIG[filter]?.label.toLowerCase()} applicants`
                            : "No applications yet"}
                        </div>
                        <p>
                          {search
                            ? "Try adjusting your search terms"
                            : filter !== "all"
                            ? `Applicants with this status will appear here`
                            : "Applicants will appear here once they submit their applications"}
                        </p>
                      </Empty>
                    </td>
                  </tr>
                ) : (
                  visible.map((app, i) => (
                    <ApplicantRow
                      key={app.id}
                      app={app}
                      index={i}
                      onStatusChange={handleStatusChange}
                      updating={updating}
                      jobId={jobId}
                      onNavigate={handleNavigateToCandidate}
                    />
                  ))
                )}
              </Tbody>
            </Table>
          </TableWrap>

          {!loading && visible.length > 0 && (
            <div style={{ textAlign: "center", marginTop: "24px", fontSize: "12px", color: "#64748b" }}>
              📊 Displaying {visible.length} applicant{visible.length !== 1 ? "s" : ""} • Click a row to view full profile
            </div>
          )}
        </Inner>
      </Page>
    </RecruiterLayout>
  );
};

export default ApplicantsPage;