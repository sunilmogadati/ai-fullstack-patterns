import { configureStore } from "@reduxjs/toolkit";
import commentsReducer from "./features/comments/commentsSlice.js";

// configureStore bundles the slice reducers into a single application store.
// What it does automatically:
//   - Combines reducers under the keys you specify (here: state.comments)
//   - Adds redux-thunk middleware (so createAsyncThunk works out of the box)
//   - Wires up Redux DevTools in development
//   - Adds dev-mode checks for accidental state mutation
//   - Strips DevTools in production builds
//
// The exported store is passed into <Provider store={store}> in main.jsx,
// which makes it available to every component below via React Context.
const store = configureStore({
  reducer: {
    comments: commentsReducer,
  },
});

export default store;
