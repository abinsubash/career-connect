import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,
  token: null,
  isLoading: false,
  error: null,
};

const userAuthSlice = createSlice({
  name: "userAuth",
  initialState,
  reducers: {
    // Set full user auth state from localStorage
    setUserAuthState: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
    },

    // Login success
    userLoginSuccess: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.error = null;
      state.isLoading = false;
    },

    // Signup success
    userSignupSuccess: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.error = null;
      state.isLoading = false;
    },

    // Auth request started
    userAuthStarting: (state) => {
      state.isLoading = true;
      state.error = null;
    },

    // Auth error
    userAuthError: (state, action) => {
      state.error = action.payload;
      state.isLoading = false;
    },

    // Logout
    userLogout: (state) => {
      state.user = null;
      state.token = null;
      state.error = null;
      state.isLoading = false;
    },

    // Clear errors
    userClearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  setUserAuthState,
  userLoginSuccess,
  userSignupSuccess,
  userAuthStarting,
  userAuthError,
  userLogout,
  userClearError,
} = userAuthSlice.actions;

export default userAuthSlice.reducer;
