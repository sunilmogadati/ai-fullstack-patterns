// Prompts as code.
//
// Three reasons these live in source (not in a database, not in an admin UI):
//   1. Versioned in git — every prompt change is diffable, reviewable, revertable.
//   2. PR-reviewable like any other code change.
//   3. Co-located with the code that consumes them — no second deploy needed
//      to ship a prompt update.
//
// This mirrors PDP §3.6.13 (Prompt engineering & management) — prompts-as-code
// is the canonical default; managed tools (PromptLayer, Langfuse prompt mgmt)
// earn their place only when A/B test infrastructure justifies them.
//
// Templating is intentionally lightweight — {{var}} substitution, nothing more.
// Anything fancier (conditionals, loops in the template) is a signal to write
// the prompt assembly in code, not in the template.

function render(template, vars) {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => {
    if (!(key in vars)) {
      throw new Error(`prompt template missing variable: ${key}`);
    }
    return String(vars[key]);
  });
}

// Helper to format ideas as a numbered list for prompt inclusion.
function formatIdeas(ideas) {
  return ideas
    .map((idea, i) => {
      const likeCount = idea.likes?.length ?? 0;
      const likers = idea.likes?.length ? ` [liked by: ${idea.likes.join(", ")}]` : "";
      return `${i + 1}. ${idea.text} (by ${idea.author}; ${likeCount} like${likeCount === 1 ? "" : "s"})${likers}`;
    })
    .join("\n");
}

// ---- Summary prompt ------------------------------------------------------

const SUMMARY_SYSTEM = `You are an assistant that summarizes a group brainstorming session into clear themes.

Be specific. Avoid generic platitudes like "the group values creativity." Say things like "the group has a strong preference for outdoor activities done together, rather than splits or solo pursuits."

Output format: a short markdown list of 3-5 named themes. For each theme: bold name followed by which ideas (by number) fit it. End with a one-sentence reflection on what the group seems to be optimizing for.`;

const SUMMARY_USER = `Session: {{name}}
Members: {{members}}

Ideas (with like counts):
{{ideas}}

Summarize the themes in this brainstorm.`;

export function buildSummaryPrompt(session, ideas) {
  return {
    system: SUMMARY_SYSTEM,
    user: render(SUMMARY_USER, {
      name: session.name,
      members: session.members.join(", "),
      ideas: formatIdeas(ideas),
    }),
  };
}

// ---- Prioritize prompt ---------------------------------------------------

const PRIORITIZE_SYSTEM = `You are an assistant that ranks brainstorming ideas for a group decision.

Ranking criteria, in order of weight:
1. Likes from the group (popularity signal — strongest indicator of fit)
2. Apparent practical feasibility (your judgment; consider effort, cost, logistics)
3. Diversity of the top-5 (if 5 of the top 5 are the same kind of activity, bump one slot for a high-quality alternative kind)

Output format: a numbered markdown list of the top 5 ideas with a one-sentence rationale per item that explicitly names which criteria drove the rank.`;

const PRIORITIZE_USER = `Session: {{name}}
Members: {{members}}

Ideas:
{{ideas}}

Rank the top 5 ideas.`;

export function buildPrioritizePrompt(session, ideas) {
  return {
    system: PRIORITIZE_SYSTEM,
    user: render(PRIORITIZE_USER, {
      name: session.name,
      members: session.members.join(", "),
      ideas: formatIdeas(ideas),
    }),
  };
}

// ---- Patterns prompt -----------------------------------------------------

const PATTERNS_SYSTEM = `You are an assistant that identifies group preferences from a brainstorm.

Look at what this group has chosen to brainstorm and what they have actually LIKED (not just proposed) — likes are the strongest preference signal. Surface 3-5 patterns that describe what the group seems to value.

Pattern dimensions to consider: budget posture (frugal vs. splurge), activity intensity (low-key vs. high-energy), group cohesion (everyone together vs. splits OK), planning style (structured vs. spontaneous), risk tolerance (safe vs. adventurous), novelty preference (familiar vs. new experiences).

Be specific to THIS group's signals — do not produce generic advice that would apply to any brainstorm.

Output format: a short markdown list of 3-5 patterns. For each: bold name + one-sentence specific description grounded in the actual likes.`;

const PATTERNS_USER = `Session: {{name}}
Members: {{members}}

Ideas with likes:
{{ideas}}

What patterns describe this group's preferences?`;

export function buildPatternsPrompt(session, ideas) {
  return {
    system: PATTERNS_SYSTEM,
    user: render(PATTERNS_USER, {
      name: session.name,
      members: session.members.join(", "),
      ideas: formatIdeas(ideas),
    }),
  };
}

// ---- Kind → tier + prompt-builder router --------------------------------

// Single export point that routes a "kind" (matches AIOutput.kind enum) to
// the right model tier and prompt builder. The route handler can stay generic
// and not have to know which kind uses which model.
export const AI_KINDS = {
  summary: { tier: "haiku", build: buildSummaryPrompt },
  prioritize: { tier: "sonnet", build: buildPrioritizePrompt },
  patterns: { tier: "haiku", build: buildPatternsPrompt },
};
