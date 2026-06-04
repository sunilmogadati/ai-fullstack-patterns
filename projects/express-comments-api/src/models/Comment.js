// Comment model.
//
// The schema is a contract. It says: a Comment has exactly these fields,
// of exactly these types, with exactly these constraints. Anything that
// does not match the contract gets rejected at the persistence boundary —
// you never end up with a half-shaped document in the database because some
// route handler forgot to validate one field.
//
// Two layers of validation will end up running:
//   1. Request validation in middleware (rejects bad input early, returns 400).
//   2. Schema validation in Mongoose (the safety net before the write).
//
// Both layers exist deliberately. The middleware gives fast, specific error
// messages back to the client. The schema validator guarantees that anything
// that reaches the database obeys the rules — even if a future code path
// somehow skips the middleware.

import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: [true, "text is required"],
      trim: true,
      minlength: [1, "text cannot be empty"],
      maxlength: [280, "text cannot exceed 280 characters"],
    },
    likes: {
      type: Number,
      default: 0,
      min: [0, "likes cannot go negative"],
    },
  },
  {
    // timestamps: true gives us createdAt + updatedAt automatically.
    // The client-facing shape uses createdAt for ordering and display.
    timestamps: true,

    // toJSON transform: the document the client receives uses `id` (string)
    // instead of `_id` (ObjectId). Cleaner, and we hide __v (the Mongoose
    // version key) because the client never needs it.
    toJSON: {
      transform: (_doc, ret) => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

export const Comment = mongoose.model("Comment", commentSchema);
