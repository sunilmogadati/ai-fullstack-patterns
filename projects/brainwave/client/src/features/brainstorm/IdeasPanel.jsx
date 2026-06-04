import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Heart, Loader2 } from "lucide-react";

import {
  fetchSession,
  addIdea,
  toggleLike,
} from "./brainstormSlice.js";
import { Button } from "../../components/ui/button.jsx";
import { Input } from "../../components/ui/input.jsx";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "../../components/ui/card.jsx";

// IdeasPanel — left panel of the Brainwave app. Shows the session header,
// the live list of ideas (newest first), the per-member like buttons, and
// the add-idea form.
//
// The right-panel AIInsightsPanel is added in v0.1 once the backend AI
// routes ship.
//
// "Who am I" — for v0 the active member is just a dropdown of the session's
// members. Real auth comes later.
export default function IdeasPanel() {
  const dispatch = useDispatch();

  const session = useSelector((s) => s.brainstorm.session);
  const ideas = useSelector((s) => s.brainstorm.ideas);
  const loading = useSelector((s) => s.brainstorm.loading.session);
  const error = useSelector((s) => s.brainstorm.error);

  const [activeMember, setActiveMember] = useState("");
  const [draft, setDraft] = useState("");

  useEffect(() => {
    dispatch(fetchSession());
  }, [dispatch]);

  // Once the session lands, default the active member to the first one in
  // the list. A real app would persist this across reloads.
  useEffect(() => {
    if (session && !activeMember) setActiveMember(session.members[0]);
  }, [session, activeMember]);

  function handleAdd(e) {
    e.preventDefault();
    if (!draft.trim() || !activeMember) return;
    dispatch(addIdea({ author: activeMember, text: draft.trim() }));
    setDraft("");
  }

  if (loading === "pending" && !session) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
        Loading session...
      </div>
    );
  }

  if (!session) {
    return (
      <div role="alert" className="text-sm text-destructive">
        Could not load session. Make sure the backend is running and
        VITE_SESSION_ID is set in client/.env.
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{session.name}</CardTitle>
        <CardDescription>
          {session.members.join(", ")}
          {session.description ? ` · ${session.description}` : ""}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs uppercase tracking-wide text-muted-foreground">
            Acting as
          </span>
          {session.members.map((m) => (
            <Button
              key={m}
              size="sm"
              variant={m === activeMember ? "default" : "outline"}
              onClick={() => setActiveMember(m)}
            >
              {m}
            </Button>
          ))}
        </div>

        <form onSubmit={handleAdd} className="flex gap-2">
          <Input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Add an idea..."
            aria-label="New idea"
          />
          <Button type="submit" disabled={!draft.trim() || !activeMember}>
            Add
          </Button>
        </form>

        {error && (
          <div
            role="alert"
            className="rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive"
          >
            {error}
          </div>
        )}

        {ideas.length > 0 ? (
          <ul className="divide-y divide-border rounded-md border">
            {ideas.map((idea) => {
              const liked = idea.likes.includes(activeMember);
              return (
                <li
                  key={idea.id}
                  className="flex items-center gap-3 px-4 py-3"
                >
                  <div className="flex-1">
                    <div className="text-sm text-foreground">{idea.text}</div>
                    <div className="text-xs text-muted-foreground">
                      {idea.author}
                      {idea.likes.length > 0
                        ? ` · ${idea.likes.length} like${
                            idea.likes.length === 1 ? "" : "s"
                          }`
                        : ""}
                    </div>
                  </div>
                  <Button
                    variant={liked ? "default" : "ghost"}
                    size="icon"
                    aria-label={liked ? "Unlike" : "Like"}
                    disabled={!activeMember}
                    onClick={() =>
                      dispatch(
                        toggleLike({ ideaId: idea.id, member: activeMember })
                      )
                    }
                  >
                    <Heart
                      className={`h-4 w-4 ${liked ? "fill-current" : ""}`}
                    />
                  </Button>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="rounded-md border border-dashed py-8 text-center text-sm text-muted-foreground">
            No ideas yet. Add the first one above.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
