// Sessions router.
//
// Three routes for v0:
//   GET    /sessions/:id                       — session + ideas + cached AI outputs
//   POST   /sessions/:id/ideas                 — add an idea
//   PATCH  /sessions/:id/ideas/:ideaId/like    — toggle a member's like
//
// AI routes live in routes/ai.js (added in Evening 2).
//
// Each handler is async; errors propagate via next(err) to the centralized
// error handler.

import { Router } from "express";
import { Session } from "../models/Session.js";
import { Idea } from "../models/Idea.js";
import { AIOutput } from "../models/AIOutput.js";
import {
  validateNewIdea,
  validateLikeToggle,
  validateObjectIdParam,
} from "../middleware/validate.js";

const router = Router();

// GET /sessions/:id
// Returns the session, all ideas (newest first), and the most-recent cached
// AI output for each of the three kinds. The frontend reads everything in
// one shot so the initial paint is one network round-trip.
router.get(
  "/:id",
  validateObjectIdParam("id"),
  async (req, res, next) => {
    try {
      const session = await Session.findById(req.params.id);
      if (!session) {
        const err = new Error("session not found");
        err.status = 404;
        return next(err);
      }

      const ideas = await Idea.find({ sessionId: session._id }).sort({
        createdAt: -1,
      });

      // For each kind, fetch the most recent cached output. Three small
      // queries — could be parallel, but the index makes each one fast.
      const aiKinds = ["summary", "prioritize", "patterns"];
      const aiOutputs = {};
      for (const kind of aiKinds) {
        const latest = await AIOutput.findOne({
          sessionId: session._id,
          kind,
        })
          .sort({ createdAt: -1 })
          .limit(1);
        aiOutputs[kind] = latest ?? null;
      }

      res.json({
        session,
        ideas,
        aiOutputs,
      });
    } catch (err) {
      next(err);
    }
  }
);

// POST /sessions/:id/ideas
// Add a new idea to a session.
router.post(
  "/:id/ideas",
  validateObjectIdParam("id"),
  validateNewIdea,
  async (req, res, next) => {
    try {
      const session = await Session.findById(req.params.id);
      if (!session) {
        const err = new Error("session not found");
        err.status = 404;
        return next(err);
      }

      const idea = await Idea.create({
        sessionId: session._id,
        author: req.body.author,
        text: req.body.text,
      });
      res.status(201).json(idea);
    } catch (err) {
      next(err);
    }
  }
);

// PATCH /sessions/:id/ideas/:ideaId/like
// Toggle a member's like on an idea. Body: { member }.
// We enforce set semantics in code — if the member is already in the likes
// array, remove them; otherwise add them. Atomic at the MongoDB layer via
// $addToSet and $pull operators.
router.patch(
  "/:id/ideas/:ideaId/like",
  validateObjectIdParam("id"),
  validateObjectIdParam("ideaId"),
  validateLikeToggle,
  async (req, res, next) => {
    try {
      const { ideaId } = req.params;
      const { member } = req.body;

      // Read the current state to decide which atomic operator to use.
      const existing = await Idea.findById(ideaId);
      if (!existing) {
        const err = new Error("idea not found");
        err.status = 404;
        return next(err);
      }

      const update = existing.likes.includes(member)
        ? { $pull: { likes: member } }
        : { $addToSet: { likes: member } };

      const idea = await Idea.findByIdAndUpdate(ideaId, update, {
        new: true,
      });
      res.json(idea);
    } catch (err) {
      next(err);
    }
  }
);

export default router;
