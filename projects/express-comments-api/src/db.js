// Mongoose connection.
//
// Kept in its own module so server.js does not have to know how Mongo gets
// connected, and so the connection logic can grow (replica set options,
// retry strategy, secondary connections) without server.js changing.

import mongoose from "mongoose";

export async function connectToDatabase() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error(
      "MONGODB_URI is not set. Copy .env.example to .env and fill it in."
    );
  }

  // Connection-level event handlers. These fire for the life of the process,
  // not just at startup, so we log them even after the initial connect.
  mongoose.connection.on("connected", () => {
    console.log(`mongoose connected to ${redactUri(uri)}`);
  });
  mongoose.connection.on("error", (err) => {
    console.error("mongoose connection error:", err.message);
  });
  mongoose.connection.on("disconnected", () => {
    console.warn("mongoose disconnected");
  });

  // The actual connect. mongoose.connect resolves once the initial connection
  // is established and rejects if it cannot connect within the timeout.
  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 5000,
  });
}

// Strip credentials before logging. A connection string may contain
// user:password@host. Never log raw URIs.
function redactUri(uri) {
  return uri.replace(/:\/\/([^:]+):([^@]+)@/, "://$1:***@");
}
