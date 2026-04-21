// pages/recruiter/AllApplicantsPage.jsx
import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import styled, { keyframes } from "styled-components";
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

// ── Layout ────────────────────────────────────────────────────────────────────
const Page = styled.div`
  width: 100%;
  color: #e2e8f0;
  font-family: "DM Sans", sans-serif;
  animation: ${fadeUp} 0.4s ease both;
`;

const Inner = styled.div`
  max-width: 1280px;
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
`;

// ── Stats Bar ───────────────────────────────────────────────────────────────
const StatsBar = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 12px;
  margin-bottom: 24px;
`;

const StatCard = styled.div`
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(56, 189, 248, 0.2);
  border-radius: 12px;
  padding: 16px;
  text-align: center;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;

  &:hover {
    border-color: rgba(56, 189, 248, 0.4);
    background: rgba(56, 189, 248, 0.08);
    transform: translateY(-2px);
  }

  .val {
    font-family: 'Syne', sans-serif;
    font-size: 24px;
    font-weight: 800;
    color: #38bdf8;
    margin-bottom: 4px;
  }

  .lbl {
    font-size: 11px;
    color: #64748b;
    text-transform: uppercase;
    letter-spacing: 0.6px;
    font-weight: 600;
  }
`;

// ── Toolbar ───────────────────────────────────────────────────────────────────
const Toolbar = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  flex-wrap: wrap;
`;

const SearchBox = styled.div`
  flex: 1;
  min-width: 200px;
  display: flex;
  align-items: center;
  gap: 10px;
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(56, 189, 248, 0.15);
  border-radius: 10px;
  padding: 8px 12px;
  transition: all 0.2s;

  &:focus-within {
    border-color: rgba(56, 189, 248, 0.4);
    background: rgba(56, 189, 248, 0.05);
  }

  input {
    flex: 1;
    background: transparent;
    border: none;
    outline: none;
    color: #e2e8f0;
    font-size: 13px;
    font-family: "DM Sans", sans-serif;

    &::placeholder {
      color: #475569;
    }
  }
`;

const StatusPill = styled.button`
  padding: 7px 16px;
  background: ${p => p.$active ? "rgba(56,189,248,0.2)" : "rgba(255,255,255,0.04)"};
  border: 1px solid ${p => p.$active ? "rgba(56,189,248,0.4)" : "rgba(100,116,139,0.2)"};
  border-radius: 10px;
  color: ${p => p.$active ? "#38bdf8" : "#94a3b8"};
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  font-family: "DM Sans", sans-serif;

  &:hover {
    border-color: rgba(56, 189, 248, 0.3);
    background: rgba(56, 189, 248, 0.08);
  }
`;

// ── Table ─────────────────────────────────────────────────────────────────────
const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  animation: ${slideIn} 0.5s ease both;
`;

const Thead = styled.thead`
  background: rgba(15, 23, 42, 0.4);
  border-bottom: 1px solid rgba(56, 189, 248, 0.1);
`;

const Th = styled.th`
  padding: 12px 16px;
  text-align: left;
  font-size: 12px;
  font-weight: 700;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const Tbody = styled.tbody``;

const Tr = styled.tr`
  border-bottom: 1px solid rgba(56, 189, 248, 0.08);
  transition: all 0.2s;
  cursor: pointer;

  &:hover {
    background: rgba(56, 189, 248, 0.05);
  }
`;

const Td = styled.td`
  padding: 14px 16px;
  font-size: 13px;
  color: #cbd5e1;
`;

const ApplicantName = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;

  .avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: linear-gradient(135deg, #38bdf8, #6366f1);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: 700;
    color: white;
    flex-shrink: 0;
  }

  .info {
    flex: 1;
    min-width: 0;

    .name {
      font-weight: 600;
      color: #e2e8f0;
      margin-bottom: 2px;
    }

    .email {
      font-size: 11px;
      color: #64748b;
    }
  }
`;

const JobBadge = styled.span`
  display: inline-block;
  background: rgba(99, 102, 241, 0.15);
  border: 1px solid rgba(99, 102, 241, 0.3);
  color: #818cf8;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 11px;
  max-width: 150px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StatusBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: ${p => {
    switch(p.$status) {
      case 'applied': return 'rgba(56,189,248,0.1)';
      case 'shortlisted': return 'rgba(245,158,11,0.1)';
      case 'hired': return 'rgba(16,185,129,0.1)';
      case 'rejected': return 'rgba(239,68,68,0.1)';
      default: return 'rgba(100,116,139,0.1)';
    }
  }};
  color: ${p => {
    switch(p.$status) {
      case 'applied': return '#38bdf8';
      case 'shortlisted': return '#f59e0b';
      case 'hired': return '#10b981';
      case 'rejected': return '#ef4444';
      default: return '#94a3b8';
    }
  }};
  border: 1px solid;
  border-color: ${p => {
    switch(p.$status) {
      case 'applied': return 'rgba(56,189,248,0.3)';
      case 'shortlisted': return 'rgba(245,158,11,0.3)';
      case 'hired': return 'rgba(16,185,129,0.3)';
      case 'rejected': return 'rgba(239,68,68,0.3)';
      default: return 'rgba(100,116,139,0.3)';
    }
  }};
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
  white-space: nowrap;
