// Session model.
//
// A brainstorming session is the container — a named context with a list of
// members who can contribute ideas. For v0 we keep this minimal: name,
// optional description, and an array of member names. No user accounts, no
// invites, no roles. Real auth is a v0.1 concern.
//
// The schema is the contract. A Session has these fields and these
// constraints; anything that does not match gets rejected at the boundary.

import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "name is required"],
      trim: true,
      minlength: [1, "name cannot be empty"],
      maxlength: [120, "name cannot exceed 120 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "description cannot exceed 500 characters"],
      default: "",
    },
    members: {
      type: [String],
      validate: {
        validator: (arr) => Array.isArray(arr) && arr.length >= 1,
        message: "at least one member is required",
      },
    },
  },
  {
    timestamps: true,
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

export const Session = mongoose.model("Session", sessionSchema);
