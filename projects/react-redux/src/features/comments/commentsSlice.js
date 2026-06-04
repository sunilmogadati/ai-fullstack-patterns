// commentsSlice — wired to the express-comments-api backend.
//
// The earlier version of this file kept add / remove / like as synchronous
// reducers operating on local state. That was fine for proving Redux mechanics
// but it did not reflect production reality: in a real app, those operations
// have to round-trip through a server.
//
// Now every mutation is an async thunk. The slice handles four lifecycles
// (fetch / add / like / remove), each with three actions (pending /
// fulfilled / rejected) — twelve action types in total, every one of which
// shows up in Redux DevTools and is time-travel-debuggable.
//
// Two update strategies are demonstrated below:
//
//   PESSIMISTIC (used by fetch, add, remove): wait for the server to
//   confirm before changing UI state. Safer; slightly slower-feeling.
//
//   OPTIMISTIC (used by like): change UI state immediately, then revert
//   if the server rejects. Feels instant; needs explicit rollback logic.
//
// The choice between them is not a style preference — it is a contract with
// the user. "Like" is high-frequency, low-stakes, idempotent-ish; optimistic
// is correct. "Add" requires a server-generated id; pessimistic is the only
// honest choice. Picking the wrong one is a real bug, not a polish issue.

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const API = "http://localhost:3001/comments";

// Small helper so each thunk has the same fetch + error shape.
// In a larger app this would live in a separate client module with retry,
// timeout, auth headers, etc.
async function request(url, options) {
  const res = await fetch(url, options);
  if (!res.ok) {
    // Try to surface the server's error message; fall back if the body is
    // not the expected shape.
    let message = `${res.status} ${res.statusText}`;
    try {
      const body = await res.json();
      if (body?.error?.message) message = body.error.message;
    } catch {}
    throw new Error(message);
  }
  // 204 No Content (delete) has no body to parse.
  if (res.status === 204) return null;
  return res.json();
}

// ---- Thunks --------------------------------------------------------------

export const fetchComments = createAsyncThunk(
  "comments/fetchComments",
  async () => request(API)
);

export const addComment = createAsyncThunk(
  "comments/addComment",
  async ({ text }) =>
    request(API, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ text }),
    })
);

export const likeComment = createAsyncThunk(
  "comments/likeComment",
  async ({ id }) =>
    request(`${API}/${id}/like`, { method: "PATCH" })
);

export const removeComment = createAsyncThunk(
  "comments/removeComment",
  async ({ id }) => {
    await request(`${API}/${id}`, { method: "DELETE" });
    // Return the id so the reducer knows what to remove from state.
    return { id };
  }
);

// ---- Slice ---------------------------------------------------------------

const commentsSlice = createSlice({
  name: "comments",
  initialState: {
    items: [],
    loading: "idle",   // "idle" | "pending"
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // ---- fetchComments (pessimistic) -------------------------------
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
        state.error = action.error.message ?? "fetch failed";
      })

      // ---- addComment (pessimistic) -----------------------------------
      // We do not mutate state in pending — there is no id yet, so there
      // is nothing to optimistically add. The fulfilled case appends the
      // server-shaped document (with id, createdAt, likes=0).
      .addCase(addComment.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      .addCase(addComment.rejected, (state, action) => {
        state.error = action.error.message ?? "add failed";
      })

      // ---- likeComment (optimistic) -----------------------------------
      // Increment immediately in pending; the server confirms in fulfilled;
      // rejected rolls back. arg = { id } — Redux Toolkit makes the thunk's
      // input available on action.meta.arg, which is how we know what to
      // roll back.
      .addCase(likeComment.pending, (state, action) => {
        const c = state.items.find((c) => c.id === action.meta.arg.id);
        if (c) c.likes += 1;
      })
      .addCase(likeComment.fulfilled, (state, action) => {
        // Server-confirmed value. Replace optimistic count with the truth.
        const c = state.items.find((c) => c.id === action.payload.id);
        if (c) c.likes = action.payload.likes;
      })
      .addCase(likeComment.rejected, (state, action) => {
        // Roll back the optimistic increment.
        const c = state.items.find((c) => c.id === action.meta.arg.id);
        if (c) c.likes = Math.max(0, c.likes - 1);
        state.error = action.error.message ?? "like failed";
      })

      // ---- removeComment (pessimistic) --------------------------------
      // We do not optimistically remove the item — a network failure
      // would resurrect a "ghost" delete on the screen, which is jarring.
      // Confirm with the server first, then remove.
      .addCase(removeComment.fulfilled, (state, action) => {
        state.items = state.items.filter((c) => c.id !== action.payload.id);
      })
      .addCase(removeComment.rejected, (state, action) => {
        state.error = action.error.message ?? "remove failed";
      });
  },
});

export default commentsSlice.reducer;