`;

const StatusDropdown = styled.select`
  background: rgba(56, 189, 248, 0.1);
  border: 1px solid rgba(56, 189, 248, 0.3);
  color: #38bdf8;
  padding: 6px 10px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  font-family: "DM Sans", sans-serif;
  transition: all 0.2s;

  &:hover {
    border-color: rgba(56, 189, 248, 0.5);
    background: rgba(56, 189, 248, 0.15);
  }

  &:focus {
    outline: none;
    border-color: #38bdf8;
  }

  option {
    background: #0f172a;
    color: #e2e8f0;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;

  .emoji {
    font-size: 48px;
    margin-bottom: 12px;
  }

  .text {
    color: #94a3b8;
    font-size: 14px;
  }
`;

const Toast = styled.div`
  position: fixed;
  bottom: 24px;
  right: 24px;
  background: ${p => p.$type === 'error' ? '#ef4444' : '#10b981'};
  color: white;
  padding: 12px 20px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  animation: ${slideIn} 0.3s ease both;
  z-index: 1000;

  @media (max-width: 640px) {
    left: 16px;
    right: 16px;
  }
`;

// ── Constants ──────────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  applied:     { label: "Applied",     icon: "📬" },
  shortlisted: { label: "Shortlisted", icon: "⭐" },
  hired:       { label: "Hired",       icon: "✅" },
  rejected:    { label: "Rejected",    icon: "❌" },
  withdrawn:   { label: "Withdrawn",   icon: "🚫" },
};

// Status workflow: which statuses can transition to which
const ALLOWED_TRANSITIONS = {
  applied:     ["shortlisted"],           // Applied → can only go to Shortlisted
  shortlisted: ["hired", "rejected"],     // Shortlisted → can go to Hired or Rejected
  hired:       [],                        // Hired (final, no changes)
  rejected:    [],                        // Rejected (final, no changes)
  withdrawn:   [],                        // Withdrawn (final, no changes)
};

// ── Main Component ────────────────────────────────────────────────────────────
const AllApplicantsPage = () => {
  const navigate = useNavigate();
  const { recruiter } = useSelector(s => s.auth);

  const [allApps, setAllApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [toast, setToast] = useState(null);
  const [updating, setUpdating] = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3200);
  };

  // Fetch all jobs and their applicants
  const fetchAllApplicants = useCallback(async () => {
    try {
      setLoading(true);
      const res = await jobAPI.getMyJobs(1, 100);
      const jobs = res.jobs || [];

      // Fetch applicants for each job
      const allApplicantsData = [];
      for (const job of jobs) {
        try {
          const appRes = await jobAPI.getJobApplicants(job.id);
          const applicants = appRes.applications || [];
          
          // Add job info to each applicant
          applicants.forEach(app => {
            allApplicantsData.push({
              ...app,
              jobId: job.id,
              jobTitle: job.title,
            });
          });
        } catch (err) {
          console.error(`Failed to fetch applicants for job ${job.id}:`, err);
        }
      }

      setAllApps(allApplicantsData);
    } catch (err) {
      showToast(err?.errors?.general || "Failed to load applicants", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!recruiter) {
      navigate("/recruiter/login");
      return;
    }
    fetchAllApplicants();
  }, [recruiter, navigate, fetchAllApplicants]);

  // Handle status change
  const handleStatusChange = async (app, newStatus) => {
    try {
      setUpdating(app.id);
      await jobAPI.updateApplicationStatus(app.jobId, app.id, newStatus);
      setAllApps(prev => prev.map(a => a.id === app.id ? { ...a, status: newStatus } : a));
      showToast(`Status updated to "${STATUS_CONFIG[newStatus]?.label}"`);
    } catch (err) {
      showToast(err?.errors?.general || "Failed to update status", "error");
    } finally {
      setUpdating(null);
    }
  };

  // Filter & search logic
  const filtered = allApps.filter(app => {
    const matchesStatus = filterStatus === "all" || app.status === filterStatus;
    const q = search.toLowerCase().trim();
    if (!q) return matchesStatus;
    
    const name = (app.user?.name || app.user?.full_name || "").toLowerCase();
    const email = (app.user?.email || "").toLowerCase();
    const jobTitle = (app.jobTitle || "").toLowerCase();
    
    return matchesStatus && (name.includes(q) || email.includes(q) || jobTitle.includes(q));
  });

  // Stats
  const stats = {
    total: allApps.length,
    applied: allApps.filter(a => a.status === "applied").length,
    shortlisted: allApps.filter(a => a.status === "shortlisted").length,
    hired: allApps.filter(a => a.status === "hired").length,
    rejected: allApps.filter(a => a.status === "rejected").length,
  };

  if (!recruiter) return null;

  return (
    <RecruiterLayout>
      <Page>
        <Inner>
          {toast && <Toast $type={toast.type}>{toast.msg}</Toast>}

          {/* Hero */}
          <HeroSection>
            <HeroContent>
              <HeroTitle>
                {loading ? "📋 Loading Applicants…" : "📋 All Applicants"}
              </HeroTitle>
              <HeroSubtitle>
                {loading
                  ? "Fetching applicants from all your jobs..."
                  : `Manage and review ${allApps.length} application${allApps.length !== 1 ? "s" : ""} across all your job postings`}
              </HeroSubtitle>
            </HeroContent>
          </HeroSection>

          {/* Stats Bar */}
          <StatsBar>
            <StatCard onClick={() => setFilterStatus("all")}>
              <div className="val">{stats.total}</div>
              <div className="lbl">Total</div>
            </StatCard>
            <StatCard onClick={() => setFilterStatus("applied")}>
              <div className="val">{stats.applied}</div>
              <div className="lbl">Applied</div>
            </StatCard>
            <StatCard onClick={() => setFilterStatus("shortlisted")}>
              <div className="val">{stats.shortlisted}</div>
              <div className="lbl">Shortlisted</div>
            </StatCard>
            <StatCard onClick={() => setFilterStatus("hired")}>
              <div className="val">{stats.hired}</div>
              <div className="lbl">Hired</div>
            </StatCard>
            <StatCard onClick={() => setFilterStatus("rejected")}>
              <div className="val">{stats.rejected}</div>
              <div className="lbl">Rejected</div>
            </StatCard>
          </StatsBar>

          {/* Toolbar */}
          <Toolbar>
            <SearchBox>
              <span>🔍</span>
              <input
                placeholder="Search by name, email, or job..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </SearchBox>
            <StatusPill $active={filterStatus === "all"} onClick={() => setFilterStatus("all")}>
              All
            </StatusPill>
            {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
              <StatusPill key={key} $active={filterStatus === key} onClick={() => setFilterStatus(key)}>
                {cfg.icon} {cfg.label}
              </StatusPill>
            ))}
          </Toolbar>

          {/* Table */}
          {loading ? (
            <EmptyState>
              <div className="emoji">⏳</div>
              <div className="text">Loading applicants...</div>
            </EmptyState>
          ) : filtered.length === 0 ? (
            <EmptyState>
              <div className="emoji">😴</div>
              <div className="text">
                {allApps.length === 0 ? "No applicants yet" : "No applicants match your filters"}
              </div>
            </EmptyState>
          ) : (
            <Table>
              <Thead>
                <Tr>
                  <Th style={{ width: "35%" }}>Applicant</Th>
                  <Th style={{ width: "25%" }}>Applied For</Th>
                  <Th style={{ width: "15%" }}>Status</Th>
                  <Th style={{ width: "25%" }}>Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {filtered.map(app => (
                  <Tr key={app.id} onClick={() => navigate(`/recruiter/jobs/${app.jobId}/candidates/${app.id}`)}>
                    <Td>
                      <ApplicantName>
                        <div className="avatar">
                          {(app.user?.name?.charAt(0) || app.user?.full_name?.charAt(0) || "?").toUpperCase()}
                        </div>
                        <div className="info">
                          <div className="name">{app.user?.name || app.user?.full_name || "Unknown"}</div>
                          <div className="email">{app.user?.email || "—"}</div>
                        </div>
                      </ApplicantName>
                    </Td>
                    <Td>
                      <JobBadge title={app.jobTitle}>{app.jobTitle}</JobBadge>
                    </Td>
                    <Td>
                      <StatusBadge $status={app.status}>
                        {STATUS_CONFIG[app.status]?.icon} {STATUS_CONFIG[app.status]?.label}
                      </StatusBadge>
                    </Td>
                    <Td onClick={e => e.stopPropagation()}>
                      <StatusDropdown
                        value={app.status}
                        onChange={e => handleStatusChange(app, e.target.value)}
                        disabled={updating === app.id || ALLOWED_TRANSITIONS[app.status]?.length === 0}
                      >
                        <option value={app.status}>{STATUS_CONFIG[app.status]?.label}</option>
                        {ALLOWED_TRANSITIONS[app.status]?.map(allowedStatus => (
                          <option key={allowedStatus} value={allowedStatus}>
                            → {STATUS_CONFIG[allowedStatus]?.label}
                          </option>
                        ))}
                      </StatusDropdown>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          )}
        </Inner>
      </Page>
    </RecruiterLayout>
  );
};

export default AllApplicantsPage;
