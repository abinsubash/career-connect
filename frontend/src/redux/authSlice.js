import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  recruiter: null,
  token: null,
  isAuthenticating: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // Set full auth state from localStorage
    setAuthState: (state, action) => {
      state.recruiter = action.payload.recruiter;
      state.token = action.payload.token;
    },
    
    // Login success
    loginSuccess: (state, action) => {
      state.recruiter = action.payload.recruiter;
      state.token = action.payload.token;
      state.error = null;
      state.isAuthenticating = false;
    },
    
    // Signup success
    signupSuccess: (state, action) => {
      state.recruiter = action.payload.recruiter;
      state.token = action.payload.token;
      state.error = null;
      state.isAuthenticating = false;
    },
    
    // Auth request started
    authStarting: (state) => {
      state.isAuthenticating = true;
      state.error = null;
    },
    
    // Auth error
    authError: (state, action) => {
      state.error = action.payload;
      state.isAuthenticating = false;
    },

    // Logout
    logout: (state) => {
      state.recruiter = null;
      state.token = null;
      state.error = null;
      state.isAuthenticating = false;
    },

    // Clear errors
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  setAuthState,
  loginSuccess,
  signupSuccess,
  authStarting,
  authError,
  logout,
  clearError,
} = authSlice.actions;

export default authSlice.reducer;
