# Signal Notes · the dispatch

Convention: BRAND.md §6.5. Entries before 2026-05-14 keep their
original shape; the new shape starts at the next cycle.

## 2026-07-02 · N·28 · tightens · Notes keeps its notebook, and the chrome holds still

**Notes' accepted footer and product-header chrome now sit on current main.** The footer follows the same suite frame and points to Studio's iOS status page, while the public, sign-in, sign-up, anatomy, and app shells use one Notes header component with the shared 56px sticky geometry. Notes keeps its notebook register inside that shell; the suite chrome no longer forks by page.

## 2026-07-01 · N·27 · ships · one keystroke and the line you just wrote is a task

**⌘Enter (Ctrl+Enter on Windows) now means one thing everywhere in the notebook: this becomes a task.** In the capture box, the chord saves the line and sends it to Tasks in the same stroke — write, press, done, no dialog. On a note row reached with j/k, the chord promotes that note. With a note open, it promotes the open note. All three paths ride the shipped direct-promote edge: the first line becomes the task title, the raw note body never leaves Notes, and promotion is deliberate by definition — the user pressed the chord (the never-auto-detect refusal holds untouched). The retired misfire toast had already told us readers reach for ⌘Enter; now the product answers. Optimistic temp ids never cross the boundary and in-flight rows can't double-fire. The capture hint teaches the chord in the same quiet line that teaches Enter and Esc, with the modifier label matching the reader's platform. Branch-pending via PR.

## 2026-06-14 · N·26 · ships · pick the line that becomes the task

**Shaping a note into a task now starts from the note's own words — pick a line instead of retyping it.** When you shape an extract, the note's distinct lines appear as one-tap prefills; choose the one that should become the action. And because the receiver now parses the wording, a date or `#tag` in it carries straight into Tasks as a due date and project — so the whole promote gesture sets structure inline without Notes ever growing a date or tag picker. The capture surface stays calm; the structure lives downstream. Branch-pending via PR.

## 2026-06-14 · N·25 · ships · speak a note when your hands are full

**Capture happens in life, not at a desk — now you can say a note out loud and it saves like any other.** A small mic affordance dictates into the existing capture field via the browser's voice API; it hides where unsupported, degrades quietly on a denied permission, and respects reduced motion. No new note type, no model framing — just voice into the same three-second capture. Branch-pending via PR #5.

## 2026-05-28 · N·21 · ships · the homepage speaks before you do

**The Notes marketing hero now types three product phrases in a loop below the wordmark — the dot rolls in, letters rise, the mark morphs into a caret, and a second voice types "Write it here first." / "Before it fades." / "Not everything needs a task." before deleting and beginning again.** The previous hero was the entry sequence only — the animated wordmark established the brand gesture and held, which proved the caret but said nothing about what the notebook is for. The new second act keeps the wordmark caret blinking throughout (brand anchor) while a larger Inter phrase types below the hairline rule; both carets are live simultaneously, which reads as the notebook already composing. The caption cross-fades from "a held thought, awaiting input" to "capture clarity." when the third phrase lands and holds for ten seconds. Three bugs fixed in the prototype pass that also corrected the existing hero: the hairline rule now runs full-bleed both sides (old approach stopped 310 px short of the right edge), impact ripples and ghost trails are anchored to the mark's resting position (they were firing at the composer's left edge due to `position:absolute` ignoring `align-self` in a flex container), and the voice caret hides between phrases so no orphaned cursor blinks in empty whitespace during inter-phrase pauses. `prefers-reduced-motion` skips to phrase three as the static final state — caret visible, caption resolved, no animation.

## 2026-05-22 · N·20 · tightens · the empty-state placeholder types itself in, rotates every thirty seconds

