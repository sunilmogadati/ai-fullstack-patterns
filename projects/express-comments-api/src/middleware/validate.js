// Request validation middleware.
//
// This layer rejects bad input BEFORE it reaches the route handler — and
// long before it reaches the database. The route handler can then assume
// req.body is well-shaped and focus on the business logic.
//
// We do this by hand here (no zod / joi) on purpose: at this scale, three
// small functions are clearer than pulling in a validation library. As soon
// as the schema gets non-trivial — nested objects, conditional fields,
// reused shapes — swap to zod and put the schemas next to the model.

export function validateNewComment(req, res, next) {
  const { text } = req.body ?? {};

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

  // Hand the cleaned value back so the route uses the trimmed form.
  req.body.text = trimmed;
  next();
}

// Mongoose ObjectId is a 24-character hex string. Catching this early avoids
// a CastError from the database layer and gives a clearer message.
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
