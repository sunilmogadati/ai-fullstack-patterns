import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// Async thunk: fetches comments from a mock endpoint.
// Generates three actions automatically:
//   comments/fetchComments/pending
//   comments/fetchComments/fulfilled
//   comments/fetchComments/rejected
export const fetchComments = createAsyncThunk(
  "comments/fetchComments",
  async () => {
    const res = await fetch("https://jsonplaceholder.typicode.com/comments?_limit=5");
    if (!res.ok) throw new Error("Failed to fetch comments");
    const data = await res.json();
    // Normalize to our slice shape.
    return data.map((c) => ({ id: c.id, text: c.body.slice(0, 80), likes: 0 }));
  }
);

let nextLocalId = 1000;

const commentsSlice = createSlice({
  name: "comments",
  initialState: {
    items: [],
    loading: "idle",   // "idle" | "pending"
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
      });
  },
});

export const { addComment, removeComment, likeComment } = commentsSlice.actions;
export default commentsSlice.reducer;