**The first thing you see on an empty notebook now writes itself in front of you — one of seven short on-brand lines, typed character by character with a soft cursor blink, then held for the rest of a thirty-second cycle before fading out and the next line begins.** The cross-fade rotation that used to flip lines every 5.2 seconds was correct but anonymous — the placeholder behaved like static copy that happened to swap. The typewriter reads as a quieter, more private gesture: the line is being thought, not displayed. The cadence stretches to thirty seconds per line because the placeholder is ambient, not announcement copy; the same seven lines now cycle in three and a half minutes instead of thirty seconds, so the surface stays calm. Settled-state users (eight or more notes captured) and `prefers-reduced-motion` users still see the existing single stable string with no rotation — both branches were preserved, the typewriter is opt-in via the same gate as the prior rotation. Per-line type-in duration scales with line length (50ms per character), and the settled hold is computed so the total cycle stays at thirty seconds regardless of which line is up. No CSS changes — the existing `.is-changing` fade-out class and the `.private-notes-empty-caret` blink animation both carry through.

## 2026-05-21 · N·19 · ships · close your account, install the notebook to your home screen

**Settings · Account is reachable from the avatar dropdown, with an irreversible delete that closes your Signal identity in one step; the notebook installs to a phone or desktop home screen with the green Notes tile.** Typing your email confirms the delete; the server purges every note you've captured and your per-user preferences, then asks the identity layer to close the account. There is no grace period; the action is final and visible before you commit to it. Installable add-to-home-screen ships a manifest carrying Notes' own paper canvas as the splash, an Apple touch icon with the notebook mark, and a green maskable Android tile so the install reads as a notebook on any phone. Required for Apple App Store submission later this summer.

## 2026-05-19 · N·18 · ships · the notebook chrome carries four visible pills

**The authed `/app` chrome now shows all four products as always-visible
pills instead of the hidden "signal studio." popover trigger.** The shared
canonical `SuiteSwitcher` replaces the launcher and the notes-mark
breadcrumb in the notebook chrome — the active pill is the
product-you-are-in indicator. It carries the umbrella anchor once, the
dot-morph jump, hover-prefetch and preconnect, byte-identical with the rest
of the suite; Notes's own aesthetic is untouched everywhere else. Build
clean; deployed to prod and verified (200 marketing, 307 app entry).

## 2026-05-17 · N·17 · tightens · Capture-by-email stops when the tier does

**Capture-by-email was checked once, when the address was handed
out, and never again. A workspace that lapsed to Free kept a live
forwarding address — mail still landed, notes still appeared, a
paid feature still working months after the payment stopped. The
pricing page promises the workspace "drops to Free" when it ends.
For this one feature, it didn't. Now it does.**

The inbound route resolves the address to a person, then asks the
same question the rest of the suite asks — is this person on
Workspace, right now — before it writes the note. If the answer is
no, the message is accepted and quietly dropped, the same silent
shape a stranger's mail gets, so nothing about who pays leaks back
to a sender. On a database blip the answer defaults to no: a brief
outage tightens the gate, never loosens it, because serving a paid
feature for free is the failure the brand can't afford. The check
was already written and centralised; this just calls it at the
moment that was missing.



**N·12 made the demo the real surface. It still didn't do
anything — a populated sheet and a search-dim loop, while the hero
above it said "write it down in three seconds" and the artifact
never showed the three seconds. Every other Signal demo performs;
this one sat still. It now plays the product's core act, capture,
in the product's own register: the quietest demo in the suite and
the most considered.**

The notebook rests, a thought arrives whole into the giant capture
field (settled — opacity and translateY, never typed-at-you), it
commits, and the matching row in the stream replays the product's
real `note-row-arrive` gesture. Then one calm search beat, then a
long rest. The stage is fixed: the stream's DOM length never
changes — the arrival is the shipped `.is-fresh` replay on an
existing row, not an insert — so nothing below the notebook ever
reflows. The N·11 "stop twitching the page" bar holds, and SSR /
no-JS / reduced-motion still render the full stream at rest, search
empty, count at rest, exactly the app at rest.

Two off-ecosystem tells went with it. The audience toggle was a
gradient-bevel-glow pill — the YC-SaaS aesthetic the suite refuses
(DESIGN.md §10) — re-skinned to the product's flat hairline
language with a solid-ink active marker, the same quiet register as
the hero CTA, so the page reads as one thing. The hero "live" pip
ran an invented pulse; it now breathes on the product's own M·05
*settle* rhythm — the actual brand gesture, not a stand-in. Copy
"choose an audience to reseed" → "choose whose week"; "reseed" was
product-team register. Typecheck and production build clean; `/`
prerenders static. Read this as: the demo no longer just looks like
Notes — it behaves like it.

