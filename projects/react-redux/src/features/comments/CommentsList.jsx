import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  addComment,
  removeComment,
  likeComment,
  fetchComments,
} from "./commentsSlice.js";

// CommentsList demonstrates the full React-Redux integration in one component.
//
//   - useDispatch() returns the store's dispatch function. We call it with action
//     creators (addComment, removeComment, likeComment) and with the thunk
//     (fetchComments) to trigger state changes.
//
//   - useSelector(fn) reads a slice of state from the store AND subscribes the
//     component to it. The component re-renders whenever the selected value
//     changes (compared by === reference equality).
//
//   - Local UI state (the draft text in the input) stays in useState. Redux is
//     for state that needs to be shared; this draft does not.
//
//   - useEffect runs once on mount to dispatch fetchComments(), which fires the
//     async thunk and populates the store with initial data from the API.
export default function CommentsList() {
  const dispatch = useDispatch();

  // Each useSelector subscribes the component to one slice of state.
  // When state.comments.items changes (by reference), the component re-renders.
  const items = useSelector((state) => state.comments.items);
  const loading = useSelector((state) => state.comments.loading);
  const error = useSelector((state) => state.comments.error);

  // Local UI state for the new-comment input. Stays out of Redux.
  const [draft, setDraft] = useState("");

  // Fetch initial comments once on mount.
  // The async thunk dispatches comments/fetchComments/pending immediately, then
  // /fulfilled or /rejected when the API responds. The slice's extraReducers
  // handles each lifecycle action.
  useEffect(() => {
    dispatch(fetchComments());
  }, [dispatch]);

  function handleAdd(e) {
    e.preventDefault();
    if (!draft.trim()) return;
    dispatch(addComment({ text: draft.trim() }));
    setDraft("");
  }

  return (
    <div style={{ maxWidth: 640, margin: "2rem auto", fontFamily: "ui-sans-serif, system-ui, sans-serif" }}>
      <h1 style={{ marginBottom: "0.25rem" }}>Comments</h1>
      <p style={{ color: "#555", marginTop: 0 }}>
        Redux Toolkit + React. Open Redux DevTools to watch actions and state.
      </p>

      <form onSubmit={handleAdd} style={{ display: "flex", gap: "0.5rem", margin: "1rem 0" }}>
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Add a comment..."
          style={{ flex: 1, padding: "0.5rem 0.75rem", fontSize: "1rem", borderRadius: 6, border: "1px solid #ccc" }}
        />
        <button type="submit" style={{ padding: "0.5rem 1rem", fontSize: "1rem", borderRadius: 6, border: "1px solid #2a4d7c", background: "#2a4d7c", color: "#fff", cursor: "pointer" }}>
          Add
        </button>
      </form>

      {loading === "pending" && <p style={{ color: "#555" }}>Loading initial comments...</p>}
      {error && <p style={{ color: "#b91c1c" }}>Error: {error}</p>}

      <ul style={{ listStyle: "none", padding: 0 }}>
        {items.map((c) => (
          <li
            key={c.id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.75rem 0",
              borderBottom: "1px solid #eee",
            }}
          >
            <span style={{ flex: 1, color: "#111" }}>{c.text}</span>
            <span style={{ color: "#666", fontSize: "0.85rem", minWidth: "60px" }}>
              {c.likes} {c.likes === 1 ? "like" : "likes"}
            </span>
            <button
              onClick={() => dispatch(likeComment({ id: c.id }))}
              style={{ padding: "0.25rem 0.65rem", fontSize: "0.85rem", borderRadius: 4, border: "1px solid #15803d", background: "#15803d", color: "#fff", cursor: "pointer" }}
            >
              Like
            </button>
            <button
              onClick={() => dispatch(removeComment({ id: c.id }))}
              style={{ padding: "0.25rem 0.5rem", fontSize: "0.85rem", borderRadius: 4, border: "1px solid #ddd", background: "#fafafa", cursor: "pointer" }}
            >
              Remove
            </button>
          </li>
        ))}
      </ul>

      {items.length === 0 && loading !== "pending" && (
        <p style={{ color: "#888", textAlign: "center", marginTop: "2rem" }}>
          No comments yet. Add one above.
        </p>
      )}
    </div>
  );
}
