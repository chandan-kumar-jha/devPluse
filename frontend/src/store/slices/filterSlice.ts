import { createSlice  } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
type GoalStatus = "all" | "active" | "completed" | "abandoned";

interface FilterState {
  goalStatus: GoalStatus;
  sessionDateRange: {
    from: string | null;
    to: string | null;
  };
}

const initialState: FilterState = {
  goalStatus: "all",
  sessionDateRange: {
    from: null,
    to: null,
  },
};

const filterSlice = createSlice({
  name: "filter",
  initialState,
  reducers: {
    setGoalStatus(state, action: PayloadAction<GoalStatus>) {
      state.goalStatus = action.payload;
    },
    setSessionDateRange(
      state,
      action: PayloadAction<{ from: string | null; to: string | null }>
    ) {
      state.sessionDateRange = action.payload;
    },
    resetFilters(state) {
      state.goalStatus = "all";
      state.sessionDateRange = { from: null, to: null };
    },
  },
});

export const { setGoalStatus, setSessionDateRange, resetFilters } = filterSlice.actions;
export default filterSlice.reducer;