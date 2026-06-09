// AI routes — three on-demand endpoints, all pessimistic (LLM call latency is
// real and the user expects a clear "thinking" state).
//
// Caching discipline:
//   - Every successful call persists an AIOutput row keyed on (sessionId, kind).
//   - The route does NOT auto-serve from cache. It regenerates on every call.
//   - The frontend can choose: read the cached output from GET /sessions/:id
//     (cheap, fast) OR call POST /:id/ai/:kind to force a fresh generation.
//   - basedOnIdeaCount captures the idea count at generation time so the
//     frontend can tell the user "this summary is from N ideas ago".
//
// This mirrors PDP §3.6.13 (prompts-as-code) + §3.6.14 (semantic caching
// philosophy — prompt-cache is free, full semantic cache deferred).

import { Router } from "express";
import { Session } from "../models/Session.js";
import { Idea } from "../models/Idea.js";
import { AIOutput } from "../models/AIOutput.js";
import { validateObjectIdParam } from "../middleware/validate.js";
import { callClaude } from "../lib/claude.js";
import { AI_KINDS } from "../lib/prompts.js";

const router = Router();

// One handler factory, three routes — all three AI operations share the same
// shape (load session + ideas, render prompt, call Claude, persist output).
// Factoring this keeps the route handlers small and makes adding a 4th kind
// (e.g., "risks") a one-line addition.
function makeAiHandler(kind) {
  const { tier, build } = AI_KINDS[kind];

  return async (req, res, next) => {
    try {
      const session = await Session.findById(req.params.id);
      if (!session) {
        const err = new Error("session not found");
        err.status = 404;
        return next(err);
      }

      // Read ideas in deterministic order (newest first) so the prompt input
      // is stable across calls — important if you ever want to compare runs.
      const ideas = await Idea.find({ sessionId: session._id }).sort({
        createdAt: -1,
      });

      if (ideas.length === 0) {
        const err = new Error("session has no ideas; add some first");
        err.status = 400;
        return next(err);
      }

      const { system, user } = build(session, ideas);
      const result = await callClaude({ tier, system, user });

      const output = await AIOutput.create({
        sessionId: session._id,
        kind,
        output: result.text,
        model: result.model,
        basedOnIdeaCount: ideas.length,
        inputTokens: result.inputTokens,
        outputTokens: result.outputTokens,
      });

      res.status(201).json(output);
    } catch (err) {
      next(err);
    }
  };
}

router.post("/:id/ai/summarize", validateObjectIdParam("id"), makeAiHandler("summary"));
router.post("/:id/ai/prioritize", validateObjectIdParam("id"), makeAiHandler("prioritize"));
router.post("/:id/ai/patterns", validateObjectIdParam("id"), makeAiHandler("patterns"));

export default router;
