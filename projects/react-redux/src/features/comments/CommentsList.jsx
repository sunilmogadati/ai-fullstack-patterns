import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Heart, Trash2, Loader2 } from "lucide-react";

import {
  addComment,
  removeComment,
  likeComment,
  fetchComments,
} from "./commentsSlice.js";
import { Button } from "../../components/ui/button.jsx";
import { Input } from "../../components/ui/input.jsx";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "../../components/ui/card.jsx";

// CommentsList demonstrates the full React-Redux integration in one component.
//
//   - useDispatch() returns the store's dispatch function. We call it with action
//     creators / thunks (addComment, removeComment, likeComment, fetchComments)
//     to trigger state changes.
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
//
// UI primitives — Button, Input, Card — come from shadcn/ui (the "new-york"
// style, neutral base color). Styling is Tailwind utility classes. This is the
// production default for new React apps in 2026.
export default function CommentsList() {
  const dispatch = useDispatch();

  const items = useSelector((state) => state.comments.items);
  const loading = useSelector((state) => state.comments.loading);
  const error = useSelector((state) => state.comments.error);

  const [draft, setDraft] = useState("");

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
    <div className="mx-auto max-w-2xl px-4 py-12">
      <Card>
        <CardHeader>
          <CardTitle>Comments</CardTitle>
          <CardDescription>
            Redux Toolkit + React, wired to a real Express backend. Open Redux
            DevTools to watch actions and state.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <form onSubmit={handleAdd} className="flex gap-2">
            <Input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Add a comment..."
              aria-label="New comment"
            />
            <Button type="submit" disabled={!draft.trim()}>
              Add
            </Button>
          </form>

          {loading === "pending" && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              Loading comments...
            </div>
          )}

          {error && (
            <div
              role="alert"
              className="rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive"
            >
              {error}
            </div>
          )}

          {items.length > 0 ? (
            <ul className="divide-y divide-border rounded-md border">
              {items.map((c) => (
                <li
                  key={c.id}
                  className="flex items-center gap-3 px-4 py-3"
                >
                  <span className="flex-1 text-sm text-foreground">
                    {c.text}
                  </span>
                  <span className="min-w-[3.5rem] text-right text-xs text-muted-foreground">
                    {c.likes} {c.likes === 1 ? "like" : "likes"}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Like"
                    onClick={() => dispatch(likeComment({ id: c.id }))}
                  >
                    <Heart className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Remove"
                    onClick={() => dispatch(removeComment({ id: c.id }))}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </li>
              ))}
            </ul>
          ) : (
            loading !== "pending" && (
              <p className="rounded-md border border-dashed py-8 text-center text-sm text-muted-foreground">
                No comments yet. Add one above.
              </p>
            )
          )}
        </CardContent>
      </Card>
    </div>
  );
}
