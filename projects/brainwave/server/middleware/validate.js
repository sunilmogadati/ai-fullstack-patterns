// Request validation middleware.
//
// Same layered-defense pattern as express-comments-api: middleware catches
// malformed shapes early so route handlers can assume well-formed input.
// Mongoose schema validators provide the safety-net layer at the database
// boundary.

export function validateNewIdea(req, res, next) {
  const { author, text } = req.body ?? {};

  if (typeof author !== "string" || author.trim().length === 0) {
    return badRequest(next, "author is required");
  }
  if (author.trim().length > 60) {
    return badRequest(next, "author name cannot exceed 60 characters");
  }
  if (typeof text !== "string") {
    return badRequest(next, "text must be a string");
  }
  const trimmed = text.trim();
  if (trimmed.length === 0) {
    return badRequest(next, "text cannot be empty");
  }
  if (trimmed.length > 280) {
    return badRequest(next, "text cannot exceed 280 characters");
  }

  req.body.author = author.trim();
  req.body.text = trimmed;
  next();
}

export function validateLikeToggle(req, res, next) {
  const { member } = req.body ?? {};
  if (typeof member !== "string" || member.trim().length === 0) {
    return badRequest(next, "member is required");
  }
  req.body.member = member.trim();
  next();
}

export function validateObjectIdParam(paramName) {
  return (req, res, next) => {
    const id = req.params[paramName];
    if (!/^[a-f0-9]{24}$/i.test(id)) {
      return badRequest(next, `invalid ${paramName}`);
    }
    next();
  };
}

function badRequest(next, message) {
  const err = new Error(message);
  err.status = 400;
  next(err);
}
