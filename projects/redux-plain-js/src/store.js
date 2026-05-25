import { configureStore } from "@reduxjs/toolkit";
import commentsReducer from "./commentsSlice.js";
import usersReducer from "./usersSlice.js";

// configureStore bundles the slice reducers into a single application store.
// What it does automatically:
//   - Combines reducers under the keys you specify (here: state.comments and state.users)
//   - Adds redux-thunk middleware (so createAsyncThunk works out of the box)
//   - Wires up Redux DevTools in development
//   - Adds dev-mode checks for accidental state mutation
//   - Strips DevTools in production builds
const store = configureStore({
  reducer: {
    comments: commentsReducer,
    users: usersReducer,
  },
});

export default store;
