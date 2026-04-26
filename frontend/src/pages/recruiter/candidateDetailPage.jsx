// pages/recruiter/CandidateDetailPage.jsx
import { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import styled, { keyframes, css } from "styled-components";
import jobAPI from "../../api/jobAPI";
import postAPI from "../../api/postAPI";
import { RecruiterLayout } from "../../components/RecruiterLayout";

// ── Animations ────────────────────────────────────────────────────────────
const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(14px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const slideIn = keyframes`
  from { opacity: 0; transform: translateX(40px); }
  to   { opacity: 1; transform: translateX(0); }
`;

// ── Assets ─────────────────────────────────────────────────────────────────
const DownloadIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

// ── Layout ────────────────────────────────────────────────────────────────
const Page = styled.div`
  width: 100%;
  color: #e2e8f0;
  font-family: "DM Sans", sans-serif;
  animation: ${fadeUp} 0.4s ease both;
`;

const Inner = styled.div`max-width: 1000px; margin: 0 auto;`;

// ── Back link ─────────────────────────────────────────────────────────────
const BackLink = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #64748b;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  margin-bottom: 24px;
  font-family: "DM Sans", sans-serif;
  transition: color 0.2s;
  &:hover { color: #06b6d4; }
`;

// ── Header ────────────────────────────────────────────────────────────────
const Header = styled.div`
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 24px;
  margin-bottom: 32px;
  align-items: start;

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

const CandidateInfo = styled.div``;

const CandidateName = styled.h1`
  font-size: 28px;
  font-weight: 700;
  margin: 0 0 4px;
  letter-spacing: -0.4px;
  background: linear-gradient(135deg, #e2e8f0 0%, #94a3b8 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const CandidateEmail = styled.p`
  font-size: 14px;
  color: #64748b;
  margin: 0;
`;

const CandidateHeadline = styled.p`
  font-size: 13px;
  color: #94a3b8;
  margin: 8px 0 0;
`;

const Avatar = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 12px;
  background: linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  font-weight: 700;
  color: #fff;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const AvatarWrap = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
`;

// ── Status & Meta ─────────────────────────────────────────────────────────
const Meta = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 32px;
`;

const MetaChip = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 6px 14px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  background: rgba(30, 41, 59, 0.8);
  border: 1px solid #1e293b;
  color: #94a3b8;
`;

const STATUS_COLOR = {
  applied: "#06b6d4",
  shortlisted: "#f59e0b",
  rejected: "#ef4444",
  hired: "#10b981",
  withdrawn: "#64748b",
};

const StatusChip = styled(MetaChip)`
  background: ${p => (STATUS_COLOR[p.$status] || "#06b6d4") + "15"};
  border-color: ${p => (STATUS_COLOR[p.$status] || "#06b6d4") + "33"};
  color: ${p => STATUS_COLOR[p.$status] || "#06b6d4"};
`;

// ── Main Grid ─────────────────────────────────────────────────────────────
const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr 350px;
  gap: 24px;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

// ── Profile Section ───────────────────────────────────────────────────────
const Section = styled.div`
  background: linear-gradient(145deg, #1e293b, #0f172a);
  border: 1px solid #1e293b;
  border-radius: 14px;
  padding: 24px;
`;

const SectionTitle = styled.h2`
  font-size: 16px;
  font-weight: 700;
  margin: 0 0 16px;
  color: #e2e8f0;
  letter-spacing: -0.3px;
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

const InfoItem = styled.div``;

const InfoLabel = styled.div`
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  color: #475569;
  margin-bottom: 4px;
`;

const InfoValue = styled.div`
  font-size: 14px;
  color: #e2e8f0;
  word-break: break-word;
`;

const SkillsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const SkillTag = styled.span`
  display: inline-block;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  background: rgba(6, 182, 212, 0.1);
  color: #22d3ee;
  border: 1px solid rgba(6, 182, 212, 0.2);
`;

// ── Cover Letter ───────────────────────────────────────────────────────────
const CLBox = styled.div`
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid #1e293b;
  border-radius: 10px;
  padding: 14px;
  font-size: 13px;
  color: #cbd5e1;
  line-height: 1.6;
  margin-top: 12px;
`;

// ── Sidebar ───────────────────────────────────────────────────────────────
const Sidebar = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const StatusSelect = styled.select`
  width: 100%;
  padding: 10px 12px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 600;
  font-family: "DM Sans", sans-serif;
  cursor: pointer;
  background: rgba(15, 23, 42, 0.8);
  border: 1px solid #1e293b;
  color: #e2e8f0;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%2364748b' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 8px center;
  padding-right: 28px;
  transition: border-color 0.2s;

  &:focus { outline: none; border-color: #06b6d4; }
  option { background: #0f172a; }
  &:disabled { opacity: 0.4; cursor: not-allowed; }
`;

const ActionBtn = styled.button`
  width: 100%;
  padding: 11px 14px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 600;
  font-family: "DM Sans", sans-serif;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  border: 1px solid;

  &.primary {
    background: linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%);
    border-color: #0891b2;
    color: #fff;
    &:hover { box-shadow: 0 8px 16px rgba(6, 182, 212, 0.3); }
  }

  &.secondary {
    background: rgba(15, 23, 42, 0.8);
    border-color: #1e293b;
    color: #94a3b8;
    &:hover { border-color: #06b6d4; color: #06b6d4; }
  }

  &:disabled { opacity: 0.4; cursor: not-allowed; }
`;

const Toast = styled.div`
  position: fixed;
  top: 24px;
  right: 24px;
  z-index: 1000;
  padding: 14px 20px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  animation: ${slideIn} 0.3s ease both;
  max-width: 340px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);

  ${p => p.$type === "success" && css`
    background: rgba(16, 185, 129, 0.15);
    border: 1px solid #10b981;
    color: #6ee7b7;
  `}
  ${p => p.$type === "error" && css`
    background: rgba(239, 68, 68, 0.15);
    border: 1px solid #ef4444;
    color: #fca5a5;
  `}
`;

// ── Status Config ─────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  applied: { label: "Applied" },
  shortlisted: { label: "Shortlisted" },
  rejected: { label: "Rejected" },
  hired: { label: "Hired" },
  withdrawn: { label: "Withdrawn" },
};

// Status workflow: which statuses can transition to which
const ALLOWED_TRANSITIONS = {
  applied:     ["shortlisted"],           // Applied → can only go to Shortlisted
  shortlisted: ["hired", "rejected"],     // Shortlisted → can go to Hired or Rejected
  hired:       [],                        // Hired (final, no changes)
  rejected:    [],                        // Rejected (final, no changes)
  withdrawn:   [],                        // Withdrawn (final, no changes)
};

const initials = (name = "") =>
  name
    .split(" ")
    .map(p => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() || "?";

// ─────────────────────────────────────────────────────────────────────────
const CandidateDetailPage = () => {
  const navigate = useNavigate();
  const { jobId, applicationId } = useParams();
  const { recruiter } = useSelector(s => s.auth);

  const [job, setJob] = useState(null);
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [toast, setToast] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [userJobs, setUserJobs] = useState([]);

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

      // Find the specific application
      const app = appRes.applications?.find(a => a.id === parseInt(applicationId));
      if (app) {
        setApplication(app);
        
        // Fetch user's posts and jobs
        if (app.user?.id) {
          try {
            const [postsRes, jobsRes] = await Promise.all([
              postAPI.getUserPosts(app.user.id),
              jobAPI.getUserJobs(app.user.id),
            ]);
            setUserPosts(postsRes?.data || []);
            setUserJobs(jobsRes?.jobs || []);
          } catch (err) {
            console.error("Error fetching user posts/jobs:", err);
          }
        }
      } else {
        showToast("Application not found", "error");
      }
    } catch (err) {
      showToast(err?.errors?.general || "Failed to load details", "error");
    } finally {
      setLoading(false);
    }
  }, [jobId, applicationId]);

  useEffect(() => {
    if (!recruiter) {
      navigate("/recruiter/login");
      return;
    }
    fetchData();
  }, [recruiter, navigate, fetchData]);

  const handleStatusChange = async (newStatus) => {
    if (!application) return;
    try {
      setUpdating(true);
      await jobAPI.updateApplicationStatus(jobId, application.id, newStatus);
      setApplication(prev => ({ ...prev, status: newStatus }));
      showToast(`Status updated to "${STATUS_CONFIG[newStatus]?.label}"`);
    } catch (err) {
      showToast(err?.errors?.general || "Failed to update status", "error");
    } finally {
      setUpdating(false);
    }
  };

  const handleDownloadResume = async () => {
    if (!application?.resume_path) {
      showToast("No resume attached to this application", "error");
      return;
    }

    try {
      // Get the token from localStorage
      const recruiterAuth = JSON.parse(localStorage.getItem("recruiter_auth") || "{}");
      const token = recruiterAuth.token;

      if (!token) {
        showToast("Authentication required", "error");
        return;
      }

      // Construct the download URL
      const downloadUrl = new URL(
        `/api/jobs/${jobId}/applicants/${application.id}/resume`,
        window.location.origin
      ).toString();

      // Fetch with authorization header
      const response = await fetch(downloadUrl, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        showToast(errorData?.errors?.general || "Failed to download resume", "error");
        return;
      }

      // Get filename from response headers or use default
      const contentDisposition = response.headers.get("content-disposition");
      let filename = "resume.pdf";
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
        if (filenameMatch) filename = filenameMatch[1];
      }

      // Create blob and download
      const blob = await response.blob();
      const downloadLink = document.createElement("a");
      downloadLink.href = URL.createObjectURL(blob);
      downloadLink.download = filename;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      URL.revokeObjectURL(downloadLink.href);

      showToast("Resume downloaded successfully");
    } catch (err) {
      console.error("Download error:", err);
      showToast(err?.message || "Failed to download resume", "error");
    }
  };

  if (!recruiter || loading) {
    return (
      <RecruiterLayout>
        <Page>
          <Inner>
            <div style={{ padding: "60px 24px", textAlign: "center" }}>
              <div
                style={{
                  display: "inline-block",
                  width: "32px",
                  height: "32px",
                  border: "2px solid #06b6d4",
                  borderTop: "2px solid transparent",
                  borderRadius: "50%",
                  animation: "spin 0.8s linear infinite",
                }}
              />
              <p style={{ marginTop: "16px", color: "#64748b" }}>Loading...</p>
            </div>
          </Inner>
        </Page>
      </RecruiterLayout>
    );
  }

  if (!application) {
    return (
      <RecruiterLayout>
        <Page>
          <Inner>
            <BackLink onClick={() => navigate(`/recruiter/jobs/${jobId}/applicants`)}>
              ← Back to Applicants
            </BackLink>
            <div style={{ textAlign: "center", padding: "60px 24px", color: "#64748b" }}>
              Application not found
            </div>
          </Inner>
        </Page>
      </RecruiterLayout>
    );
  }

  const user = application.user || {};
  const avatar = initials(user.name);

  return (
    <RecruiterLayout>
      <Page>
        <Inner>
          <BackLink onClick={() => navigate(`/recruiter/jobs/${jobId}/applicants`)}>
            ← Back to Applicants
          </BackLink>

          <Header>
            <CandidateInfo>
              <CandidateName>{user.name || "Unknown"}</CandidateName>
              <CandidateEmail>{user.email || "—"}</CandidateEmail>
              <CandidateHeadline>
                {user.headline || user.job_title || "Job Seeker"}
              </CandidateHeadline>
            </CandidateInfo>

            <AvatarWrap>
              <Avatar>{avatar}</Avatar>
              <StatusChip $status={application.status}>
                {STATUS_CONFIG[application.status]?.label || "Applied"}
              </StatusChip>
            </AvatarWrap>
          </Header>

          <Meta>
            <MetaChip>📅 Applied on {new Date(application.applied_at).toLocaleDateString()}</MetaChip>
            <MetaChip>💼 {job?.title || "Job"}</MetaChip>
            <MetaChip>📍 {job?.location || "Location"}</MetaChip>
          </Meta>

          <Grid>
            {/* Main Content */}
            <div>
              {/* About Section */}
              {(user.headline || user.experience_level) && (
                <Section>
                  <SectionTitle>About</SectionTitle>
                  {user.headline && (
                    <InfoItem>
                      <InfoLabel>Headline</InfoLabel>
                      <InfoValue>{user.headline}</InfoValue>
                    </InfoItem>
                  )}
                  {user.experience_level && (
                    <InfoItem style={{ marginTop: "12px" }}>
                      <InfoLabel>Experience Level</InfoLabel>
                      <InfoValue>{user.experience_level}</InfoValue>
                    </InfoItem>
                  )}
                </Section>
              )}

              {/* Skills Section */}
              {user.skills && (
                <Section>
                  <SectionTitle>Skills</SectionTitle>
                  <SkillsContainer>
                    {(typeof user.skills === "string"
                      ? user.skills.split(",").map(s => s.trim())
                      : user.skills
                    ).map((skill, i) => (
                      <SkillTag key={i}>{skill}</SkillTag>
                    ))}
                  </SkillsContainer>
                </Section>
              )}

              {/* Contact Section */}
              <Section>
                <SectionTitle>Contact Information</SectionTitle>
                <InfoGrid>
                  {user.phone && (
                    <InfoItem>
                      <InfoLabel>Phone</InfoLabel>
                      <InfoValue>{user.phone}</InfoValue>
                    </InfoItem>
                  )}
                  <InfoItem>
                    <InfoLabel>Email</InfoLabel>
                    <InfoValue>{user.email || "—"}</InfoValue>
                  </InfoItem>
                  {user.city && (
                    <InfoItem>
                      <InfoLabel>City</InfoLabel>
                      <InfoValue>
                        {user.city}
                        {user.state ? `, ${user.state}` : ""}
                        {user.country ? `, ${user.country}` : ""}
                      </InfoValue>
                    </InfoItem>
                  )}
                </InfoGrid>
              </Section>

              {/* Cover Letter Section */}
              {application.cover_letter && (
                <Section>
                  <SectionTitle>Cover Letter</SectionTitle>
                  <CLBox>{application.cover_letter}</CLBox>
                </Section>
              )}

              {/* Posts Section */}
              {userPosts && userPosts.length > 0 && (
                <Section>
                  <SectionTitle>📸 Posts ({userPosts.length})</SectionTitle>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: "12px" }}>
                    {userPosts.slice(0, 6).map((post) => (
                      <div
                        key={post.id}
                        style={{
                          borderRadius: "8px",
                          overflow: "hidden",
                          background: "#0f172a",
                          border: "1px solid #1e293b",
                          aspectRatio: "1/1",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          position: "relative",
                        }}
                      >
                        {post.image_url ? (
                          <img
                            src={post.image_url}
                            alt="Post"
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                            onError={(e) => {
                              e.target.style.display = "none";
                            }}
                          />
                        ) : (
                          <span style={{ fontSize: "12px", color: "#475569" }}>No image</span>
                        )}
                        {post.caption && (
                          <div
                            style={{
                              position: "absolute",
                              bottom: 0,
                              left: 0,
                              right: 0,
                              background: "linear-gradient(to top, rgba(0,0,0,0.8), transparent)",
                              color: "#e2e8f0",
                              padding: "8px",
                              fontSize: "10px",
                              maxHeight: "40%",
                              overflow: "hidden",
                            }}
                          >
                            {post.caption}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  {userPosts.length >6 && (
                    <div style={{ marginTop: "12px", fontSize: "12px", color: "#475569" }}>
                      +{userPosts.length - 6} more posts
                    </div>
                  )}
                </Section>
              )}

              {/* Jobs Posted Section */}
              {userJobs && userJobs.length > 0 && (
                <Section>
                  <SectionTitle>💼 Jobs Posted ({userJobs.length})</SectionTitle>
                  <div style={{ display: "grid", gap: "12px" }}>
                    {userJobs.slice(0, 3).map((job) => (
                      <div
                        key={job.id}
                        style={{
                          padding: "12px",
                          background: "rgba(15, 23, 42, 0.6)",
                          border: "1px solid #1e293b",
                          borderRadius: "8px",
                          fontSize: "12px",
                        }}
                      >
                        <div style={{ fontWeight: 600, color: "#e2e8f0", marginBottom: "4px" }}>
                          {job.title}
                        </div>
                        <div style={{ color: "#64748b", fontSize: "11px", marginBottom: "4px" }}>
                          {job.type} • {job.location_type}
                        </div>
                        {job.salary_min && (
                          <div style={{ color: "#06b6d4", fontSize: "11px" }}>
                            ${job.salary_min?.toLocaleString()} - ${job.salary_max?.toLocaleString()}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  {userJobs.length > 3 && (
                    <div style={{ marginTop: "12px", fontSize: "12px", color: "#475569" }}>
                      +{userJobs.length - 3} more jobs
                    </div>
                  )}
                </Section>
              )}

              {/* Application Details */}
              <Section>
                <SectionTitle>Application Details</SectionTitle>
                <InfoGrid>
                  <InfoItem>
                    <InfoLabel>Status</InfoLabel>
                    <InfoValue>{STATUS_CONFIG[application.status]?.label || "Applied"}</InfoValue>
                  </InfoItem>
                  <InfoItem>
                    <InfoLabel>Applied On</InfoLabel>
                    <InfoValue>
                      {new Date(application.applied_at).toLocaleDateString()}
                    </InfoValue>
                  </InfoItem>
                </InfoGrid>
              </Section>
            </div>

            {/* Sidebar */}
            <Sidebar>
              <Section>
                <SectionTitle>Quick Actions</SectionTitle>
                <StatusSelect
                  value={application.status}
                  disabled={updating || ALLOWED_TRANSITIONS[application.status]?.length === 0}
                  onChange={e => handleStatusChange(e.target.value)}
                >
                  <option value={application.status}>{STATUS_CONFIG[application.status]?.label}</option>
                  {ALLOWED_TRANSITIONS[application.status]?.map(allowedStatus => (
                    <option key={allowedStatus} value={allowedStatus}>
                      → {STATUS_CONFIG[allowedStatus]?.label}
                    </option>
                  ))}
                </StatusSelect>
              </Section>

              {application.resume_path && (
                <Section>
                  <ActionBtn className="primary" onClick={handleDownloadResume}>
                    <DownloadIcon /> Download Resume
                  </ActionBtn>
                </Section>
              )}

              <Section>
                <ActionBtn className="secondary" onClick={() => navigate(`/recruiter/jobs/${jobId}/applicants`)}>
                  ← Back to Applicants
                </ActionBtn>
              </Section>
            </Sidebar>
          </Grid>

          {toast && <Toast $type={toast.type}>{toast.msg}</Toast>}
        </Inner>
      </Page>
    </RecruiterLayout>
  );
};

export default CandidateDetailPage;
