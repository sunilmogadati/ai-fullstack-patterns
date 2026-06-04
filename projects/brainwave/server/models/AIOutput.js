// AIOutput model.
//
// A cached result of an on-demand AI call (summarize / prioritize / patterns)
// against a particular session at a particular moment. Storing these is the
// difference between an artifact that bills the LLM API on every page reload
// and an artifact that respects cost.
//
// The basedOnIdeaCount field lets the UI tell the user "this summary is from
// 8 ideas ago — regenerate?" without having to keep a separate "stale" flag.
// Compare the count at view time vs. the count when the output was generated.
//
// kind is constrained at the schema layer so a typo at the route handler
// would be caught before write.

import mongoose from "mongoose";

const aiOutputSchema = new mongoose.Schema(
  {
    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Session",
      required: true,
      index: true,
    },
    kind: {
      type: String,
      enum: {
        values: ["summary", "prioritize", "patterns"],
        message: "kind must be summary, prioritize, or patterns",
      },
      required: true,
    },
    output: {
      type: String,
      required: true,
    },
    model: {
      type: String,
      required: true,
    },
    basedOnIdeaCount: {
      type: Number,
      required: true,
      min: 0,
    },
    inputTokens: { type: Number, default: 0 },
    outputTokens: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret) => {
        ret.id = ret._id.toString();
        ret.sessionId = ret.sessionId.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Compound index — we frequently look up "the most recent output of kind K
// for session S," and a (sessionId, kind, createdAt desc) index makes that
// query single-seek.
aiOutputSchema.index({ sessionId: 1, kind: 1, createdAt: -1 });

export const AIOutput = mongoose.model("AIOutput", aiOutputSchema);
