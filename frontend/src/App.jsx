import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/user/login";
import SignupPage from "./pages/user/signup";
import OTP from "./pages/user/otp";
import HomePage from "./pages/user/home";

import { LoginPage_recruiter } from "./pages/recruiter/login";
import { SignupPage_recruiter } from "./pages/recruiter/signup";
import { RecruiterHome } from "./pages/recruiter/home";
import RecruiterLayout from "./pages/recruiter/RecruiterLayout";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* User Routes */}
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/otp" element={<OTP />} />
        <Route path="/home" element={<HomePage />} />

        {/* Recruiter Routes with Layout */}
        <Route path="/recruiter" element={<RecruiterLayout />}>
          <Route path="login" element={<LoginPage_recruiter />} />
          <Route path="signup" element={<SignupPage_recruiter />} />
          <Route path="home" element={<RecruiterHome />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;