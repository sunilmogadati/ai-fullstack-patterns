// Centralized error handler.
//
// Express identifies an error-handling middleware by its four-argument
// signature: (err, req, res, next). Any error passed to next(err) from
// anywhere — sync or async — lands here.
//
// Why one handler instead of try/catch in every route:
//   - One place to decide the response shape. Every error looks the same
//     to the client, which makes the client code trivial.
//   - One place to add logging, metrics, redaction. Add it once; everything
//     benefits.
//   - Routes stay focused on the happy path. They can `throw` (or pass to
//     next()) and trust this middleware to do the right thing.

export function errorHandler(err, req, res, next) {
  // status precedence:
  //   1. Explicit err.status set by upstream code (e.g., 404 from the
  //      missing-route middleware, 400 from validate.js).
  //   2. Mongoose ValidationError -> 400 (the request was shaped wrong).
  //   3. Mongoose CastError -> 400 (bad ObjectId, etc).
  //   4. Anything else -> 500 (unexpected; do not leak details).
  let status = err.status ?? 500;
  let message = err.message ?? "Internal server error";

  if (err.name === "ValidationError") {
    status = 400;
    // Surface the most specific message from Mongoose's nested errors.
    const fieldErrors = Object.values(err.errors ?? {}).map((e) => e.message);
    message = fieldErrors.join("; ") || message;
  } else if (err.name === "CastError") {
    status = 400;
    message = `invalid ${err.path}: ${err.value}`;
  }

  // Log full detail server-side; send a clean shape to the client.
  // In production you would replace console with a real logger (pino, winston)
  // and add request-id correlation here.
  if (status >= 500) {
    console.error(`[${req.method} ${req.path}] ${err.stack || err}`);
  } else {
    console.warn(`[${req.method} ${req.path}] ${status} ${message}`);
  }

  res.status(status).json({
    error: {
      status,
      message,
    },
  });
}
