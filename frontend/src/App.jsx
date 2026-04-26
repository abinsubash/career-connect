import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useAuthPersistence, useSaveAuthToStorage, useUserAuthPersistence, useSaveUserAuthToStorage } from "./hooks/useAuthPersistence";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { setAuthState } from "./redux/authSlice";
import { setUserAuthState } from "./redux/userAuthSlice";
import { ProtectedRoute, RequireRecruiterRoute, RequireUserRoute } from "./components/ProtectedRoute";

import Login from "./pages/user/login";
import SignupPage from "./pages/user/signup";
import OTP from "./pages/user/otp";
import HomePage from "./pages/user/home";
import JobsPage from "./pages/user/jobs";
import ProfilePage from "./pages/user/profile";
import MyApplicationsPage from "./pages/user/applications";
import Posts from "./pages/user/posts";
import UserProfilePage from "./pages/user/userProfilePage";
import PostsManagementPage from "./pages/user/postsManagementPage";

import { LoginPage_recruiter } from "./pages/recruiter/login";
import { SignupPage_recruiter } from "./pages/recruiter/signup";
import { RecruiterHome } from "./pages/recruiter/home";
import RecruiterJobsPage from "./pages/recruiter/jobs";
import AddEditJobPage from "./pages/recruiter/addEditJob";
import ApplicantsPage from "./pages/recruiter/applicantspage";
import AllApplicantsPage from "./pages/recruiter/allApplicantsPage";
import CandidateDetailPage from "./pages/recruiter/candidateDetailPage";
import RecruiterExplore from "./pages/recruiter/explore";
import RecruiterPosts from "./pages/recruiter/posts";

function AppContent() {
  const [initialized, setInitialized] = useState(false);
  const dispatch = useDispatch();

  // ✅ ALWAYS call hooks at the top level (before any conditional returns)
  useAuthPersistence();
  useSaveAuthToStorage();
  useUserAuthPersistence();
  useSaveUserAuthToStorage();

  // Load auth from localStorage on mount (runs once)
  useEffect(() => {
    // Load recruiter auth
    const recruiterAuth = localStorage.getItem("recruiter_auth");
    if (recruiterAuth) {
      try {
        const authData = JSON.parse(recruiterAuth);
        dispatch(setAuthState(authData));
      } catch (err) {
        console.error("Failed to parse recruiter_auth:", err);
      }
    }

    // Load user auth
    const userAuth = localStorage.getItem("user_auth");
    if (userAuth) {
      try {
        const authData = JSON.parse(userAuth);
        dispatch(setUserAuthState(authData));
      } catch (err) {
        console.error("Failed to parse user_auth:", err);
      }
    }

    // Mark initialization as complete
    setInitialized(true);
  }, [dispatch]);

  // Now conditional return is safe (after hooks)
  if (!initialized) {
    return (
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        background: "#020817",
        color: "#94a3b8",
        fontFamily: "DM Sans, sans-serif",
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "32px", marginBottom: "16px" }}>⏳</div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {/* ── User Routes ───────────────────────────────────────────── */}
      <Route path="/"       element={<ProtectedRoute><Login /></ProtectedRoute>} />
      <Route path="/signup" element={<ProtectedRoute><SignupPage /></ProtectedRoute>} />
      <Route path="/otp"    element={<OTP />} />
      <Route path="/home"   element={<RequireUserRoute><HomePage /></RequireUserRoute>} />
      <Route path="/jobs"   element={<RequireUserRoute><JobsPage /></RequireUserRoute>} />
      <Route path="/posts"  element={<RequireUserRoute><Posts /></RequireUserRoute>} />
      <Route path="/posts/management" element={<RequireUserRoute><PostsManagementPage /></RequireUserRoute>} />
      <Route path="/profile" element={<RequireUserRoute><ProfilePage /></RequireUserRoute>} />
      <Route path="/user-profile/:userId" element={<RequireUserRoute><UserProfilePage /></RequireUserRoute>} />
      <Route path="/applications" element={<RequireUserRoute><MyApplicationsPage /></RequireUserRoute>} />

      {/* ── Recruiter Auth (no layout) ────────────────────────────── */}
      <Route path="/recruiter/login"  element={<ProtectedRoute><LoginPage_recruiter /></ProtectedRoute>} />
      <Route path="/recruiter/signup" element={<ProtectedRoute><SignupPage_recruiter /></ProtectedRoute>} />

      {/* ── Recruiter Dashboard (protected) ──────────────────────── */}
      <Route path="/recruiter/home"   element={<RequireRecruiterRoute><RecruiterHome /></RequireRecruiterRoute>} />

      {/* Jobs */}
      <Route path="/recruiter/jobs"                   element={<RequireRecruiterRoute><RecruiterJobsPage /></RequireRecruiterRoute>} />
      <Route path="/recruiter/jobs/add"               element={<RequireRecruiterRoute><AddEditJobPage /></RequireRecruiterRoute>} />
      <Route path="/recruiter/jobs/:jobId/edit"       element={<RequireRecruiterRoute><AddEditJobPage /></RequireRecruiterRoute>} />
      <Route path="/recruiter/applicants"             element={<RequireRecruiterRoute><AllApplicantsPage /></RequireRecruiterRoute>} />
      <Route path="/recruiter/jobs/:jobId/applicants" element={<RequireRecruiterRoute><ApplicantsPage /></RequireRecruiterRoute>} />
      <Route path="/recruiter/jobs/:jobId/candidates/:applicationId" element={<RequireRecruiterRoute><CandidateDetailPage /></RequireRecruiterRoute>} />

      {/* Posts & Explore */}
      <Route path="/recruiter/explore" element={<RequireRecruiterRoute><RecruiterExplore /></RequireRecruiterRoute>} />
      <Route path="/recruiter/posts"   element={<RequireRecruiterRoute><RecruiterPosts /></RequireRecruiterRoute>} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;