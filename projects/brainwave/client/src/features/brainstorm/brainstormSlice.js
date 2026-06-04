// brainstormSlice — same discipline as the comments-app slice, extended
// for the brainstorming session shape (session + ideas + cached AI outputs).
//
// Three async thunks for v0:
//   fetchSession    — pessimistic (initial load)
//   addIdea         — pessimistic (server assigns id + createdAt)
//   toggleLike      — optimistic (the result is predictable: add or remove
//                     the member from the likes array)
//
// The AI thunks (generateSummary / generatePrioritize / generatePatterns)
// land in v0.1 once the backend AI routes ship. They will be pessimistic
// because LLM output is not predictable; spinner + wait is correct.

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const API = import.meta.env.VITE_API_URL ?? "http://localhost:3002";

// Single sample session id — for v0 the app is bound to one session,
// hard-coded or supplied via env. The seed script prints the id you need.
const SESSION_ID = import.meta.env.VITE_SESSION_ID;

if (!SESSION_ID) {
  console.warn(
    "VITE_SESSION_ID is not set. Run `npm run seed` in the server and copy " +
      "the session id into client/.env as VITE_SESSION_ID."
  );
}

// Shared request helper — same pattern as the comments-app slice.
async function request(url, options) {
  const res = await fetch(url, options);
  if (!res.ok) {
    let message = `${res.status} ${res.statusText}`;
    try {
      const body = await res.json();
      if (body?.error?.message) message = body.error.message;
    } catch {}
    throw new Error(message);
  }
  if (res.status === 204) return null;
  return res.json();
}

// ---- Thunks --------------------------------------------------------------

export const fetchSession = createAsyncThunk(
  "brainstorm/fetchSession",
  async () => request(`${API}/sessions/${SESSION_ID}`)
);

export const addIdea = createAsyncThunk(
  "brainstorm/addIdea",
  async ({ author, text }) =>
    request(`${API}/sessions/${SESSION_ID}/ideas`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ author, text }),
    })
);

export const toggleLike = createAsyncThunk(
  "brainstorm/toggleLike",
  async ({ ideaId, member }) =>
    request(`${API}/sessions/${SESSION_ID}/ideas/${ideaId}/like`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ member }),
    })
);

// ---- Slice ---------------------------------------------------------------

const brainstormSlice = createSlice({
  name: "brainstorm",
  initialState: {
    session: null,
    ideas: [],
    ai: {
      summary: null,
      prioritize: null,
      patterns: null,
    },
    loading: {
      session: "idle",
    },
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // ---- fetchSession (pessimistic) -------------------------------
      .addCase(fetchSession.pending, (state) => {
        state.loading.session = "pending";
        state.error = null;
      })
      .addCase(fetchSession.fulfilled, (state, action) => {
        state.loading.session = "idle";
        state.session = action.payload.session;
        state.ideas = action.payload.ideas;
        state.ai = action.payload.aiOutputs ?? state.ai;
      })
      .addCase(fetchSession.rejected, (state, action) => {
        state.loading.session = "idle";
        state.error = action.error.message ?? "fetch failed";
      })

      // ---- addIdea (pessimistic) -----------------------------------
      // Server generates id + createdAt, so optimistic is dishonest.
      .addCase(addIdea.fulfilled, (state, action) => {
        state.ideas.unshift(action.payload);
      })
      .addCase(addIdea.rejected, (state, action) => {
        state.error = action.error.message ?? "add failed";
      })

      // ---- toggleLike (optimistic) ---------------------------------
      // The result is predictable: the member either gets added to the
      // likes array, or removed from it. We mutate immediately on
      // pending; replace with server truth on fulfilled; roll back on
      // rejected via action.meta.arg.
      .addCase(toggleLike.pending, (state, action) => {
        const { ideaId, member } = action.meta.arg;
        const idea = state.ideas.find((i) => i.id === ideaId);
        if (!idea) return;
        if (idea.likes.includes(member)) {
          idea.likes = idea.likes.filter((m) => m !== member);
        } else {
          idea.likes = [...idea.likes, member];
        }
      })
      .addCase(toggleLike.fulfilled, (state, action) => {
        const idea = state.ideas.find((i) => i.id === action.payload.id);
        if (idea) idea.likes = action.payload.likes;
      })
      .addCase(toggleLike.rejected, (state, action) => {
        // Roll back — flip the membership again.
        const { ideaId, member } = action.meta.arg;
        const idea = state.ideas.find((i) => i.id === ideaId);
        if (!idea) return;
        if (idea.likes.includes(member)) {
          idea.likes = idea.likes.filter((m) => m !== member);
        } else {
          idea.likes = [...idea.likes, member];
        }
        state.error = action.error.message ?? "like failed";
      });
  },
});

export default brainstormSlice.reducer;
