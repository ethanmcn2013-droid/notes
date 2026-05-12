# Signal Notes · Changelog

## 2026-05-12 (latest)

### Suite chrome consolidated — one bar, breadcrumb prefix.

The Notes suitebar was the odd one out — splitting left/right with
no active state on "notes" even when sitting on notes.signalstudio.ie.
Replaced suite-wide with the breadcrumb pattern: small "signal
studio. /" back-link, then the "notes." wordmark, all on one row.
Same treatment applied to /app and /wedding-planning. The notebook
aesthetic (warm cream, mustard accent, Inter) is untouched — only
the chrome above it changed. See the umbrella changelog for the
dissent captured inside the decision.

## 2026-05-12 (later still)

### Cycle 9.4b second half · the cross-repo edge is real.

The drafted action no longer sits in Notes labeled "pending Tasks
send" forever — it actually goes. The Send to Tasks button on the
drafted block calls `sendExtractToTasks` which hits the new
`POST /api/notes-extract` route on `tasks.signalstudio.ie`. The
returned taskId persists to the note's `promoted_task_id`, and the
drafted block flips to "Sent to [workspace name]" with an Open in
Tasks link that deep-links to the board.

Auth: shared bearer secret `NOTES_TO_TASKS_SECRET` (server-only,
both sides) + the user's Clerk userId in the body. First-party
service-to-service pattern; documenting clearly that this can evolve
to Clerk session-token forwarding when the deploy environment
supports it. Threat model: external attackers, not first-party
products.

Idempotency: Tasks keys on `(userId, noteId)` via a new
`source_note_id` column on the tasks table. A repeat Send-to-Tasks
returns the existing task instead of creating a duplicate — Notes
retries are safe.

Privacy guardrail: only `extract_body` crosses the boundary. The
raw note body never leaves Notes. The created task title = the
extract body verbatim, with a small description "Drafted from a
private note in Signal Notes." No note metadata travels.

Workspace selection: the user's first workspace membership wins.
The response carries the workspace name so the drafted block reads
"Sent to [Wedding planning]", not the abstract "Sent to Tasks".

What's needed to deploy:
- ALTER TABLE notes ADD COLUMN extract_body TEXT (from earlier today)
- ALTER TABLE tasks ADD COLUMN source_note_id TEXT (new today)
- NOTES_TO_TASKS_SECRET env var on both Notes and Tasks (Vercel)

## 2026-05-12 (later)

### Cycle 9.4b · the Draft action gesture lands real.

The "Promote to Tasks · arrives next cycle" placeholder in the open
note's head is gone. In its place: a real Draft action button that
opens a small deliberate-authoring input. The user types the action
wording themselves — Notes refuses auto-detection per PRODUCT.md §8
locked refusal. Saved actions sit in a brand-tinted block below the
note body labeled "Action drafted · pending Tasks send". The note
row gets the indigo dot. Edit and Remove sit on the drafted block.

Schema gained `extract_body` (nullable text) on the notes table.
PRODUCT.md §6 schema definition updated. Production Turso ALTER TABLE
is an operator action (Ethan, via Turso CLI) — code ships ready.

What's NOT in this cycle: the cross-repo write to Tasks. That's the
second half of 9.4b and is gated on the contract design with Tasks's
write surface. Until it lands, drafted actions live in Notes only,
labeled honestly as pending. Closing the gesture-half now means the
venue walkthrough no longer hand-waves at the four-layer loop's
Notes → Tasks edge — the extraction is real; the cross-repo write
ships next cycle.

Privacy guardrails tightened: schema comment reinforces that
extract_body is the only thing that ever leaves Notes (creator-
authored, deliberate). Raw note bodies stay private by design.

## 2026-05-12

### Suite review patch — the wedding-planning door, and the button that was lying.

Two small fixes against the suite review the same day Cycle 11.5
shipped. Both were the kind of thing that's easy to miss until
someone follows a link.

Notes had a hero CTA that read "See a worked example" and pointed
at `/wedding-planning`. There was no file at that path. A first-time
visitor tapping the only demo link in the hero got a 404. The Studio
weddings page also linked to it. The Analytics wedding-planning page
linked to it. Three surfaces, one missing route. Fixed by scaffolding
a static seeded venue-meeting note — a planner sitting in her car
after a Sunday-evening walkthrough, writing down what was said, what
was decided, what still needs an answer by Tuesday. A worked example,
clearly labeled as such, transitional until the T-2.2 cycle replaces
it with a real seeded note flowing through the four-layer loop.

The notebook also shipped with a Draft action button that has been
`disabled` since the day it was added, with a hover tooltip reading
"Approved action extraction ships next cycle." A button that doesn't
work, telling you when it might, is a broken promise rendered in the
UI. The fix wasn't to enable it — that's 9.4b's job. The fix was to
not render a disabled button at all. It's now a quiet mono caption
that says "Promote to Tasks · arrives next cycle." Same information,
no `cursor: not-allowed`, no false affordance.

### Cycle 11.5 shipped — cinematic notebook demo at the Tasks bar.

The homepage used to be hero copy + an anti-feature grid. The
notebook demo I shipped earlier in the day was a tight three-capture
+ search loop — fine as a starter, light against the rebuilt
Roadmap and Analytics demos. That's been replaced wholesale.

Hero is now Tasks-pattern: eyebrow + H1 ("Your private layer.
Capture the thought. Decide later.") + body + CTAs + status pip
("Demo is live · choose an audience to reseed") + an AudienceToggle
+ the cinematic notebook full-width below. Four audience packs
share the suite axis with Roadmap and Analytics: Wedding (default
per the locked GTM wedge), Building project, Product launch,
Startup plan. Each pack ships its own capture script (three notes
the demo types), per-capture placeholders that rotate, per-capture
tags, and a search query + matching capture for the search beat.

The demo runs a 17-scene loop. Three rapid captures with type-on
typing; each commits with a timestamp pip and tag chips that
stagger-land 120ms apart with a soft spring (the chips don't
appear all-at-once anymore — each one pops onto the note like the
user just tapped it). Then the search field focuses, types the
query, and the matched substring inside the hit note's body wraps
in a mustard `<mark>` while the surrounding ring lights up.

The whole stream then morphs to a Tags view — notes regrouped by
their `#tag` with each group fading in on a 60ms stagger. Holds.
Morphs back to Stream. The locked Notes → Tasks promote gesture
fires: a long-press ring grows around the search-hit note, the
PromoteMenu pops up beneath it (single item — "Promote to Tasks",
no other actions, no auto-detect, the discipline as the
differentiator). The menu item flashes brand-accent. The note's
body morphs into a flying card silhouette, slides 520px rightward
+ 40px down + scales to 0.6 + fades. The TasksEdge indicator on
the right margin pulses active during the flight. Reset.

The one-way promotion that lived only in copy ("nothing
auto-promotes") is now legible in motion: the user presses, the
card flies.

Stack: motion/react, DOM-measured note refs for the flight start
position, useReducedMotion guard collapses to a populated stream
with empty capture field. Notes keeps its locked product-surface
register (warm green / mustard / Inter) per the 2026-05-10 owner
decision.
