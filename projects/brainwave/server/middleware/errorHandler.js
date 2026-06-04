// Centralized error handler.
//
// Express identifies an error-handling middleware by its four-argument
// signature: (err, req, res, next). Any error passed to next(err) from
// anywhere — sync or async — lands here.
//
// One handler per service. Every error gets the same response shape so
// the client never has to second-guess what the error payload looks like.

export function errorHandler(err, req, res, next) {
  let status = err.status ?? 500;
  let message = err.message ?? "Internal server error";

  if (err.name === "ValidationError") {
    status = 400;
    const fieldErrors = Object.values(err.errors ?? {}).map((e) => e.message);
    message = fieldErrors.join("; ") || message;
  } else if (err.name === "CastError") {
    status = 400;
    message = `invalid ${err.path}: ${err.value}`;
  }

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
