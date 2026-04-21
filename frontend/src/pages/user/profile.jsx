import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { userLogout } from "../../redux/userAuthSlice";
import { authAPI } from "../../api/authAPI";
import UserNavbar from "../../components/UserNavbar";

// ── Icons ─────────────────────────────────────────────────────────────────
const HomeIcon = ({ cls }) => (
  <svg className={cls} viewBox="0 0 24 24" fill="currentColor"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" /></svg>
);
const BriefcaseIcon = ({ cls }) => (
  <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
  </svg>
);
const MessageIcon = ({ cls }) => (
  <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);
const BellIcon = ({ cls }) => (
  <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);
const NetworkIcon = ({ cls }) => (
  <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);
const SearchIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
  </svg>
);
const EditIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="11 4 14 4 20 10 20 20 4 20 4 8 10 8" /><path d="M15 2l6 6M17 8l-4-4" />
  </svg>
);
const LocationIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
  </svg>
);
const MailIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
);
const PhoneIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);

// ── Main Component ────────────────────────────────────────────────────────
export default function ProfilePage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user: authUser } = useSelector((state) => state.userAuth);
  
  const [activeTab, setActiveTab] = useState("about");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editData, setEditData] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState(null);
  const [saveError, setSaveError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  // Fetch user profile data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        // Try to fetch user data from database
        const response = await authAPI.getUserProfile();
        console.log("Profile fetch successful:", response);
        setUser({
          name: response.name || "User",
          email: response.email || "user@example.com",
          phone: response.phone || "",
          city: response.city || "",
          state: response.state || "",
          country: response.country || "",
          location: response.location || "Not specified",
          headline: response.headline || "",
          job_title: response.job_title || "",
          bio: response.bio || "Professional seeking opportunities",
          avatar: (response.name || "U")[0].toUpperCase(),
          title: response.title || "Job Seeker",
          experience_level: response.experience_level || "",
          skills: response.skills || "",
          preferred_role: response.preferred_role || "",
          preferred_location: response.preferred_location || "",
          expected_salary: response.expected_salary || "",
          connections: 0,
          applicationsCount: 0,
          savedJobsCount: 0,
        });
        setError(null);
      } catch (err) {
        console.error("Failed to fetch user profile, using localStorage data:", err);
        // Fallback to Redux/localStorage data if API fails
        if (authUser) {
          setUser({
            name: authUser.name || "User",
            email: authUser.email || "user@example.com",
            phone: authUser.phone || "",
            city: authUser.city || "",
            state: authUser.state || "",
            country: authUser.country || "",
            location: authUser.location || "Not specified",
            headline: authUser.headline || "",
            job_title: authUser.job_title || "",
            bio: authUser.bio || "Professional seeking opportunities",
            avatar: (authUser.name || "U")[0].toUpperCase(),
            title: authUser.title || "Job Seeker",
            experience_level: authUser.experience_level || "",
            skills: authUser.skills || "",
            preferred_role: authUser.preferred_role || "",
            preferred_location: authUser.preferred_location || "",
            expected_salary: authUser.expected_salary || "",
            connections: 0,
            applicationsCount: 0,
            savedJobsCount: 0,
          });
        }
        setError(null);
      } finally {
        setLoading(false);
      }
    };

    if (authUser) {
      fetchUserData();
    }
  }, [authUser]);

  // Logout Handler
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user_auth");
    dispatch(userLogout());
    navigate("/");
  };

  // Validation Regex Patterns
  const validationPatterns = {
    name: /^[a-zA-Z\s]{2,100}$/, // 2-100 letters and spaces
    phone: /^[\d\s\-\+\(\)]{10,20}$|^$/, // Valid phone format or empty
    job_title: /^.{2,100}$|^$/, // 2-100 chars or empty
    city: /^[a-zA-Z\s]{2,50}$|^$/, // 2-50 letters and spaces or empty
    country: /^[a-zA-Z\s]{2,50}$|^$/, // 2-50 letters and spaces or empty
    state: /^[a-zA-Z\s]{2,50}$|^$/, // 2-50 letters and spaces or empty
    expected_salary: /^[\d\s\,\$\-]{3,30}$|^$/, // Salary format or empty
  };

  const validationMessages = {
    name: "Name must be 2-100 letters",
    phone: "Phone must be 10-20 digits",
    job_title: "Job title must be 2-100 characters",
    city: "City must be 2-50 letters",
    country: "Country must be 2-50 letters",
    state: "State must be 2-50 letters",
    expected_salary: "Invalid salary format",
  };

  // Validate single field
  const validateField = (name, value) => {
    if (validationPatterns[name] && !validationPatterns[name].test(value)) {
      return validationMessages[name];
    }
    return "";
  };

  // Validate all fields
  const validateForm = (data) => {
    const errors = {};
    Object.keys(data).forEach(key => {
      if (validationPatterns[key]) {
        const error = validateField(key, data[key]);
        if (error) {
          errors[key] = error;
        }
      }
    });
    return errors;
  };

  // Open Edit Modal
  const handleOpenEdit = () => {
    setEditData({
      name: user.name || "",
      phone: user.phone || "",
      headline: user.headline || "",
      job_title: user.job_title || "",
      city: user.city || "",
      state: user.state || "",
      country: user.country || "",
      experience_level: user.experience_level || "",
      skills: user.skills || "",
      preferred_role: user.preferred_role || "",
      preferred_location: user.preferred_location || "",
      expected_salary: user.expected_salary || "",
    });
    setSaveError(null);
    setSaveMessage(null);
    setIsEditModalOpen(true);
  };

  // Handle Edit Field Change
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({
      ...prev,
      [name]: value
    }));

    // Real-time validation
    const error = validateField(name, value);
    setValidationErrors(prev => {
      const updated = { ...prev };
      if (error) {
        updated[name] = error;
      } else {
        delete updated[name];
      }
      return updated;
    });
  };

  // Save Profile
  const handleSaveProfile = async () => {
    try {
      // Validate all fields before saving
      const errors = validateForm(editData);
      if (Object.keys(errors).length > 0) {
        setValidationErrors(errors);
        setSaveError("Please fix validation errors before saving");
        return;
      }

      setIsSaving(true);
      setSaveError(null);
      setSaveMessage(null);

      const response = await authAPI.updateUserProfile(editData);
      
      // Update local state with new data
      setUser(prev => ({
        ...prev,
        ...editData
      }));

      setSaveMessage("✓ Profile updated successfully!");
      setTimeout(() => {
        setIsEditModalOpen(false);
        setSaveMessage(null);
        setValidationErrors({});
      }, 1500);
    } catch (err) {
      console.error("Failed to update profile:", err);
      setSaveError(err.response?.data?.error || "Failed to save profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  // Close Edit Modal
  const handleCloseEdit = () => {
    setIsEditModalOpen(false);
    setSaveError(null);
    setSaveMessage(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 text-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 text-sm mt-3">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-gray-950 text-gray-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 text-sm">{error || "Failed to load profile"}</p>
          <button onClick={() => navigate("/home")} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500;600&display=swap');
        .syne { font-family: 'Syne', sans-serif; }
        .grad-text { background: linear-gradient(135deg,#4f8ef7,#7c5cfc); -webkit-background-clip:text; -webkit-text-fill-color:transparent; }
        .cover-pattern { background: linear-gradient(135deg,#1a2a4a,#2a1a4a,#1a3a2a); }
        @keyframes fadeUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        .fade-up { animation: fadeUp .4s ease forwards; }
        .fade-up-1 { animation: fadeUp .4s .05s ease both; }
        .fade-up-2 { animation: fadeUp .4s .12s ease both; }
      `}</style>

      {/* ── NAVBAR ── */}
      <UserNavbar currentPage="Home" />

      {/* ── PROFILE CONTENT ── */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        
        {/* ────────── PROFILE HEADER ────────── */}
        <div className="fade-up bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden mb-6">
          {/* Cover */}
          <div className="cover-pattern h-32 relative" />

          {/* Profile Info */}
          <div className="px-6 pb-6">
            <div className="flex flex-col md:flex-row items-start md:items-end gap-4 -mt-12 mb-6 relative z-10">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center font-extrabold text-3xl border-[4px] border-gray-900 syne">
                {user.avatar}
              </div>
              <div className="flex-1">
                <h1 className="syne text-3xl font-bold text-gray-100 leading-tight">{user.name}</h1>
                <p className="text-lg text-blue-400 font-medium mt-1">{user.title}</p>
                <div className="flex flex-wrap gap-3 mt-2 text-sm text-gray-400">
                  <div className="flex items-center gap-1">
                    <LocationIcon /> {user.location}
                  </div>
                  <div className="flex items-center gap-1">
                    <MailIcon /> {user.email}
                  </div>
                  <div className="flex items-center gap-1">
                    <PhoneIcon /> {user.phone}
                  </div>
                </div>
              </div>
              <div className="flex gap-2 w-full md:w-auto">
                <button 
                  onClick={handleOpenEdit}
                  className="flex-1 md:flex-none px-6 py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-violet-600 text-white font-semibold hover:opacity-90 transition-all flex items-center justify-center gap-2">
                  <EditIcon /> Edit Profile
                </button>
              </div>
            </div>

            {/* Bio */}
            <p className="text-gray-400 leading-relaxed">{user.bio}</p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-800">
              {[
                [user.connections, "Connections"],
                [user.applicationsCount, "Applications"],
                [user.savedJobsCount, "Saved Jobs"],
              ].map(([num, label]) => (
                <div key={label} className="text-center">
                  <p className="syne text-2xl font-bold text-blue-400">{num}</p>
                  <p className="text-xs text-gray-500 mt-1">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ────────── TABS ────────── */}
        <div className="fade-up-1 bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden mb-6">
          <div className="flex gap-2 px-6 py-4 border-b border-gray-800 overflow-x-auto">
            {[
              ["about", "About"],
            ].map(([key, label]) => (
              <button key={key}
                onClick={() => setActiveTab(key)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-all ${activeTab === key ? "bg-blue-500/15 text-blue-400 border border-blue-500/30" : "text-gray-500 hover:text-gray-200"}`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="p-6">
            {/* ABOUT TAB */}
            {activeTab === "about" && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-100 mb-4">About</h3>
                <p className="text-gray-400 leading-relaxed">{user.bio}</p>
                <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t border-gray-800">
                  <div>
                    <p className="text-xs text-gray-500 font-semibold">LOCATION</p>
                    <p className="text-gray-200 mt-1">{user.location}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-semibold">EMAIL</p>
                    <p className="text-gray-200 mt-1 break-all">{user.email}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-semibold">PHONE</p>
                    <p className="text-gray-200 mt-1">{user.phone}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-semibold">PROFILE TITLE</p>
                    <p className="text-gray-200 mt-1">{user.title}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ────────── EMPTY STATE ────────── */}
        <div className="fade-up-2 bg-gray-900 border border-gray-800 rounded-2xl p-8 text-center">
          <p className="text-gray-500 text-sm">👤 Additional profile details coming soon</p>
          <p className="text-gray-600 text-xs mt-2">Experience, education, and skills will be available shortly</p>
        </div>

      </div>

      {/* ────────── EDIT PROFILE MODAL ────────── */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center justify-between">
              <h2 className="syne text-xl font-bold text-gray-100">Edit Profile</h2>
              <button
                onClick={handleCloseEdit}
                className="text-gray-400 hover:text-gray-200 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-4">
              {saveMessage && (
                <div className="bg-green-500/15 border border-green-500/30 rounded-lg px-4 py-3 text-sm text-green-400">
                  ✓ {saveMessage}
                </div>
              )}
              {saveError && (
                <div className="bg-red-500/15 border border-red-500/30 rounded-lg px-4 py-3 text-sm text-red-400">
                  ✕ {saveError}
                </div>
              )}

              {/* Form Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Full Name */}
                <div>
                  <label className="block text-xs text-gray-500 font-semibold mb-2">FULL NAME</label>
                  <input
                    type="text"
                    name="name"
                    value={editData.name || ""}
                    onChange={handleEditChange}
                    placeholder="Enter your full name"
                    className={`w-full bg-gray-800 border rounded-lg px-3 py-2.5 text-gray-200 placeholder-gray-600 focus:outline-none transition-colors ${
                      validationErrors.name ? "border-red-500 focus:border-red-500" : "border-gray-700 focus:border-blue-500"
                    }`}
                  />
                  {validationErrors.name && <p className="text-xs text-red-400 mt-1">⚠ {validationErrors.name}</p>}
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-xs text-gray-500 font-semibold mb-2">PHONE</label>
                  <input
                    type="tel"
                    name="phone"
                    value={editData.phone || ""}
                    onChange={handleEditChange}
                    placeholder="Enter your phone number"
                    className={`w-full bg-gray-800 border rounded-lg px-3 py-2.5 text-gray-200 placeholder-gray-600 focus:outline-none transition-colors ${
                      validationErrors.phone ? "border-red-500 focus:border-red-500" : "border-gray-700 focus:border-blue-500"
                    }`}
                  />
                  {validationErrors.phone && <p className="text-xs text-red-400 mt-1">⚠ {validationErrors.phone}</p>}
                </div>

                {/* Job Title */}
                <div>
                  <label className="block text-xs text-gray-500 font-semibold mb-2">JOB TITLE</label>
                  <input
                    type="text"
                    name="job_title"
                    value={editData.job_title || ""}
                    onChange={handleEditChange}
                    placeholder="e.g., Senior Software Engineer"
                    className={`w-full bg-gray-800 border rounded-lg px-3 py-2.5 text-gray-200 placeholder-gray-600 focus:outline-none transition-colors ${
                      validationErrors.job_title ? "border-red-500 focus:border-red-500" : "border-gray-700 focus:border-blue-500"
                    }`}
                  />
                  {validationErrors.job_title && <p className="text-xs text-red-400 mt-1">⚠ {validationErrors.job_title}</p>}
                </div>

                {/* Experience Level */}
                <div>
                  <label className="block text-xs text-gray-500 font-semibold mb-2">EXPERIENCE LEVEL</label>
                  <select
                    name="experience_level"
                    value={editData.experience_level || ""}
                    onChange={handleEditChange}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-gray-200 focus:outline-none focus:border-blue-500 transition-colors"
                  >
                    <option value="">Select experience level</option>
                    <option value="entry">Entry Level</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="mid">Mid Level</option>
                    <option value="senior">Senior</option>
                    <option value="lead">Lead</option>
                    <option value="manager">Manager</option>
                  </select>
                </div>

                {/* City */}
                <div>
                  <label className="block text-xs text-gray-500 font-semibold mb-2">CITY</label>
                  <input
                    type="text"
                    name="city"
                    value={editData.city || ""}
                    onChange={handleEditChange}
                    placeholder="e.g., San Francisco"
                    className={`w-full bg-gray-800 border rounded-lg px-3 py-2.5 text-gray-200 placeholder-gray-600 focus:outline-none transition-colors ${
                      validationErrors.city ? "border-red-500 focus:border-red-500" : "border-gray-700 focus:border-blue-500"
                    }`}
                  />
                  {validationErrors.city && <p className="text-xs text-red-400 mt-1">⚠ {validationErrors.city}</p>}
                </div>

                {/* State */}
                <div>
                  <label className="block text-xs text-gray-500 font-semibold mb-2">STATE</label>
                  <input
                    type="text"
                    name="state"
                    value={editData.state || ""}
                    onChange={handleEditChange}
                    placeholder="e.g., California"
                    className={`w-full bg-gray-800 border rounded-lg px-3 py-2.5 text-gray-200 placeholder-gray-600 focus:outline-none transition-colors ${
                      validationErrors.state ? "border-red-500 focus:border-red-500" : "border-gray-700 focus:border-blue-500"
                    }`}
                  />
                  {validationErrors.state && <p className="text-xs text-red-400 mt-1">⚠ {validationErrors.state}</p>}
                </div>

                {/* Country */}
                <div>
                  <label className="block text-xs text-gray-500 font-semibold mb-2">COUNTRY</label>
                  <input
                    type="text"
                    name="country"
                    value={editData.country || ""}
                    onChange={handleEditChange}
                    placeholder="e.g., United States"
                    className={`w-full bg-gray-800 border rounded-lg px-3 py-2.5 text-gray-200 placeholder-gray-600 focus:outline-none transition-colors ${
                      validationErrors.country ? "border-red-500 focus:border-red-500" : "border-gray-700 focus:border-blue-500"
                    }`}
                  />
                  {validationErrors.country && <p className="text-xs text-red-400 mt-1">⚠ {validationErrors.country}</p>}
                </div>

                {/* Preferred Role */}
                <div>
                  <label className="block text-xs text-gray-500 font-semibold mb-2">PREFERRED ROLE</label>
                  <input
                    type="text"
                    name="preferred_role"
                    value={editData.preferred_role || ""}
                    onChange={handleEditChange}
                    placeholder="e.g., Full Stack Developer"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-gray-200 placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>

                {/* Preferred Location */}
                <div>
                  <label className="block text-xs text-gray-500 font-semibold mb-2">PREFERRED LOCATION</label>
                  <input
                    type="text"
                    name="preferred_location"
                    value={editData.preferred_location || ""}
                    onChange={handleEditChange}
                    placeholder="e.g., Remote"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-gray-200 placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>

                {/* Expected Salary */}
                <div>
                  <label className="block text-xs text-gray-500 font-semibold mb-2">EXPECTED SALARY</label>
                  <input
                    type="text"
                    name="expected_salary"
                    value={editData.expected_salary || ""}
                    onChange={handleEditChange}
                    placeholder="e.g., $80,000 - $100,000"
                    className={`w-full bg-gray-800 border rounded-lg px-3 py-2.5 text-gray-200 placeholder-gray-600 focus:outline-none transition-colors ${
                      validationErrors.expected_salary ? "border-red-500 focus:border-red-500" : "border-gray-700 focus:border-blue-500"
                    }`}
                  />
                  {validationErrors.expected_salary && <p className="text-xs text-red-400 mt-1">⚠ {validationErrors.expected_salary}</p>}
                </div>
              </div>

              {/* Headline / Bio */}
              <div>
                <label className="block text-xs text-gray-500 font-semibold mb-2">HEADLINE / BIO</label>
                <textarea
                  name="headline"
                  value={editData.headline || ""}
                  onChange={handleEditChange}
                  placeholder="Tell us about yourself and your professional background"
                  rows="4"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-gray-200 placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-colors resize-none"
                />
              </div>

              {/* Skills */}
              <div>
                <label className="block text-xs text-gray-500 font-semibold mb-2">SKILLS (comma-separated)</label>
                <textarea
                  name="skills"
                  value={editData.skills || ""}
                  onChange={handleEditChange}
                  placeholder="e.g., JavaScript, React, Python, SQL, etc."
                  rows="3"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-gray-200 placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-colors resize-none"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-gray-900 border-t border-gray-800 px-6 py-4 flex gap-3 justify-end">
              <button
                onClick={handleCloseEdit}
                disabled={isSaving}
                className="px-6 py-2.5 rounded-lg border border-gray-700 text-gray-300 font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveProfile}
                disabled={isSaving}
                className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-violet-600 text-white font-semibold hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSaving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