## 2026-05-16 · N·12 · corrects · The demo stops being a different app

**Every other Signal product shows you the product. The Notes
homepage showed you something else — a grey rounded card, a small
rounded capture pill, gapped note cards, a search pill at the
bottom. The actual notebook at /app is a sharp-cornered warm-paper
sheet with a giant capture field and a ruled stream. The demo had
quietly drifted into its own UI and read as a foreign app. Fixed
by deleting the invented chrome and rendering the real one.**

The marketing demo now renders the exact `globals.css` classes the
product ships — `.notebook`, `.notebook-top`, `.wordmark`,
`.capture`, `.stream-head`, `.note-row` — and reuses the app's own
`PrivateNotesEmptyState`, so the capture placeholder is
pixel-identical to first-run. Same warm paper, same sharp corners,
same signature giant type, same ruled rows with timestamps. The
four foreign card components (`capture-field`, `note-stream`,
`note-pip`, `caret`) and their `types` module are gone — five
files lighter, nothing dead left behind. The calm search beat is
carried forward intact: it dims non-matches and lights the hit
inside the real chrome, never collapsing the list, so the
no-layout-shift and content-first properties N·11 fought for still
hold. Verified in raw SSR HTML and a reduced-motion render.

Same pass closed a real defect: `/app` returned a 500 to anyone
without a session. The page called `requireUser()`, which throws
`UnauthorizedError`, with nothing catching it or redirecting — and
the proxy middleware bypasses entirely in keyless mode. It now
checks the Clerk session first and redirects to `/sign-in`. Fail
open to the sign-in screen, never to a stack trace — verified:
`/app` now answers 307 → `/sign-in` instead of 500.

## 2026-05-15 · N·11 · tightens · The homepage stops twitching every twelve seconds

**Applying the motion bar instead of hiding behind "restraint"
found a real defect: the demo card looped empty → three notes →
collapse every ~12s, and every cycle it shoved the anti-feature
section and footer up and down the page. The page now holds
still.**

Two parts. The card now reserves the height of its fullest state,
so the loop animates inside a stable frame and never moves the
document — verified at the pixel level across loop phases on the
deployed page: the blocks below the card sit at an identical
position whether the demo is empty or full. And the capture story
— boot, three notes typed and committed — now plays once on
landing, then the stream stays populated and only a calm search
highlight repeats with a long quiet rest. The product's whole
point still happens for a first viewer; it just stops re-staging
itself forever. Big motion once, then stillness.

That fix surfaced a deeper one, taken the same day (N·11b): the
demo was a JS-built timeline, so a crawler or no-JS visitor saw an
empty card — content hidden behind motion, which the brand bar
forbids. The auto-typing capture story is now removed entirely.
The notebook server-renders populated for the chosen audience —
verified in the raw HTML, no JavaScript: the three dated notes,
the capture field, the search row, all there. The calm search
highlight is the only motion now, layered on top as progressive
enhancement; reduced-motion and no-JS keep the full notebook. A
subtraction that served the mission: Notes does not need an
animation performing capture at the visitor. ~60 lines lighter,
zero layout shift, crawler-safe, and verified on desktop and
mobile at 390px.

## 2026-05-15 · N·10 · tightens · The worked-example links stop leading nowhere

**A self-audit caught a real demo-vs-reality defect I had shipped:
the wedding note's cross-product links resolve, but the builder,
teacher, and freelancer notes pointed at per-job routes that
return 404. A page that promises "here is where this fits" and
then 404s is exactly the gap the brand refuses.**

The wedding example links to a real, built four-layer loop —
those stay. The three newer examples were mirroring that pattern
with routes that were never built. Their "Where this fits" links
now point at the real product surfaces — Signal Tasks, Roadmap,
and Analytics — every one verified to return 200 from the live
page after deploy. The explanation in each example's own words is
unchanged; only the dead destinations moved.

