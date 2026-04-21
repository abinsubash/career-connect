// pages/recruiter/JobsPage.jsx
import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import styled, { keyframes, css } from "styled-components";
import jobAPI from "../../api/jobAPI";
import { RecruiterLayout } from "../../components/RecruiterLayout";

// ── Animations ────────────────────────────────────────────────────────────────
const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const shimmer = keyframes`
  0%   { background-position: -600px 0; }
  100% { background-position:  600px 0; }
`;

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.4; }
`;

const slideIn = keyframes`
  from { opacity: 0; transform: translateX(40px); }
  to   { opacity: 1; transform: translateX(0); }
`;

// ── Base ──────────────────────────────────────────────────────────────────────
const Page = styled.div`
  width: 100%;
  color: #e2e8f0;
  font-family: "DM Sans", sans-serif;
  animation: ${fadeUp} 0.4s ease both;
`;

const Inner = styled.div`
  max-width: 1280px;
  margin: 0 auto;
`;

// ── Header ────────────────────────────────────────────────────────────────────
const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 36px;
  gap: 16px;
  flex-wrap: wrap;
`;

const TitleBlock = styled.div`
  h1 {
    font-size: 30px;
    font-weight: 700;
    margin: 0 0 4px;
    letter-spacing: -0.5px;
    background: linear-gradient(135deg, #e2e8f0 0%, #94a3b8 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  p { font-size: 13px; color: #64748b; margin: 0; }
`;

const PostButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 11px 22px;
  background: linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%);
  color: #fff;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: box-shadow 0.25s, transform 0.2s;
  font-family: "DM Sans", sans-serif;
  white-space: nowrap;

  &:hover { transform: translateY(-2px); box-shadow: 0 10px 24px rgba(6,182,212,0.35); }
  &:active { transform: translateY(0); }
`;

// ── Toolbar ───────────────────────────────────────────────────────────────────
const Toolbar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 28px;
  flex-wrap: wrap;
`;

const FilterPills = styled.div`display: flex; gap: 8px;`;

const Pill = styled.button`
  padding: 7px 18px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  font-family: "DM Sans", sans-serif;
  border: 1px solid ${p => p.$active ? "#06b6d4" : "#1e293b"};
  background: ${p => p.$active ? "rgba(6,182,212,0.15)" : "rgba(30,41,59,0.6)"};
  color: ${p => p.$active ? "#06b6d4" : "#94a3b8"};
  &:hover { border-color: #06b6d4; color: #06b6d4; }
`;

const CountBadge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  margin-left: 6px;
  border-radius: 10px;
  background: rgba(6,182,212,0.25);
  color: #06b6d4;
  font-size: 11px;
  font-weight: 700;
