// Idea model.
//
// A single brainstorm post. Belongs to a session, authored by one member,
// liked by zero or more members. Likes are stored as an array of member
// names so we can compute "did Alex like this?" by membership check.
//
// Two production properties worth noting:
//   - sessionId is indexed so listing ideas for a session is one indexed
//     scan, not a collection scan.
//   - likes is a Set semantically (a member either liked or didn't), but
//     Mongoose stores it as an array. The route handler enforces the
//     set semantics on toggle.

import mongoose from "mongoose";

const ideaSchema = new mongoose.Schema(
  {
    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Session",
      required: [true, "sessionId is required"],
      index: true,
    },
    author: {
      type: String,
      required: [true, "author is required"],
      trim: true,
      maxlength: [60, "author name cannot exceed 60 characters"],
    },
    text: {
      type: String,
      required: [true, "text is required"],
      trim: true,
      minlength: [1, "text cannot be empty"],
      maxlength: [280, "text cannot exceed 280 characters"],
    },
    likes: {
      type: [String],
      default: [],
    },
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

export const Idea = mongoose.model("Idea", ideaSchema);
