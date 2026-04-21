import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

/**
 * ProtectedRoute - Prevents authenticated users from accessing login/signup
 * Redirects recruiters to /recruiter/home and users to /home if already logged in
 */
export const ProtectedRoute = ({ children }) => {
  const { recruiter, token } = useSelector((state) => state.auth);
  const { user, token: userToken } = useSelector((state) => state.userAuth);
  
  const isRecruiterAuthenticated = recruiter && token;
  const isUserAuthenticated = user && userToken;

  // If recruiter is logged in, redirect to recruiter home
  if (isRecruiterAuthenticated) {
    return <Navigate to="/recruiter/home" replace />;
  }

  // If user is logged in, redirect to user home
  if (isUserAuthenticated) {
    return <Navigate to="/home" replace />;
  }

  return children;
};

/**
 * RequireAuthRoute - Requires authentication to access
 * Redirects to appropriate login page if not logged in
 */
export const RequireAuthRoute = ({ children }) => {
  const { recruiter, token } = useSelector((state) => state.auth);
  const { user, token: userToken } = useSelector((state) => state.userAuth);
  
  const isRecruiterAuthenticated = recruiter && token;
  const isUserAuthenticated = user && userToken;

  if (!isRecruiterAuthenticated && !isUserAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
};

/**
 * RequireRecruiterRoute - Requires recruiter authentication
 * Redirects to recruiter login if not logged in
 */
export const RequireRecruiterRoute = ({ children }) => {
  const { recruiter, token } = useSelector((state) => state.auth);
  const isAuthenticated = recruiter && token;

  if (!isAuthenticated) {
    return <Navigate to="/recruiter/login" replace />;
  }

  return children;
};

/**
 * RequireUserRoute - Requires user authentication
 * Redirects to user login if not logged in
 */
export const RequireUserRoute = ({ children }) => {
  const { user, token } = useSelector((state) => state.userAuth);
  const isAuthenticated = user && token;

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
};