The lesson is the cheap one: build verification catches none of
this. Only following the link on the deployed page does.

## 2026-05-15 · N·9 · tightens · The homepage shows you your own example

**The hero's "see an example" button only ever opened the wedding
note. A builder or a teacher on the homepage had no equal door to
the example that was actually theirs.**

The homepage already has an audience toggle — wedding, building,
teaching, freelance — driving the live demo. The example button
now follows it. Pick "Teaching week" and the button becomes "See
a teaching example" and opens the teacher's note. No new menu, no
extra surface; the control that was already there became the
door to all four.

## 2026-05-15 · N·8 · ships · The worked examples now cover everyone Notes is for

**The demo lets a visitor toggle between a wedding planner, a
contractor, a teacher, and a freelancer. Until now only three of
those four could click through to a real, deep example of what
that actually looks like. All four can now.**

`/freelance-studio` is the last one: a designer carrying three
client jobs, writing down the status they kept holding in their
head. The client who asked for three hero options in passing and
not in the email. The invoice eleven days unpaid. The scope creep
that should be priced, not absorbed. The Q1 invoice they will not
send themselves — "losing my own money politely." That is the
real freelance failure mode, in a freelancer's own voice, and it
is now proof, not a three-line placeholder.

Four archetypes, four worked examples, one depth, one shape, all
wired to each other through one source of truth. The asymmetry
N·5 named out loud and refused to rush is closed — across four
cycles, not crammed into one.

What is honestly still not world-class, named not buried: the
homepage hero's "See a worked example" still points only at the
wedding note; the other three are reached by the demo toggle's
context, the cross-links, and search, not by an equal door on
the homepage. That is a homepage information-architecture
decision, not a content gap, and it is the next move — a
ux-director call worth making deliberately rather than bolting a
four-way menu onto the hero under time pressure.

## 2026-05-15 · N·7 · ships · A teacher's Friday note, and the examples become a set

**Two of the four demo archetypes now had deep worked examples;
two did not. A teacher toggling the demo to "Teaching week" and
wanting to see what that actually looks like still hit a
three-line placeholder. There is now a teacher's note at the same
depth as the wedding and the builder — and the examples wire
themselves together.**

`/teaching-week` is a teacher's note written in the empty
classroom after the last bell on a Friday: who needs a call
(Daniel's reading went backwards, Amara's been quiet), what she
decided (move the assessment, reports five a night), what is
still open (the SEN paperwork that cannot slip a third Friday,
the trip form). Her register, not a project manager's — the
emotional-intelligence beats are the point, because that is how a
teacher actually writes this down.

The three examples now share one source of truth. Adding a fourth
no longer means editing every existing page's reciprocal link by
hand; each page declares which one it is and the rest wire
themselves. The hand-rolled single links from N·6 are gone.

The N·6 Clerk-trap lesson was applied, not relearned: the new
public route went into the proxy in the same change, and the live
URL returned 200 on the first deploy.

This closes three of the four. The freelance archetype is still
on a three-line demo pack — named here, not buried, and the next
move.

## 2026-05-15 · N·6 · ships · A builder's site note joins the worked examples

**Until now the only deep proof of what a Notes note actually looks
like was a wedding planner's venue note. A builder, a contractor, a
freelancer landing on the site saw a wedding. There is now a second
worked example at the same depth — a contractor's tailgate site
note — so the proof matches more than one kind of work.**

N·5 named this gap out loud and refused to rush it onto the tail of
a copy cycle: `/wedding-planning` was ~330 lines of crafted, dated,
in-voice content; the other archetypes had three-line demo packs.
`/building-project` closes it. A contractor walks the Maple Road
extension at week six and writes what he found, what he decided,
and the three things still waiting on other people — the windows,
the electrician, the client's tile choice. Real dates, real money,
the builder's own register, no software vocabulary. Same chrome,
same ribbon, same article styling, same "Where this fits" suite
seam as the wedding note, so the two read as one product. A
reciprocal "Another example" link now wires them together.

