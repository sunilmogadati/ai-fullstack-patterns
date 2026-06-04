// Seed script.
//
// Creates a single "Bali Trip 2026" session with four members and a dozen
// realistic-looking ideas. Drops the existing data first so the seed is
// idempotent — running it twice gives you the same state.
//
// Usage: `npm run seed` (from the brainwave/ project root).

import "dotenv/config";
import mongoose from "mongoose";

import { connectToDatabase } from "./db.js";
import { Session } from "./models/Session.js";
import { Idea } from "./models/Idea.js";
import { AIOutput } from "./models/AIOutput.js";

const MEMBERS = ["Alex", "Jordan", "Sam", "Riley"];

// 12 sample ideas with a few likes pre-assigned so the AI summarize /
// prioritize / patterns endpoints have signal to work with.
const SAMPLE_IDEAS = [
  { author: "Alex", text: "Surf lessons at Padang Padang", likes: ["Jordan", "Sam"] },
  { author: "Jordan", text: "Visit Uluwatu Temple at sunset", likes: ["Alex"] },
  { author: "Sam", text: "Balinese cooking class in Ubud", likes: ["Alex", "Jordan", "Riley"] },
  { author: "Riley", text: "ATV trail tour through rice terraces", likes: [] },
  { author: "Alex", text: "Day trip to Nusa Penida for snorkeling", likes: ["Sam", "Riley"] },
  { author: "Jordan", text: "Yoga retreat morning in Canggu", likes: [] },
  { author: "Sam", text: "Try a local warung for nasi campur", likes: ["Alex", "Jordan", "Riley"] },
  { author: "Riley", text: "Sunrise hike up Mount Batur", likes: ["Alex", "Sam"] },
  { author: "Alex", text: "Spa afternoon — traditional Balinese massage", likes: ["Sam"] },
  { author: "Jordan", text: "Ubud Monkey Forest visit", likes: ["Riley"] },
  { author: "Sam", text: "Beach club day at Potato Head", likes: ["Alex"] },
  { author: "Riley", text: "Rent scooters and explore Sidemen valley", likes: ["Jordan", "Sam"] },
];

async function seed() {
  await connectToDatabase();

  // Idempotent — start clean each time.
  await Promise.all([Session.deleteMany({}), Idea.deleteMany({}), AIOutput.deleteMany({})]);
  console.log("cleared existing data");

  const session = await Session.create({
    name: "Bali Trip 2026",
    description: "Planning a week in Bali this fall. Drop ideas and like what speaks to you.",
    members: MEMBERS,
  });
  console.log(`created session: ${session.name} (${session.id})`);

  // Insert ideas in order, spacing out the createdAt timestamps so the
  // newest-first listing has a stable order. Not strictly necessary, but
  // makes the seeded data look organic instead of all batch-inserted.
  let baseTime = Date.now() - SAMPLE_IDEAS.length * 60 * 1000;
  for (const sample of SAMPLE_IDEAS) {
    const createdAt = new Date(baseTime);
    await Idea.create({
      sessionId: session._id,
      author: sample.author,
      text: sample.text,
      likes: sample.likes,
      createdAt,
      updatedAt: createdAt,
    });
    baseTime += 60 * 1000; // each idea one minute apart
  }
  console.log(`inserted ${SAMPLE_IDEAS.length} ideas`);

  console.log("");
  console.log("--- session details ---");
  console.log(`session id: ${session.id}`);
  console.log("");
  console.log("set this in your frontend or client/.env:");
  console.log(`VITE_SESSION_ID=${session.id}`);
  console.log("");

  await mongoose.connection.close();
  process.exit(0);
}

seed().catch((err) => {
  console.error("seed failed:", err);
  process.exit(1);
});
