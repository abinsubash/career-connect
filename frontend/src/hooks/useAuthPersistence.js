import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setAuthState, logout } from "../redux/authSlice";
import { setUserAuthState, userLogout } from "../redux/userAuthSlice";

const RECRUITER_STORAGE_KEY = "recruiter_auth";
const USER_STORAGE_KEY = "user_auth";

// ── RECRUITER AUTH PERSISTENCE ─────────────────────────────────────────────
export const useAuthPersistence = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    // Load recruiter auth from localStorage on mount
    const savedAuth = localStorage.getItem(RECRUITER_STORAGE_KEY);
    if (savedAuth) {
      try {
        const authData = JSON.parse(savedAuth);
        dispatch(setAuthState(authData));
      } catch (error) {
        console.error("Failed to load recruiter auth from storage:", error);
        localStorage.removeItem(RECRUITER_STORAGE_KEY);
      }
    }
  }, [dispatch]);
};

export const useSaveAuthToStorage = () => {
  const { recruiter, token } = useSelector((state) => state.auth);

  useEffect(() => {
    if (recruiter && token) {
      // Save recruiter auth to localStorage
      localStorage.setItem(
        RECRUITER_STORAGE_KEY,
        JSON.stringify({ recruiter, token })
      );
    } else {
      // Clear from localStorage
      localStorage.removeItem(RECRUITER_STORAGE_KEY);
    }
  }, [recruiter, token]);
};

// ── USER AUTH PERSISTENCE ──────────────────────────────────────────────────
export const useUserAuthPersistence = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    // Load user auth from localStorage on mount
    const savedAuth = localStorage.getItem(USER_STORAGE_KEY);
    if (savedAuth) {
      try {
        const authData = JSON.parse(savedAuth);
        dispatch(setUserAuthState(authData));
      } catch (error) {
        console.error("Failed to load user auth from storage:", error);
        localStorage.removeItem(USER_STORAGE_KEY);
      }
    }
  }, [dispatch]);
};

export const useSaveUserAuthToStorage = () => {
  const { user, token } = useSelector((state) => state.userAuth);

  useEffect(() => {
    if (user && token) {
      // Save user auth to localStorage
      localStorage.setItem(
        USER_STORAGE_KEY,
        JSON.stringify({ user, token })
      );
    } else {
      // Clear from localStorage
      localStorage.removeItem(USER_STORAGE_KEY);
    }
  }, [user, token]);
};

export const useClearAuthStorage = () => {
  return () => {
    localStorage.removeItem(RECRUITER_STORAGE_KEY);
  };
};

export const useClearUserAuthStorage = () => {
  return () => {
    localStorage.removeItem(USER_STORAGE_KEY);
  };
};