A latent bug surfaced while building it: the wedding note's
headline carried an unitless `maxWidth: 18`, which React renders
as 18 pixels — the headline was being clamped to roughly one
character per line on the live page. Corrected to a character
measure. The kind of thing only a real look at the live URL
catches; build and typecheck were always green.

Same-cycle: the new page first shipped behind the Clerk gate —
307 to sign-in — because new public marketing routes are not
public by default in the proxy. Caught on the live URL, added to
the public matcher, redeployed, verified 200. A warning comment
now sits in the proxy so the next new public page doesn't repeat
it.

## 2026-05-15 · N·5 · reads · Notes stops talking like a tech tool

**The first line every visitor read was "Your private layer." — and
"layer" is a word a wedding planner, a tradesperson, or a teacher
would never say. The homepage now opens in their language, and the
demo no longer drops them into a software team's standup.**

The hero H1 was "Your private layer. Capture the thought. Decide
later." It is now "Not everything is ready for the room. Write it
here first." — the same sentence the empty notebook already says
to you when you open it, so the marketing page and the product
finally speak with one voice. The sub-line carries the two
promises the old line buried: write it down in three seconds,
decide later what becomes work.

The demo audience toggle had a pack called "Product launch" whose
notes read "PDF exports must ship before launch" and "filter by
tag inside search results page." That is the exact register the
"startup" pack was retired for back in May — a software team
talking to itself, shown to people who are explicitly not that.
It is gone. In its place: a teacher's week. Two parent calls
before Friday. The photocopier jammed again. Cover needed
Thursday for a dentist appointment. All four demo packs now show
a real person from the audience the product is for — a planner, a
contractor, a teacher, a freelance designer.

The word "layer" is also gone from the page metadata and the
brand handbook's record of the canonical Notes headline.

Same-cycle follow-on: the homepage footer was a single mono
line that dead-ended a first-time visitor — the only way to the
rest of the suite was a faint launcher dropdown most non-tech
visitors never click. It now carries a restrained suite seam in
Notes's own warm register: Tasks, Roadmap, and Analytics as
plain links with one-line plain-English notes (Run / Show / Read
the work), the "A Signal Studio product." anchor line, the
contact address, and the locked suite tagline. Server-rendered
plain anchors — no JavaScript, crawler-safe, no card chrome
(PRODUCT.md §9 visual budget held). The growth loop now has a
visible door instead of a hidden one.

## 2026-05-15 · N·4 · hardens · the held-back security cycle

**The four things N·3 explicitly deferred are now shipped — the
inbound mail endpoint has a body cap and a throttle, the CSP is
enforced not observed, and the capture slug is unguessable.** A
second code review ran the full six dimensions; four MAJORs and
six smaller findings closed in one pass. Build and typecheck
clean, net +244/−98.

`/api/capture/email` was a validated-bearer endpoint with no
brakes — once Resend Inbound is wired and the secret is shared
with a third party, a replayed request could `INSERT` notes
without limit. It now rejects payloads over 256KB on
`content-length` before parsing and throttles to 30 inserts per
minute per IP+slug. In-memory, so it's per-instance — real
fan-out protection still wants Upstash, but the v1 shape is
covered.

The Content-Security-Policy flipped from `Report-Only` to
enforced. Clerk's frontend API, challenge frames, and accounts
endpoints were added to `script-`, `connect-`, and `frame-src`
so the auth UI keeps working under the stricter header. The
capture slug moved off `Math.random().toString(36)` — whose
comment claimed ~41 bits it didn't reliably deliver — to
`crypto.randomBytes(6)` hex: 48 honest bits, and the rotate path
now retries on a unique-collision the same way create always did.

Smaller seams: the client-side search fallback now strips
diacritics the same way the FTS5 `remove_diacritics=2` tokenizer
does, so accented queries stop flickering between the local
guess and the server result. The FTS5 sanitizer drops `*`, `^`,
and standalone boolean keywords. `requireUser` throws a tagged
`UnauthorizedError` that the client renders as "Your session
expired — sign in again" instead of a raw string. Pending
deletes moved from one shared ref to a per-note map, so a fast
second delete no longer force-commits the first mid-undo.
`revalidatePath` is off the create/extract paths the client
already reconciles. `TASKS_API_URL` no longer silently defaults
to prod outside `VERCEL_ENV=production`. Optimistic ids use
`crypto.randomUUID`; the error color is a token; relative
timestamps tick in isolation instead of re-rendering the
notebook every minute.

