import { useDispatch, useSelector } from "react-redux";
import ReactMarkdown from "react-markdown";
import { Sparkles, BarChart3, Eye, Loader2, RefreshCw } from "lucide-react";

import {
  generateSummary,
  generatePrioritize,
  generatePatterns,
} from "./brainstormSlice.js";
import { Button } from "../../components/ui/button.jsx";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "../../components/ui/card.jsx";

// Three insight cards, one per AI kind. Each card is self-contained:
//   - own loading state (per-kind from state.brainstorm.loading[kind])
//   - own error state (per-kind from state.brainstorm.aiError[kind])
//   - own cached output (from state.brainstorm.ai[kind])
//   - own regenerate button (forces a fresh LLM call)
//
// The card detects staleness by comparing basedOnIdeaCount (saved with the
// cached output) to the current idea count. When they diverge by more than a
// couple of ideas, a subtle "X new ideas since" indicator nudges the user
// to regenerate.

const CARDS = [
  {
    kind: "summary",
    title: "Themes",
    description: "What the group's ideas keep coming back to",
    icon: Sparkles,
    thunk: generateSummary,
  },
  {
    kind: "prioritize",
    title: "Top 5 Ranked",
    description: "Likes plus practical feasibility plus diversity",
    icon: BarChart3,
    thunk: generatePrioritize,
  },
  {
    kind: "patterns",
    title: "Group Preferences",
    description: "What this group seems to value",
    icon: Eye,
    thunk: generatePatterns,
  },
];

function InsightCard({ kind, title, description, icon: Icon, thunk }) {
  const dispatch = useDispatch();
  const output = useSelector((s) => s.brainstorm.ai[kind]);
  const loading = useSelector((s) => s.brainstorm.loading[kind]);
  const error = useSelector((s) => s.brainstorm.aiError[kind]);
  const currentIdeaCount = useSelector((s) => s.brainstorm.ideas.length);

  const isLoading = loading === "pending";
  const newSinceCached = output
    ? Math.max(0, currentIdeaCount - output.basedOnIdeaCount)
    : 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1.5">
            <CardTitle className="flex items-center gap-2 text-base">
              <Icon className="h-4 w-4" aria-hidden />
              {title}
            </CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          <Button
            variant="ghost"
            size="sm"
            disabled={isLoading || currentIdeaCount === 0}
            onClick={() => dispatch(thunk())}
            aria-label={output ? "Regenerate" : "Generate"}
          >
            {isLoading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
            ) : (
              <RefreshCw className="h-3.5 w-3.5" aria-hidden />
            )}
            <span className="ml-1.5 text-xs">
              {isLoading
                ? "Thinking"
                : output
                ? "Regenerate"
                : "Generate"}
            </span>
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {error && (
          <div
            role="alert"
            className="rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-xs text-destructive"
          >
            {error}
          </div>
        )}

        {!output && !isLoading && !error && (
          <p className="rounded-md border border-dashed py-6 text-center text-xs text-muted-foreground">
            Generate to see {title.toLowerCase()}.
          </p>
        )}

        {output && (
          <>
            <div className="prose prose-sm max-w-none text-sm leading-relaxed text-foreground prose-headings:text-foreground prose-strong:text-foreground prose-li:my-0.5">
              <ReactMarkdown>{output.output}</ReactMarkdown>
            </div>
            <div className="flex items-center justify-between border-t pt-2 text-xs text-muted-foreground">
              <span>
                Based on {output.basedOnIdeaCount} idea
                {output.basedOnIdeaCount === 1 ? "" : "s"}
                {newSinceCached > 0 ? ` · ${newSinceCached} new since` : ""}
              </span>
              <span>
                {output.inputTokens + output.outputTokens} tokens
              </span>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

export default function AIInsightsPanel() {
  return (
    <div className="space-y-4">
      <div className="px-1">
        <h2 className="text-lg font-semibold tracking-tight">AI Insights</h2>
        <p className="text-sm text-muted-foreground">
          On-demand synthesis of the brainstorm. Generated when you ask.
        </p>
      </div>
      {CARDS.map((card) => (
        <InsightCard key={card.kind} {...card} />
      ))}
    </div>
  );
}
