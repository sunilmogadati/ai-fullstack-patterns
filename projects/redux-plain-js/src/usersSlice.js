import { createSlice } from "@reduxjs/toolkit";

// A second slice that lives alongside commentsSlice in the same store.
// Demonstrates that:
//   1. A store can hold multiple independent slices.
//   2. Dispatching one slice's actions (e.g., "users/signIn") does not affect
//      other slices unless they explicitly listen via extraReducers.
//   3. Each slice owns its own piece of state and its own set of action types.
const usersSlice = createSlice({
  name: "users",
  initialState: {
    current: null,   // The currently signed-in user (null when signed out)
    list: [],        // Reserved for a future "users in this workspace" list
  },
  reducers: {
    // Action type auto-generated as "users/signIn"
    signIn: (state, action) => {
      state.current = action.payload;
    },
    // Action type auto-generated as "users/signOut"
    signOut: (state) => {
      state.current = null;
    },
  },
});

export const { signIn, signOut } = usersSlice.actions;
export default usersSlice.reducer;