Follow-on in the same cycle: the `createNote` server action and
the capture textarea now share a 10,000-character ceiling — a
note is a thought, not a document. The trust-boundary check
lives in the action (the textarea `maxLength` is the courtesy
copy); the inbound-email path enforces the same ceiling by
truncating with a `[truncated]` marker rather than rejecting,
since the sender never sees an error response. The constant is
mirrored by hand on both sides because a `"use server"` module
may only export async functions.

CSP de-risked before the prod push: the publishable key isn't in
the repo, so the exact Clerk prod Frontend API CNAME can't be
read at build time. Rather than guess `clerk.signalstudio.ie`,
the allowlist now uses `https://*.signalstudio.ie` — per CSP3 a
leading `*` matches any subdomain depth, so whatever label the
Clerk dashboard sets is covered without a deploy-time guess.
Aligned to Clerk's documented set while here: added
`clerk-telemetry.com` to connect-src and kept Turnstile on
script/frame-src; `img.clerk.com` was already covered by the
existing `https:` img-src. The "unforeseen Clerk subdomain"
risk is now closed by construction rather than by watching.

Held back to an operator decision: `TASKS_API_URL` set on the
Vercel preview env, or the extract-to-Tasks edge hard-fails
there by design. Still owed in code: the HMAC-signed-webhook
migration for inbound-mail replay protection (gated behind
operator Resend setup, so not yet urgent).

## 2026-05-15 · N·3 · tightens · post-audit integrity pass

**Six load-bearing fixes after a full six-dimension audit — the
M·05 settle gesture is no longer silently broken on the product
surface, the banned framing is off the homepage, the suite seam
matches.** Audit ran across docs, copy, app, UI, UX, and code;
~35 findings logged, six shipped in this cycle.

The wordmark `.dot` in `globals.css` was referencing a keyframe
called `notes-caret` that doesn't exist — falling through to no
animation. The seam between Notes (warm-notebook, Inter) and the
suite (paper-white, Geist) is supposed to be carried by the
indigo dot and its M·05 settle breath; that gesture has been off
the in-product wordmark for an unknown number of cycles. Restored
to match the marketing-nav wordmark — 3.2s breath, scale
0.92→1.05, cubic-bezier(.16, 1, .3, 1).

`--color-signal` was `#4b57c9` (a darker, more violet indigo);
the rest of the suite uses `#4f46e5`. The note-dot, extract-input
border, and draft-button hover all pull from this token. Visible
drift side-by-side with the wordmark dot. Locked to `#4f46e5`.

Homepage anti-feature grid had `"Not a second brain."` as a
refutation label — the banned framing planted the association
even in negation. Reframed to `"Not a filing system."`. Suitebar
`min-height` raised from 42px to 44px (mobile pass spec).
`suite-launcher.tsx` was referencing `var(--color-border)` which
doesn't exist in the token system — popover divider was rendering
transparent. Swapped to `--color-line`. PRODUCT.md §9 wordmark
gesture and §10 implementation map updated (FTS5, extract edge,
and email-capture-code-path all marked shipped, not deferred).

Held back to a separate cycle: CSP promotion from Report-Only to
enforced, FTS5 sanitizer hardening, server-side body-length cap
on `createNote`, inbound webhook replay protection. Each one
needs its own deliberation. Also held back: demo restoration of
the extraction beat (Plan 10 work), wedding-planning page
re-token sweep.

## 2026-05-14 · N·2 · ships · atlas drift-trigger wires into notes commits

**Notes commits now flag the umbrella's atlas when a referenced
file changes.** A pre-commit hook in `.githooks/` runs a node
script against the staged file list, resolves any atlas references
that point at this repo, and writes drift into the studio repo's
canonical sidecar. The hook never blocks — drift is a signal, not
a gate. Activation is one `git config core.hooksPath .githooks`.

