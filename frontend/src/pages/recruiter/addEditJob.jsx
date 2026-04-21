// pages/recruiter/AddEditJobPage.jsx
import { useEffect, useState } from "react";
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

// ── Layout ────────────────────────────────────────────────────────────────────
const Page = styled.div`
  width: 100%;
  color: #e2e8f0;
  font-family: "DM Sans", sans-serif;
  animation: ${fadeUp} 0.4s ease both;
`;

const Inner = styled.div`
  max-width: 760px;
  margin: 0 auto;
`;

// ── Header ────────────────────────────────────────────────────────────────────
const Header = styled.div`
  margin-bottom: 36px;

  h1 {
    font-size: 28px;
    font-weight: 700;
    margin: 0 0 6px;
    letter-spacing: -0.4px;
    background: linear-gradient(135deg, #e2e8f0 0%, #94a3b8 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  p {
    font-size: 13px;
    color: #64748b;
    margin: 0;
  }
`;

// ── Step Indicator ────────────────────────────────────────────────────────────
const StepTrack = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 40px;
  gap: 0;
`;

const StepItem = styled.div`
  display: flex;
  align-items: center;
  flex: 1;
`;

const StepCircle = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 700;
  flex-shrink: 0;
  transition: all 0.3s;
  position: relative;
  z-index: 1;

  ${p => p.$done && css`
    background: rgba(16,185,129,0.15);
    border: 2px solid #10b981;
    color: #34d399;
  `}
  ${p => p.$active && !p.$done && css`
    background: linear-gradient(135deg, #0ea5e9, #06b6d4);
    border: 2px solid #06b6d4;
    color: #fff;
    box-shadow: 0 0 0 4px rgba(6,182,212,0.15);
  `}
  ${p => !p.$active && !p.$done && css`
    background: rgba(30,41,59,0.8);
    border: 2px solid #1e293b;
    color: #475569;
  `}
`;

const StepLine = styled.div`
  flex: 1;
  height: 2px;
  margin: 0 -1px;
  background: ${p => p.$done ? "#10b981" : "#1e293b"};
  transition: background 0.4s;
`;

const StepLabel = styled.div`
  position: absolute;
  top: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%);
  white-space: nowrap;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.4px;
  color: ${p => p.$active ? "#06b6d4" : p.$done ? "#34d399" : "#475569"};
  text-transform: uppercase;
`;

// ── Toast ─────────────────────────────────────────────────────────────────────
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
  box-shadow: 0 8px 24px rgba(0,0,0,0.4);

  ${p => p.$type === "success" && css`
    background: rgba(16,185,129,0.15);
    border: 1px solid #10b981;
    color: #6ee7b7;
  `}
  ${p => p.$type === "error" && css`
    background: rgba(239,68,68,0.15);
    border: 1px solid #ef4444;
    color: #fca5a5;
  `}
`;

// ── Form Card ─────────────────────────────────────────────────────────────────
const Card = styled.div`
  background: linear-gradient(145deg, #1e293b 0%, #0f172a 100%);
  border: 1px solid #1e293b;
  border-radius: 16px;
  padding: 40px;

  @media (max-width: 600px) { padding: 24px; }
`;

const SectionTitle = styled.div`
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: #475569;
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  gap: 10px;

  &::after {
    content: "";
    flex: 1;
    height: 1px;
    background: #1e293b;
  }
`;

const FormGroup = styled.div`
  margin-bottom: 22px;
  &:last-of-type { margin-bottom: 0; }
`;

const Row = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;

  @media (max-width: 560px) { grid-template-columns: 1fr; }
`;

const Label = styled.label`
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: #cbd5e1;
  margin-bottom: 7px;

  em {
    color: #ef4444;
    font-style: normal;
    margin-left: 2px;
  }
`;

const inputBase = css`
  width: 100%;
  padding: 11px 14px;
  background: rgba(15,23,42,0.6);
  border: 1px solid ${p => p.$err ? "#ef4444" : "#1e293b"};
  border-radius: 9px;
  color: #e2e8f0;
  font-size: 14px;
  font-family: "DM Sans", sans-serif;
  transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: #06b6d4;
    background: rgba(6,182,212,0.04);
    box-shadow: 0 0 0 3px rgba(6,182,212,0.1);
  }
  &::placeholder { color: #334155; }
`;

const Input    = styled.input`${inputBase}`;
const Select   = styled.select`${inputBase} option { background: #0f172a; }`;
const Textarea = styled.textarea`
  ${inputBase}
  min-height: 120px;
  resize: vertical;
  line-height: 1.6;
`;

const ErrMsg = styled.span`
  display: block;
  font-size: 12px;
  color: #f87171;
  margin-top: 5px;
`;

const Hint = styled.span`
  display: block;
  font-size: 11px;
  color: #475569;
  margin-top: 4px;
`;

// ── Skills ────────────────────────────────────────────────────────────────────
const SkillsWrap = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 10px;
  min-height: 32px;
`;

const SkillChip = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 5px 12px;
  background: rgba(6,182,212,0.12);
  border: 1px solid rgba(6,182,212,0.25);
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  color: #22d3ee;
  animation: ${fadeUp} 0.2s ease both;

  button {
    background: none;
    border: none;
    color: #475569;
    cursor: pointer;
    font-size: 14px;
    line-height: 1;
    padding: 0;
    transition: color 0.15s;
    &:hover { color: #ef4444; }
  }
`;

const SkillRow = styled.div`
  display: flex;
  gap: 8px;
`;

// ── Nav Buttons ───────────────────────────────────────────────────────────────
const NavBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 36px;
  gap: 12px;
`;

const NavLeft = styled.div`display: flex; gap: 12px;`;
const NavRight = styled.div`display: flex; gap: 12px;`;

const NavBtn = styled.button`
  padding: 11px 24px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  font-family: "DM Sans", sans-serif;

  ${p => p.$primary && css`
    background: linear-gradient(135deg, #0ea5e9, #06b6d4);
    border: none;
    color: #fff;
    &:hover { box-shadow: 0 8px 20px rgba(6,182,212,0.35); transform: translateY(-1px); }
  `}
  ${p => p.$ghost && css`
    background: transparent;
    border: 1px solid #1e293b;
    color: #94a3b8;
    &:hover { border-color: #334155; color: #cbd5e1; }
  `}
  ${p => p.$danger && css`
    background: transparent;
    border: 1px solid rgba(239,68,68,0.3);
    color: #f87171;
    &:hover { background: rgba(239,68,68,0.08); }
  `}
  &:disabled { opacity: 0.4; cursor: not-allowed; transform: none !important; }
`;

// ── Loading overlay ───────────────────────────────────────────────────────────
const LoadWrap = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 80px;
  color: #64748b;
  font-size: 14px;
  gap: 10px;
`;

// ─────────────────────────────────────────────────────────────────────────────
const STEPS = ["Basic Info", "Details", "Requirements"];

const EMPTY_FORM = {
  title: "", department: "", type: "", location: "", location_type: "", priority: "Normal",
  salary_min: "", salary_max: "", experience: "", openings: "1", deadline: "", skills: [],
  description: "", requirements: "", benefits: "",
};

const AddEditJobPage = () => {
  const navigate         = useNavigate();
  const { jobId }        = useParams();
  const { recruiter }    = useSelector(s => s.auth);
  const isEditing        = !!jobId;

  const [step,        setStep]        = useState(1);
  const [form,        setForm]        = useState(EMPTY_FORM);
  const [errors,      setErrors]      = useState({});
  const [skillInput,  setSkillInput]  = useState("");
  const [loading,     setLoading]     = useState(isEditing);
  const [submitting,  setSubmitting]  = useState(false);
  const [toast,       setToast]       = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    if (!recruiter) { navigate("/recruiter/login"); return; }
    if (!isEditing) return;

    (async () => {
      try {
        setLoading(true);
        const { job } = await jobAPI.getJob(jobId);
        setForm({
          title:         job.title,
          department:    job.department,
          type:          job.type,
          location:      job.location,
          location_type: job.location_type,
          priority:      job.priority,
          salary_min:    job.salary_min ?? "",
          salary_max:    job.salary_max ?? "",
          experience:    job.experience,
          openings:      job.openings ?? 1,
          deadline:      job.deadline ?? "",
          skills:        job.skills ?? [],
          description:   job.description,
          requirements:  job.requirements ?? "",
          benefits:      job.benefits ?? "",
        });
      } catch (err) {
        showToast(err?.errors?.general || "Failed to load job", "error");
      } finally {
        setLoading(false);
      }
    })();
  }, [recruiter, navigate, isEditing, jobId]);

  // ── Helpers ────────────────────────────────────────────────────────
  const set = (name, value) => {
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  const onChange = e => set(e.target.name, e.target.value);

  const addSkill = () => {
    const t = skillInput.trim();
    if (t && !form.skills.includes(t)) {
      set("skills", [...form.skills, t]);
      setSkillInput("");
    }
  };

  const removeSkill = skill =>
    set("skills", form.skills.filter(s => s !== skill));

  // ── Validation per step ────────────────────────────────────────────
  const validate = (s) => {
    const e = {};
    if (s === 1) {
      if (!form.title.trim())           e.title         = "Job title is required";
      else if (form.title.length > 200) e.title         = "Must be under 200 characters";
      if (!form.department.trim())      e.department    = "Department is required";
      if (!form.type)                   e.type          = "Job type is required";
      if (!form.location.trim())        e.location      = "Location is required";
      if (!form.location_type)          e.location_type = "Location type is required";
    }
    if (s === 2) {
      if (form.salary_min === "" || form.salary_min === null)
                                        e.salary_min = "Minimum salary is required";
      else if (Number(form.salary_min) < 0)
                                        e.salary_min = "Must be non-negative";
      if (form.salary_max !== "" && form.salary_max !== null) {
        if (Number(form.salary_max) < Number(form.salary_min))
                                        e.salary_max = "Must be greater than minimum";
      }
      if (!form.experience.trim())      e.experience = "Experience level is required";
      if (!form.openings || Number(form.openings) < 1)
                                        e.openings   = "Openings must be at least 1";
      if (form.skills.length === 0)     e.skills     = "At least one skill is required";
    }
    if (s === 3) {
      if (!form.description.trim())     e.description = "Description is required";
      else if (form.description.length < 20)
                                        e.description = "Must be at least 20 characters";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => { if (validate(step)) setStep(s => s + 1); };
  const prev = () => { setErrors({}); setStep(s => s - 1); };

  const handleSubmit = async () => {
    if (!validate(step)) return;
    try {
      setSubmitting(true);
      if (isEditing) {
        await jobAPI.updateJob(jobId, form);
        showToast("Job updated successfully!");
      } else {
        await jobAPI.createJob(form);
        showToast("Job posted successfully!");
      }
      setTimeout(() => navigate("/recruiter/jobs"), 1200);
    } catch (err) {
      if (err?.errors && typeof err.errors === "object") {
        setErrors(err.errors);
        showToast("Please fix the highlighted errors", "error");
      } else {
        showToast(err?.errors?.general || "Failed to save job", "error");
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (!recruiter) return null;

  if (loading) {
    return (
      <RecruiterLayout>
        <LoadWrap>Loading job details…</LoadWrap>
      </RecruiterLayout>
    );
  }

  return (
    <RecruiterLayout>
      <Page>
        <Inner>
          {toast && <Toast $type={toast.type}>{toast.msg}</Toast>}

          <Header>
            <h1>{isEditing ? "Edit Job Posting" : "Post a New Job"}</h1>
            <p>{isEditing ? "Update the details below and save" : "Fill in the details across 3 quick steps"}</p>
          </Header>

          {/* ── Step Indicator ── */}
          <div style={{ position: "relative", marginBottom: 52 }}>
            <StepTrack>
              {STEPS.map((label, idx) => {
                const n      = idx + 1;
                const active = step === n;
                const done   = step > n;
                return (
                  <StepItem key={n}>
                    <div style={{ position: "relative" }}>
                      <StepCircle $active={active} $done={done}>
                        {done ? "✓" : n}
                      </StepCircle>
                      <StepLabel $active={active} $done={done}>{label}</StepLabel>
                    </div>
                    {idx < STEPS.length - 1 && <StepLine $done={done} />}
                  </StepItem>
                );
              })}
            </StepTrack>
          </div>

          <Card>
            {/* ── Step 1: Basic Info ── */}
            {step === 1 && (
              <>
                <SectionTitle>Basic Information</SectionTitle>

                <FormGroup>
                  <Label>Job Title <em>*</em></Label>
                  <Input name="title" value={form.title} onChange={onChange}
                    placeholder="e.g., Senior React Developer" $err={!!errors.title} />
                  {errors.title && <ErrMsg>{errors.title}</ErrMsg>}
                </FormGroup>

                <Row>
                  <FormGroup>
                    <Label>Department <em>*</em></Label>
                    <Input name="department" value={form.department} onChange={onChange}
                      placeholder="e.g., Engineering" $err={!!errors.department} />
                    {errors.department && <ErrMsg>{errors.department}</ErrMsg>}
                  </FormGroup>

                  <FormGroup>
                    <Label>Job Type <em>*</em></Label>
                    <Select name="type" value={form.type} onChange={onChange} $err={!!errors.type}>
                      <option value="">Select type</option>
                      {["Full-time","Part-time","Contract","Internship","Freelance"].map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </Select>
                    {errors.type && <ErrMsg>{errors.type}</ErrMsg>}
                  </FormGroup>
                </Row>

                <Row>
                  <FormGroup>
                    <Label>Location <em>*</em></Label>
                    <Input name="location" value={form.location} onChange={onChange}
                      placeholder="e.g., Bangalore, KA" $err={!!errors.location} />
                    {errors.location && <ErrMsg>{errors.location}</ErrMsg>}
                  </FormGroup>

                  <FormGroup>
                    <Label>Location Type <em>*</em></Label>
                    <Select name="location_type" value={form.location_type} onChange={onChange}
                      $err={!!errors.location_type}>
                      <option value="">Select type</option>
                      {["On-site","Remote","Hybrid"].map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </Select>
                    {errors.location_type && <ErrMsg>{errors.location_type}</ErrMsg>}
                  </FormGroup>
                </Row>

                <FormGroup>
                  <Label>Priority</Label>
                  <Select name="priority" value={form.priority} onChange={onChange}
                    style={{ maxWidth: 200 }}>
                    {["Low","Normal","Urgent"].map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </Select>
                  <Hint>Urgent postings are highlighted to candidates</Hint>
                </FormGroup>
              </>
            )}

            {/* ── Step 2: Details ── */}
            {step === 2 && (
              <>
                <SectionTitle>Job Details</SectionTitle>

                <Row>
                  <FormGroup>
                    <Label>Min Salary (₹/year) <em>*</em></Label>
                    <Input type="number" name="salary_min" value={form.salary_min}
                      onChange={onChange} placeholder="500000" $err={!!errors.salary_min} />
                    {errors.salary_min && <ErrMsg>{errors.salary_min}</ErrMsg>}
                  </FormGroup>

                  <FormGroup>
                    <Label>Max Salary (₹/year)</Label>
                    <Input type="number" name="salary_max" value={form.salary_max}
                      onChange={onChange} placeholder="Optional" $err={!!errors.salary_max} />
                    {errors.salary_max && <ErrMsg>{errors.salary_max}</ErrMsg>}
                  </FormGroup>
                </Row>

                <Row>
                  <FormGroup>
                    <Label>Experience Level <em>*</em></Label>
                    <Input name="experience" value={form.experience} onChange={onChange}
                      placeholder="e.g., Mid-level (3–5 yrs)" $err={!!errors.experience} />
                    {errors.experience && <ErrMsg>{errors.experience}</ErrMsg>}
                  </FormGroup>

                  <FormGroup>
                    <Label>Number of Openings <em>*</em></Label>
                    <Input type="number" name="openings" value={form.openings}
                      onChange={onChange} min="1" $err={!!errors.openings} />
                    {errors.openings && <ErrMsg>{errors.openings}</ErrMsg>}
                  </FormGroup>
                </Row>

                <FormGroup>
                  <Label>Application Deadline</Label>
                  <Input type="date" name="deadline" value={form.deadline}
                    onChange={onChange} style={{ maxWidth: 220 }} />
                  <Hint>Leave blank for rolling applications</Hint>
                </FormGroup>

                <FormGroup>
                  <Label>Required Skills <em>*</em></Label>
                  <SkillsWrap>
                    {form.skills.map(skill => (
                      <SkillChip key={skill}>
                        {skill}
                        <button type="button" onClick={() => removeSkill(skill)}>×</button>
                      </SkillChip>
                    ))}
                  </SkillsWrap>
                  <SkillRow>
                    <Input
                      value={skillInput}
                      onChange={e => setSkillInput(e.target.value)}
                      onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addSkill(); }}}
                      placeholder="Type a skill and press Add or Enter"
                      $err={!!errors.skills}
                    />
                    <NavBtn $ghost type="button" onClick={addSkill}
                      style={{ whiteSpace: "nowrap", padding: "11px 20px" }}>
                      + Add
                    </NavBtn>
                  </SkillRow>
                  {errors.skills && <ErrMsg>{errors.skills}</ErrMsg>}
                </FormGroup>
              </>
            )}

            {/* ── Step 3: Requirements ── */}
            {step === 3 && (
              <>
                <SectionTitle>Job Description & Requirements</SectionTitle>

                <FormGroup>
                  <Label>Job Description <em>*</em></Label>
                  <Textarea name="description" value={form.description} onChange={onChange}
                    placeholder="Describe the role, day-to-day responsibilities, and what makes it unique…"
                    style={{ minHeight: 150 }} $err={!!errors.description} />
                  {errors.description && <ErrMsg>{errors.description}</ErrMsg>}
                  <Hint>{form.description.length} characters (min 20)</Hint>
                </FormGroup>

                <FormGroup>
                  <Label>Requirements</Label>
                  <Textarea name="requirements" value={form.requirements} onChange={onChange}
                    placeholder="Specific qualifications, certifications, or must-haves…" />
                </FormGroup>

                <FormGroup>
                  <Label>Benefits & Perks</Label>
                  <Textarea name="benefits" value={form.benefits} onChange={onChange}
                    placeholder="Health insurance, ESOPs, flexible hours, learning budget…" />
                </FormGroup>
              </>
            )}
          </Card>

          {/* ── Navigation ── */}
          <NavBar>
            <NavLeft>
              <NavBtn $danger onClick={() => navigate("/recruiter/jobs")}>Cancel</NavBtn>
            </NavLeft>
            <NavRight>
              {step > 1 && (
                <NavBtn $ghost onClick={prev}>← Back</NavBtn>
              )}
              {step < 3 ? (
                <NavBtn $primary onClick={next}>Continue →</NavBtn>
              ) : (
                <NavBtn $primary onClick={handleSubmit} disabled={submitting}>
                  {submitting ? "Saving…" : isEditing ? "Save Changes" : "Post Job"}
                </NavBtn>
              )}
            </NavRight>
          </NavBar>
        </Inner>
      </Page>
    </RecruiterLayout>
  );
};

export default AddEditJobPage;