import { configureStore } from "@reduxjs/toolkit";
import brainstormReducer from "./features/brainstorm/brainstormSlice.js";

// One feature slice for v0. As the app grows (e.g., a sessions-list view
// for picking which brainstorm to enter, or a chat slice for AI streaming),
// we add reducers here, not new stores.
const store = configureStore({
  reducer: {
    brainstorm: brainstormReducer,
  },
});

export default store;
