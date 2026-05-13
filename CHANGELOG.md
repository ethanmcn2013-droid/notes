# Signal Notes · Changelog

## 2026-05-13 · Suite design-system v1 · The dot learns to settle (notebook stays warm)

Fifth and final product across the suite design-system line.

**The wordmark dot learns to settle.** Notes's gesture swapped from
the **caret blink** (sharp on/off, 1.1s) to **M·05 settle — a slow
breath, scales 0.92→1.05 with a faint opacity drift every 3.2s.**
The slowest motion in the system. A thought arriving. The prior caret
blink belonged to capture itself, not the brand — moving it into the
notebook chrome where it actually lives.

**What stays.** Notes's locked notebook aesthetic — warm-cream paper
`#fffefa`, off-white background `#f7f8f2`, ink `#161815`, accent
`#335f54` (deep green), accent-2 `#b4863f` (mustard), Inter as body
register. All of it intact, per the 2026-05-10 feedback that confirmed
the green/mustard/Inter palette as the deliberate notebook voice.
Notes is the one product whose surface diverges from the suite's
white-paper / Geist register — the wordmark is the seam that ties
it back. The wordmark stays in suite-grammar (Geist 500 + indigo dot
+ settle); the notebook itself stays warm.

**No token swap.** Unlike Studio, Tasks, Roadmap, Analytics, Notes
keeps `--color-bg`, `--color-paper`, `--color-ink` exactly as they
are. The semantic-token shift (paper → pure white, ink → `#111111`)
is a suite-spec rule for the four products whose surface IS the suite
register; Notes's notebook is intentionally outside that register.

**Suite rollout complete.** Five products, five wordmarks, five
motions, one indigo. Each one paused for spot-check. The full design
system is live in `globals.css` files across the suite, downloadable
from `signalstudio.ie/brand`, and applied wordmark-by-wordmark.

## 2026-05-13 · Suite review · the demo finally tells the truth

### Two contract violations, one static page eating a React route.

`PRODUCT.md` is the lock. The marketing demo wasn't reading it.

§4 says no views. The demo morphed mid-loop from Stream to a
Tags view. §7 says no taxonomy. Every note rendered #tag chips.
§11 says deliberate two-step extraction — Draft action → review
the wording → Send. The demo did a long-press → "Promote to
Tasks" menu → one-tap promote, which is the auto-detect ergonomic
PRODUCT.md explicitly refuses.

All four offending components deleted: `view-toggle.tsx`,
`tags-view.tsx`, `promote-menu.tsx`, `tasks-edge.tsx`. The demo
is now capture × 3 → search → reset. Cleaner, smaller, and
matches what the product actually does.

The extract-to-Tasks beat used to be the closing punch. It'll
return — but designed against the shipped Notebook UX (Draft
action → review → send), not carried over from a scaffold that
mismatched the contract from day one. Calling that out so it
doesn't get rebuilt the old way.

### `CaptureEntry.tags` retired.

The optional `tags?: string[]` field on the demo's data type was
the surface the violation rested on. Removed from the type, and
all `tags: [...]` entries in `domains.ts` deleted. If a future
cycle wants to reintroduce tags somewhere, it has to do so
deliberately — the type system stops you from doing it by accident
now.

### The `startup` audience pack, retired.

"Investor question: what's the moat? Need a sharper answer."
"SOC 2 auditor confirmed for April 1." "Tom referral — introduce
to fintech founder Y this week." That was a pack we shipped on
the demo. PRODUCT.md §2 lists the audience archetypes Notes
serves: planners, contractors, teachers, small-biz owners,
freelance designers. Tech-bro register isn't on the list.

Replaced with `freelance` — a designer keeping the brief, the
brand decision, and the thing the client said in passing. Three
captures: a homepage hero deadline, a print-export package, a
Q1 invoice that's late. Voice register matches the rest of the
suite.

### The wedding-planning page existed twice.

`public/wedding-planning/index.html` was a 366-line static file
with its own 430-line `public/styles.css`. `src/app/wedding-
planning/page.tsx` was a 328-line React server component. In
Next, files in `public/` win — the React route was dead, and the
two stylesheets were already drifting. Deleted both static files;
the proxy public-route entries were already correct.

### Hygiene.

Duplicate `package-lock.json` deleted (pnpm-only).

The Plan 4.2 memory entry that claimed Sentry PII scrubbing
covered the suite was amended — Notes has no Sentry init.
When it gets one, it'll mirror the Tasks pattern shipped today.

## 2026-05-12 (latest +2)

### Avatar dropdown gained the siblings — second jump path landed.

The Clerk UserButton in the suitebar now lists "Open Tasks", "Open
Roadmap", "Open Analytics" above the Manage account / Sign out rows.
Each opens in a new tab. Notes doesn't list itself.

Same gesture as Tasks/Roadmap/Analytics this turn — second route to
the same destinations the launcher popover already covers, sized
for the discovery profile of users who reach for "settings" rather
than the breadcrumb. The wrapper preserves the existing h-7 avatar
size that matches Notes's smaller suitebar register.

Implementation: thin client wrapper `src/components/user-button-
with-suite.tsx` around Clerk's `<UserButton.MenuItems>` +
`<UserButton.Link>` API.

## 2026-05-12 (latest +1)

### The breadcrumb learned to open — suite launcher landed.

Yesterday's `signal studio. /` breadcrumb prefix was a hard anchor
to the umbrella — click it, leave. Today it's a click-to-open
popover listing all four products (tasks, roadmap, notes,
analytics) with their one-word taglines. Notes shows de-emphasised
with a "HERE" tag; the other three open in a new tab. Footer row
goes to signalstudio.ie.

The launcher landed on three Notes surfaces simultaneously: the
homepage suitebar, the `/app` notebook chrome, and the
`/wedding-planning` worked example. The notebook's warm cream +
mustard aesthetic stays on this side of the popover; the popover
itself uses the cleaner cream paper background so it reads as
suite chrome rather than notebook chrome. Inter font is
inherited because Notes is locked to Inter (per
`feedback_notes_aesthetic` — the green/mustard/Inter system stays).

Also new this turn: `src/lib/product-urls.ts` was created (Notes
was the only product without it — the four URLs were hard-coded in
the homepage breadcrumb). Now the suite-launcher and any future
cross-product surface have one place to read from. Env-var
overrides in place (`NEXT_PUBLIC_*_URL`) so deploys can point at
preview URLs without code edits.

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
