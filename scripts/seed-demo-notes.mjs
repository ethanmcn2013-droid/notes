/**
 * seed-demo-notes.mjs — insert real-feeling demo notes for recordings.
 *
 * E4 fix: the live DB had junk notes ("test", "test 2,0", "flights to
 * america 1a7") from development testing. This script inserts notes that
 * read like a real wedding planner or freelancer writing at 11pm —
 * specific, unguarded, not yet a task.
 *
 * Usage (from repo root):
 *   TURSO_DATABASE_URL=... TURSO_AUTH_TOKEN=... DEMO_USER_ID=user_xxx \
 *     node scripts/seed-demo-notes.mjs
 *
 * The DEMO_USER_ID must be a real Clerk user id in the target DB.
 * All existing notes for that user are left untouched — this only inserts,
 * never deletes.
 *
 * These notes are written in the voice of Niamh, a wedding planner at 11pm.
 * They are specific enough to feel real, unguarded enough to feel private.
 * They are NOT tasks yet — they are thoughts.
 */

import { createClient } from "@libsql/client";

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;
const userId = process.env.DEMO_USER_ID;

if (!url) { console.error("TURSO_DATABASE_URL is required"); process.exit(1); }
if (!userId) { console.error("DEMO_USER_ID is required"); process.exit(1); }

const client = createClient({ url, authToken });

function makeId() {
  return `n_${crypto.randomUUID().replace(/-/g, "")}`;
}

// Notes in placeholder-prose voice — specific, unguarded, 11pm energy.
// Mix of wedding planner + freelancer archetypes. None are tasks yet.
const DEMO_NOTES = [
  {
    body: "Glenmara called again about the marquee delivery slot. They want Friday afternoon but the florist is already there Friday morning and I can't have them crossing over. Need to find the middle hour that works for both without anyone knowing I'm improvising.",
    offsetMs: -1 * 60 * 60 * 1000, // 1h ago
  },
  {
    body: "Couple asked about a pianist for cocktail hour. I don't want to say no but the usual guy is already booked. Think there's someone from the conservatoire who does weddings — find that card.",
    offsetMs: -3 * 60 * 60 * 1000,
  },
  {
    body: "Reminder to self: the seating chart for table 9 is going to be awkward. The mother and the ex-sister-in-law haven't spoken in two years. No one told me this until tonight.",
    offsetMs: -6 * 60 * 60 * 1000,
  },
  {
    body: "Invoice 047 still unpaid. It's been 21 days. Send a friendly chase tomorrow — not the awkward chase, the one that sounds like admin, not desperation.",
    offsetMs: -24 * 60 * 60 * 1000,
  },
  {
    body: "Good call with the caterer today. They're willing to do the late-night chips and gravy as a separate kitchen run. The couple will love this but I'll confirm the cost before I mention it.",
    offsetMs: -2 * 24 * 60 * 60 * 1000,
  },
  {
    body: "Design client wants three more rounds after saying \"just make it a bit warmer\". I need to write a brief template that stops this from happening. The feedback loop is eating the margin.",
    offsetMs: -2.5 * 24 * 60 * 60 * 1000,
  },
  {
    body: "Something I keep forgetting: the venue's broadband cuts out between 6pm and 9pm. Any live slideshow or streaming needs to be on mobile data. Write this into the run-of-show template.",
    offsetMs: -4 * 24 * 60 * 60 * 1000,
  },
  {
    body: "The new couple signed. May wedding, 120 guests, coastal venue. I'm going to need the linen hire contact — the one with the linen that doesn't look like a hotel conference room.",
    offsetMs: -7 * 24 * 60 * 60 * 1000,
  },
];

const now = Date.now();

const rows = DEMO_NOTES.map(({ body, offsetMs }) => ({
  id: makeId(),
  userId,
  body,
  createdAt: now + offsetMs,
  updatedAt: now + offsetMs,
}));

console.log(`Inserting ${rows.length} demo notes for user ${userId}…`);

for (const row of rows) {
  await client.execute({
    sql: `INSERT INTO notes (id, user_id, body, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?)`,
    args: [row.id, row.userId, row.body, row.createdAt, row.updatedAt],
  });
  console.log(`  ✓ ${row.body.slice(0, 60)}…`);
}

console.log("Done.");
process.exit(0);
