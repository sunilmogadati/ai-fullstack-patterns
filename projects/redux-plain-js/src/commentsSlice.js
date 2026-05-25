import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { signOut } from "./usersSlice.js";

// createAsyncThunk has nothing to do with React.
// It runs anywhere Redux runs. We use it here to fetch from a mock API.
//
// Auto-generated action types:
//   comments/fetchComments/pending
//   comments/fetchComments/fulfilled
//   comments/fetchComments/rejected
export const fetchComments = createAsyncThunk(
  "comments/fetchComments",
  async () => {
    const res = await fetch("https://jsonplaceholder.typicode.com/comments?_limit=3");
    if (!res.ok) throw new Error("Failed to fetch comments");
    const data = await res.json();
    return data.map((c) => ({ id: c.id, text: c.body.slice(0, 80), likes: 0 }));
  }
);

let nextLocalId = 1000;

const commentsSlice = createSlice({
  name: "comments",
  initialState: {
    items: [],
    loading: "idle",
    error: null,
  },
  reducers: {
    addComment: (state, action) => {
      state.items.push({
        id: nextLocalId++,
        text: action.payload.text,
        likes: 0,
      });
    },
    removeComment: (state, action) => {
      state.items = state.items.filter((c) => c.id !== action.payload.id);
    },
    likeComment: (state, action) => {
      const c = state.items.find((c) => c.id === action.payload.id);
      if (c) c.likes += 1;
    },
  },
  extraReducers: (builder) => {
    builder
      // Three handlers for the fetchComments thunk lifecycle.
      .addCase(fetchComments.pending, (state) => {
        state.loading = "pending";
        state.error = null;
      })
      .addCase(fetchComments.fulfilled, (state, action) => {
        state.loading = "idle";
        state.items = action.payload;
      })
      .addCase(fetchComments.rejected, (state, action) => {
        state.loading = "idle";
        state.error = action.error.message ?? "Unknown error";
      })
      // Cross-slice listening: the comments slice reacts to an action defined
      // in usersSlice. When the user signs out, clear cached comments.
      // This demonstrates the general extraReducers pattern: a slice can react
      // to any action dispatched anywhere in the app, not just its own.
      .addCase(signOut, (state) => {
        state.items = [];
        state.loading = "idle";
        state.error = null;
      });
  },
});

export const { addComment, removeComment, likeComment } = commentsSlice.actions;
export default commentsSlice.reducer;
