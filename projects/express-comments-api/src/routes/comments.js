// Comments router.
//
// Each route is a thin orchestration over the model. The router does NOT
// validate input (that is validate.js), shape errors (that is errorHandler.js),
// or know about HTTP transport details (that is server.js). It does one
// thing: translate a well-formed request into a database operation and a
// response.
//
// Async error handling: each handler is `async`, and we use Express 5-style
// promise rejection propagation — any error thrown or rejected promise
// returned from an async route handler is passed to next() automatically.
// On Express 4 you would need to wrap with try/catch or use the
// `express-async-errors` shim; we keep the try/catch for clarity below.

import { Router } from "express";
import { Comment } from "../models/Comment.js";
import {
  validateNewComment,
  validateObjectIdParam,
} from "../middleware/validate.js";

const router = Router();

// GET /comments
// List all comments, newest first.
router.get("/", async (req, res, next) => {
  try {
    const comments = await Comment.find().sort({ createdAt: -1 });
    res.json(comments);
  } catch (err) {
    next(err);
  }
});

// POST /comments
// Create a new comment. The server assigns id and createdAt.
router.post("/", validateNewComment, async (req, res, next) => {
  try {
    const comment = await Comment.create({ text: req.body.text });
    res.status(201).json(comment);
  } catch (err) {
    next(err);
  }
});

// PATCH /comments/:id/like
// Increment likes by 1. Using $inc keeps the operation atomic at the database
// layer — two concurrent likes never race to overwrite each other.
router.patch(
  "/:id/like",
  validateObjectIdParam("id"),
  async (req, res, next) => {
    try {
      const comment = await Comment.findByIdAndUpdate(
        req.params.id,
        { $inc: { likes: 1 } },
        { new: true } // return the updated document, not the pre-update one
      );
      if (!comment) {
        const err = new Error("comment not found");
        err.status = 404;
        return next(err);
      }
      res.json(comment);
    } catch (err) {
      next(err);
    }
  }
);

// DELETE /comments/:id
router.delete(
  "/:id",
  validateObjectIdParam("id"),
  async (req, res, next) => {
    try {
      const comment = await Comment.findByIdAndDelete(req.params.id);
      if (!comment) {
        const err = new Error("comment not found");
        err.status = 404;
        return next(err);
      }
      // 204 No Content is the conventional response for a successful delete.
      // We send no body; the client already knows the id it deleted.
      res.status(204).end();
    } catch (err) {
      next(err);
    }
  }
);

export default router;
