import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import userAuthReducer from "./userAuthSlice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    userAuth: userAuthReducer,
  },
});

export default store;
