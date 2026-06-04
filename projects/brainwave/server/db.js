// Mongoose connection. Same pattern as express-comments-api/src/db.js.
//
// Kept in its own module so server.js does not have to know how Mongo gets
// connected and so the connection logic can grow without server.js changing.

import mongoose from "mongoose";

export async function connectToDatabase() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error(
      "MONGODB_URI is not set. Copy .env.example to .env and fill it in."
    );
  }

  mongoose.connection.on("connected", () => {
    console.log(`mongoose connected to ${redactUri(uri)}`);
  });
  mongoose.connection.on("error", (err) => {
    console.error("mongoose connection error:", err.message);
  });
  mongoose.connection.on("disconnected", () => {
    console.warn("mongoose disconnected");
  });

  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 5000,
  });
}

function redactUri(uri) {
  return uri.replace(/:\/\/([^:]+):([^@]+)@/, "://$1:***@");
}
