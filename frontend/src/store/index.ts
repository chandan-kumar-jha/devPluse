import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import uiReducer from "./slices/uiSlice";
import filterReducer from "./slices/filterSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    ui: uiReducer,
    filter: filterReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;