`;

const SearchBox = styled.div`
  position: relative;
  flex: 1;
  max-width: 280px;

  svg {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    color: #475569;
    pointer-events: none;
  }
  input {
    width: 100%;
    padding: 9px 12px 9px 36px;
    background: rgba(30,41,59,0.6);
    border: 1px solid #1e293b;
    border-radius: 8px;
    color: #e2e8f0;
    font-size: 13px;
    font-family: "DM Sans", sans-serif;
    transition: border-color 0.2s, background 0.2s;
    &:focus { outline: none; border-color: #06b6d4; background: rgba(6,182,212,0.05); }
    &::placeholder { color: #475569; }
  }
`;

// ── Toast ─────────────────────────────────────────────────────────────────────
const Toast = styled.div`
  position: fixed;
  top: 24px;
  right: 24px;
  z-index: 700;
  padding: 14px 20px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  animation: ${slideIn} 0.3s ease both;
  max-width: 340px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.4);
  ${p => p.$type === "success" && css`background:rgba(16,185,129,0.15);border:1px solid #10b981;color:#6ee7b7;`}
  ${p => p.$type === "error"   && css`background:rgba(239,68,68,0.15); border:1px solid #ef4444;color:#fca5a5;`}
`;

// ── Grid ──────────────────────────────────────────────────────────────────────
const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 20px;
`;

// ── Card ──────────────────────────────────────────────────────────────────────
const Card = styled.div`
  position: relative;
  background: linear-gradient(145deg, #1e293b 0%, #0f172a 100%);
  border: 1px solid #1e293b;
  border-radius: 14px;
  padding: 24px;
  transition: border-color 0.25s, box-shadow 0.25s, transform 0.25s;
  animation: ${fadeUp} 0.4s ease both;
  animation-delay: ${p => p.$i * 60}ms;
  &:hover { border-color: #334155; box-shadow: 0 12px 32px rgba(0,0,0,0.4); transform: translateY(-3px); }
`;

const PriorityDot = styled.div`
  position: absolute;
  top: 20px; right: 20px;
  width: 8px; height: 8px;
  border-radius: 50%;
  background: ${p => p.$p === "Urgent" ? "#ef4444" : p.$p === "Normal" ? "#06b6d4" : "#64748b"};
  box-shadow: 0 0 0 3px ${p => p.$p === "Urgent" ? "rgba(239,68,68,0.2)" : p.$p === "Normal" ? "rgba(6,182,212,0.2)" : "rgba(100,116,139,0.2)"};
  ${p => p.$p === "Urgent" && css`animation: ${pulse} 1.8s infinite;`}
`;

const CardTop = styled.div`
  display: flex; align-items: flex-start; gap: 14px;
  margin-bottom: 16px; padding-right: 20px;
`;

const JobIcon = styled.div`
  width: 44px; height: 44px; border-radius: 10px;
  background: rgba(6,182,212,0.1); border: 1px solid rgba(6,182,212,0.2);
  display: flex; align-items: center; justify-content: center;
  font-size: 20px; flex-shrink: 0;
`;

const CardTitle = styled.div`
  h3 { font-size: 16px; font-weight: 600; color: #e2e8f0; margin: 0 0 4px; line-height: 1.3; }
  span { font-size: 12px; color: #64748b; }
`;

const Tags = styled.div`display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 14px;`;

const Tag = styled.span`
  padding: 3px 10px; border-radius: 4px; font-size: 11px; font-weight: 600; letter-spacing: 0.3px;
  ${p => p.$v === "type"     && css`background:rgba(6,182,212,0.12);color:#22d3ee;border:1px solid rgba(6,182,212,0.2);`}
  ${p => p.$v === "loc"      && css`background:rgba(148,163,184,0.08);color:#94a3b8;border:1px solid rgba(148,163,184,0.15);`}
  ${p => p.$v === "active"   && css`background:rgba(16,185,129,0.1);color:#34d399;border:1px solid rgba(16,185,129,0.2);`}
  ${p => p.$v === "inactive" && css`background:rgba(239,68,68,0.1);color:#f87171;border:1px solid rgba(239,68,68,0.2);`}
`;

const Desc = styled.p`
  font-size: 13px; color: #64748b; line-height: 1.6; margin: 0 0 16px;
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
`;

const Divider = styled.div`
  height: 1px; background: linear-gradient(90deg,#1e293b,#334155,#1e293b); margin: 0 0 16px;
`;

const Stats = styled.div`
  display: grid; grid-template-columns: repeat(3,1fr); gap: 12px; margin-bottom: 18px;
`;

const Stat = styled.div`
  text-align: center; padding: 10px 6px;
  background: rgba(15,23,42,0.6); border-radius: 8px; border: 1px solid #1e293b;
  .val { font-size: 18px; font-weight: 700; color: #e2e8f0; line-height: 1; margin-bottom: 4px; }
  .lbl { font-size: 10px; color: #475569; text-transform: uppercase; letter-spacing: 0.5px; }
`;

const Actions = styled.div`display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px;`;

const ActionBtn = styled.button`
  padding: 9px 6px; border-radius: 8px; font-size: 12px; font-weight: 600;
  cursor: pointer; transition: all 0.2s; font-family: "DM Sans", sans-serif;
  display: flex; align-items: center; justify-content: center; gap: 5px;

  ${p => p.$v === "applicants" && css`
    background:rgba(6,182,212,0.12);border:1px solid rgba(6,182,212,0.3);color:#06b6d4;
    &:hover{background:rgba(6,182,212,0.22);}
  `}
  ${p => p.$v === "toggle" && css`
    background:rgba(16,185,129,0.12);border:1px solid rgba(16,185,129,0.3);color:#10b981;
    &:hover{background:rgba(16,185,129,0.22);}
    &.inactive { background:rgba(239,68,68,0.12);border-color:rgba(239,68,68,0.3);color:#f87171; }
    &.inactive:hover { background:rgba(239,68,68,0.22); }
  `}
  ${p => p.$v === "edit" && css`
    background:rgba(148,163,184,0.08);border:1px solid #1e293b;color:#94a3b8;
    &:hover{border-color:#06b6d4;color:#06b6d4;background:rgba(6,182,212,0.06);}
  `}
  ${p => p.$v === "delete" && css`
    background:rgba(239,68,68,0.08);border:1px solid rgba(239,68,68,0.2);color:#f87171;
    &:hover{background:rgba(239,68,68,0.18);}
  `}
  &:disabled { opacity: 0.4; cursor: not-allowed; }
`;

// ── Skeleton ──────────────────────────────────────────────────────────────────
const SkeletonPulse = styled.div`
  background: linear-gradient(90deg,#1e293b 25%,#263348 50%,#1e293b 75%);
  background-size: 600px 100%;
  animation: ${shimmer} 1.4s infinite linear;
  border-radius: 6px;
`;

const SkeletonCard = styled.div`
  background: #111827; border: 1px solid #1e293b; border-radius: 14px;
  padding: 24px; display: flex; flex-direction: column; gap: 12px;
`;

// ── Empty ─────────────────────────────────────────────────────────────────────
const Empty = styled.div`
  grid-column: 1/-1; text-align: center; padding: 72px 24px;
  .icon { font-size: 48px; margin-bottom: 16px; }
  h2 { font-size: 22px; font-weight: 600; color: #e2e8f0; margin: 0 0 8px; }
  p  { font-size: 14px; color: #64748b; margin: 0 0 24px; }
`;

// ── Pagination ────────────────────────────────────────────────────────────────
const Pager = styled.div`
  display: flex; align-items: center; justify-content: center; gap: 8px; margin-top: 36px;
`;

const PagerBtn = styled.button`
  padding: 8px 16px; border-radius: 8px; font-size: 13px; font-weight: 500;
  cursor: pointer; transition: all 0.2s; font-family: "DM Sans", sans-serif;
  background: ${p => p.$active ? "rgba(6,182,212,0.15)" : "rgba(30,41,59,0.6)"};
  border: 1px solid ${p => p.$active ? "#06b6d4" : "#1e293b"};
  color: ${p => p.$active ? "#06b6d4" : "#94a3b8"};
  &:hover:not(:disabled) { border-color: #06b6d4; color: #06b6d4; }
  &:disabled { opacity: 0.3; cursor: not-allowed; }
`;

// ── Delete Confirm Modal ──────────────────────────────────────────────────────
const Overlay = styled.div`
  position: fixed; inset: 0; background: rgba(0,0,0,0.7);
  backdrop-filter: blur(4px); z-index: 500;
  display: flex; align-items: center; justify-content: center; padding: 24px;
  animation: ${fadeUp} 0.2s ease both;
`;

const DelModal = styled.div`
  background: linear-gradient(145deg,#1e293b,#0f172a); border: 1px solid #334155;
  border-radius: 16px; padding: 32px; max-width: 400px; width: 100%;
  box-shadow: 0 24px 64px rgba(0,0,0,0.6);
  h3 { font-size: 20px; font-weight: 600; color: #e2e8f0; margin: 0 0 8px; }
  p  { font-size: 14px; color: #94a3b8; margin: 0 0 28px; line-height: 1.6; }
`;

const DelActions = styled.div`display: flex; gap: 12px; justify-content: flex-end;`;

const DelBtn = styled.button`
  padding: 10px 22px; border-radius: 8px; font-size: 14px; font-weight: 600;
  cursor: pointer; transition: all 0.2s; font-family: "DM Sans", sans-serif;
  ${p => p.$danger && css`
    background:rgba(239,68,68,0.15);border:1px solid #ef4444;color:#f87171;
    &:hover{background:rgba(239,68,68,0.25);}
  `}
  ${p => !p.$danger && css`
    background:transparent;border:1px solid #334155;color:#94a3b8;
    &:hover{border-color:#64748b;}
  `}
  &:disabled { opacity: 0.4; cursor: not-allowed; }
`;

// ── Helpers ───────────────────────────────────────────────────────────────────
const TYPE_EMOJI = {
  "Full-time":"💼","Part-time":"⏰",Contract:"📋",Internship:"🎓",Freelance:"🚀",
};

const SALARY_FMT = (n) => {
  if (!n && n !== 0) return "—";
  if (n >= 100000) return `₹${(n/100000).toFixed(1)}L`;
  return `₹${(n/1000).toFixed(0)}K`;
};

// ─────────────────────────────────────────────────────────────────────────────
const JobsPage = () => {
  const navigate        = useNavigate();
  const { recruiter, token }   = useSelector(s => s.auth);

  const [jobs,      setJobs]      = useState([]);
  const [total,     setTotal]     = useState(0);
  const [pages,     setPages]     = useState(1);
  const [loading,   setLoading]   = useState(true);
  const [filter,    setFilter]    = useState("all");
  const [search,    setSearch]    = useState("");
  const [page,      setPage]      = useState(1);
  const [toast,     setToast]     = useState(null);

  // ── Delete modal state ─────────────────────────────────────────────
  const [delTarget, setDelTarget] = useState(null);
  const [deleting,  setDeleting]  = useState(false);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchJobs = useCallback(async () => {
    try {
      setLoading(true);
      const res = await jobAPI.getMyJobs(page, 12, filter);
      setJobs(res.jobs);
      setTotal(res.pagination.total);
      setPages(res.pagination.pages);
    } catch (err) {
      showToast(err?.errors?.general || "Failed to load jobs", "error");
    } finally {
      setLoading(false);
    }
  }, [page, filter]);

  useEffect(() => {
    // Auth is already loaded by App.jsx, so recruiter will be present
    if (recruiter && token) {
      fetchJobs();
    }
  }, [recruiter, token, fetchJobs]);

  const confirmDelete = async () => {
    if (!delTarget) return;
    try {
      setDeleting(true);
      await jobAPI.deleteJob(delTarget.id);
      setJobs(prev => prev.filter(j => j.id !== delTarget.id));
      setTotal(t => t - 1);
      showToast("Job deleted successfully");
    } catch (err) {
      showToast(err?.errors?.general || "Failed to delete", "error");
    } finally {
      setDeleting(false);
      setDelTarget(null);
    }
  };

  const handleToggleStatus = async (jobId, currentStatus) => {
    try {
      const newStatus = !currentStatus;
      await jobAPI.toggleJobStatus(jobId, newStatus);
      setJobs(prev => prev.map(j => j.id === jobId ? { ...j, is_active: newStatus } : j));
      showToast(`Job ${newStatus ? "activated" : "deactivated"} successfully`);
    } catch (err) {
      showToast(err?.errors?.general || "Failed to toggle job status", "error");
    }
  };

  const visible = search.trim()
    ? jobs.filter(j =>
        j.title.toLowerCase().includes(search.toLowerCase()) ||
        j.department.toLowerCase().includes(search.toLowerCase()) ||
        j.location.toLowerCase().includes(search.toLowerCase())
      )
    : jobs;

  if (!recruiter) return null;

  return (
    <RecruiterLayout>
      <Page>
        <Inner>

          {toast && <Toast $type={toast.type}>{toast.msg}</Toast>}

          <Header>
            <TitleBlock>
              <h1>Job Postings</h1>
              <p>{total} total posting{total !== 1 ? "s" : ""}</p>
            </TitleBlock>
            <PostButton onClick={() => navigate("/recruiter/jobs/add")}>
              <span>＋</span> Post New Job
            </PostButton>
          </Header>

          <Toolbar>
            <FilterPills>
              {["all","active","inactive"].map(f => (
                <Pill key={f} $active={filter === f}
                  onClick={() => { setFilter(f); setPage(1); }}>
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                  {f === "all" && total > 0 && <CountBadge>{total}</CountBadge>}
                </Pill>
              ))}
            </FilterPills>
            <SearchBox>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              <input placeholder="Search jobs…" value={search}
                onChange={e => setSearch(e.target.value)} />
            </SearchBox>
          </Toolbar>

          <Grid>
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <SkeletonCard key={i}>
                  <SkeletonPulse style={{ height: 20, width: "60%" }} />
                  <SkeletonPulse style={{ height: 14, width: "40%" }} />
                  <SkeletonPulse style={{ height: 48 }} />
                  <SkeletonPulse style={{ height: 72 }} />
                </SkeletonCard>
              ))
            ) : visible.length === 0 ? (
              <Empty>
                <div className="icon">📭</div>
                <h2>{search ? "No matching jobs" : "No jobs yet"}</h2>
                <p>{search ? "Try a different search term" : "Create your first job posting"}</p>
                {!search && (
                  <PostButton onClick={() => navigate("/recruiter/jobs/add")}>
                    Post Your First Job
                  </PostButton>
                )}
              </Empty>
            ) : (
              visible.map((job, i) => (
                <Card key={job.id} $i={i}>
                  <PriorityDot $p={job.priority} title={`Priority: ${job.priority}`} />

                  <CardTop>
                    <JobIcon>{TYPE_EMOJI[job.type] || "💼"}</JobIcon>
                    <CardTitle>
                      <h3>{job.title}</h3>
                      <span>{job.department}</span>
                    </CardTitle>
                  </CardTop>

                  <Tags>
                    <Tag $v="type">{job.type}</Tag>
                    <Tag $v="loc">📍 {job.location_type}</Tag>
                    <Tag $v="loc">{job.location}</Tag>
                    <Tag $v={job.is_active ? "active" : "inactive"}>
                      {job.is_active ? "● Active" : "● Inactive"}
                    </Tag>
                  </Tags>

                  <Desc>{job.description}</Desc>
                  <Divider />

                  <Stats>
                    <Stat>
                      <div className="val">{job.applicant_count ?? 0}</div>
                      <div className="lbl">Applicants</div>
                    </Stat>
                    <Stat>
                      <div className="val">{job.openings}</div>
                      <div className="lbl">Openings</div>
                    </Stat>
                    <Stat>
                      <div className="val">{SALARY_FMT(job.salary_min)}</div>
                      <div className="lbl">Min Salary</div>
                    </Stat>
                  </Stats>

                  <Actions>
                    <ActionBtn $v="applicants"
                      onClick={() => navigate(`/recruiter/jobs/${job.id}/applicants`)}>
                      👥 {job.applicant_count ?? 0}
                    </ActionBtn>

                    <ActionBtn $v="toggle" className={!job.is_active ? "inactive" : ""}
                      onClick={() => handleToggleStatus(job.id, job.is_active)}>
                      {job.is_active ? "🔒 Active" : "🔓 Inactive"}
                    </ActionBtn>

                    {/* ── Navigate to edit page instead of opening a modal ── */}
                    <ActionBtn $v="edit"
                      onClick={() => navigate(`/recruiter/jobs/${job.id}/edit`)}>
                      ✎ Edit
                    </ActionBtn>

                    <ActionBtn $v="delete" onClick={() => setDelTarget(job)}>
                      🗑 Delete
                    </ActionBtn>
                  </Actions>
                </Card>
              ))
            )}
          </Grid>

          {!loading && pages > 1 && (
            <Pager>
              <PagerBtn disabled={page === 1} onClick={() => setPage(p => p - 1)}>← Prev</PagerBtn>
              {Array.from({ length: pages }, (_, i) => i + 1)
                .filter(n => n === 1 || n === pages || Math.abs(n - page) <= 1)
                .reduce((acc, n, idx, arr) => {
                  if (idx > 0 && n - arr[idx - 1] > 1) acc.push("…");
                  acc.push(n);
                  return acc;
                }, [])
                .map((n, i) =>
                  n === "…"
                    ? <span key={`e${i}`} style={{ color:"#475569", padding:"0 4px" }}>…</span>
                    : <PagerBtn key={n} $active={page === n} onClick={() => setPage(n)}>{n}</PagerBtn>
                )
              }
              <PagerBtn disabled={page === pages} onClick={() => setPage(p => p + 1)}>Next →</PagerBtn>
            </Pager>
          )}

        </Inner>
      </Page>

      {/* ── Delete Confirm ── */}
      {delTarget && (
        <Overlay onClick={() => !deleting && setDelTarget(null)}>
          <DelModal onClick={e => e.stopPropagation()}>
            <h3>Delete Job Posting?</h3>
            <p>
              You're about to delete{" "}
              <strong style={{ color:"#e2e8f0" }}>"{delTarget.title}"</strong>.
              This removes all {delTarget.applicant_count ?? 0} application(s) too.
              This cannot be undone.
            </p>
            <DelActions>
              <DelBtn onClick={() => setDelTarget(null)} disabled={deleting}>Cancel</DelBtn>
              <DelBtn $danger onClick={confirmDelete} disabled={deleting}>
                {deleting ? "Deleting…" : "Yes, Delete"}
              </DelBtn>
            </DelActions>
          </DelModal>
        </Overlay>
      )}

    </RecruiterLayout>
  );
};

export default JobsPage;