This is the second sign-off criterion in the spec: editing
`src/server/actions/notes.ts` flags both
`log-cycle-cross-repo-writer` and `turso-databases-and-reads`.
Verified end-to-end. Auto-stage is gated on
`REPO_ROOT === STUDIO_ROOT`, so commits here leave studio's sidecar
uncommitted for the studio operator. Full spec lives at
`~/Projects/personal/studio/docs/ATLAS_DRIFT_TRIGGER.md`.

## 2026-05-14 · N·1 · tightens · the notebook reads on a phone

**Notes gets the same mobile correctness the umbrella, Tasks,
Roadmap, and Analytics just shipped. Horizontal scroll guard, mobile
leading for `.product-h1`, Clerk sign-up tap targets at 48px,
viewport-fit for notch hardware. The green-and-mustard notebook
aesthetic stays exactly as it is — only sizing changes.**

The home hero "Your private layer. Capture the messy parts." had a
descender clipping into the next row at mobile sizes — `.product-h1`
uses `line-height: 0.92` for tight desktop register, which collapses
once `clamp()` shrinks the font to ~41px on a phone. A `@media
(max-width: 640px)` block lifts it to 1.02. Tight enough to keep the
intentional Notes typography register, loose enough to breathe.

`html { overflow-x: clip }` + `body { overflow-x: clip }` is added
as a belt-and-braces guard. No content overflows today, but the
guard prevents any future widget from scrolling the body
horizontally.

Clerk got the mobile correctness treatment without touching the
palette. `formFieldInput` gains `!min-h-[48px] !text-[16px]` (the
16px prevents iOS Safari's auto-zoom on focus); `formButtonPrimary`
keeps its `bg-[#161815]` ink-on-paper but gains `!min-h-[48px]`;
`socialButtonsBlockButton` also `!min-h-[48px]`. The notebook's
warmth is unchanged — buttons and inputs just hit the WCAG 2.5.5
tap-target floor now.

Viewport export gains `viewportFit: "cover"` so notch hardware can
honour `env(safe-area-inset-*)`. Per `feedback_notes_aesthetic`, the
green/mustard/Inter aesthetic is intentional and locked — this
cycle does not touch it.

Typecheck clean.


## 2026-05-14 · FTS5 search · email-to-capture · entitlement awareness

Three things landed at once.

**FTS5 search** replaces the client-side substring filter. A
`notes_fts` virtual table mirrors `notes(id, user_id, body)` via
three INSERT/UPDATE/DELETE triggers; the search action runs prefix-
matching for single-token queries and FTS5's implicit AND for
multi-token. 180ms debounce + stale-result guard via a seq counter
so fast typing never lets an earlier query stomp a later one. The
client still falls back to substring filter during the first
round-trip so the box feels instant. Budget per PRODUCT.md §9:
200ms p99; FTS5 on Turso sits well below.

**Email-to-capture** ships the data path. `user_preferences` schema
+ migration applied to prod Turso. `getCaptureEmail()` lazy-allocates
a per-user `capture-XXXXXXXX@notes.signalstudio.ie` address on first
call; `regenerateCaptureSlug()` rotates if leaked. `POST
/api/capture/email` accepts a normalised provider payload
(`{to, from, subject, text}`), parses the slug, maps to a user,
writes a note. Bearer-auth via `NOTES_CAPTURE_INBOUND_SECRET` with
constant-time compare. Until Resend Inbound + DNS is configured the
endpoint 401s — that's the right shape.

**CaptureEmailRow** is the visible surface beneath the stream.
Workspace+ users see their address with click-to-copy; free users
see a quiet upgrade nudge; and crucially, if the inbound provider
isn't yet wired (`NOTES_CAPTURE_INBOUND_SECRET` unset), the row
hides entirely. We refuse to show an address that silently drops
mail.

Plus a forward-compat helper at `src/server/entitlements.ts`
(`notesProEnabled`) — the central gate point for future Pro features
so we don't sprinkle `resolveEntitlement` calls across actions.

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
