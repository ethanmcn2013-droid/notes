# Notes hero lab

A review-only showroom for Signal Notes homepage directions. The route is built
with the app and protected by the normal product access layer, but it is not
linked from the public marketing surface.

The feature branch homepage currently uses **The Notebook**. Lab work does not
replace that hero until an operator-approved direction wins a rendered review.

## Open the room

```bash
cd notes
npm run dev
```

- `/lab` lists all seven directions.
- `/lab/<slug>` shows one direction on a clean field.
- Keys **1-7** jump between directions.
- The visible **Replay** control, or **R**, restarts the intro.

## Operator review pair

| Order | Slug | Direction | Product proof |
|---|---|---|---|
| 1 | `before-it-leaves` | **Before It Leaves** | The notebook is fixed from frame one. A thought moves into the live caret, is caught, and joins the private stream in under a second. A visible approval sends only its action to Signal Tasks. The desktop crossing becomes a vertical crossing on mobile rather than disappearing. Rest lands at roughly 3.2 seconds. |
| 2 | `three-seconds` | **Three Seconds** | A literal three-second rail runs inside the notebook. One thought types and is recorded at 1.8 seconds. A separate approval then sends its action to Signal Tasks. Rest lands just under four seconds. |

Both directions keep the Notes motion identity: **caret, capture, private
stream, deliberate extraction**. They borrow Signal's artifact-first playbook,
not its visual metaphor or its longer overture.

## Reference directions

| Slug | Direction | Role |
|---|---|---|
| `the-blank-line` | The Blank Line | Minimal caret-led counterpoint. |
| `the-notebook` | The Notebook | Current feature-branch homepage hero and full capture-to-commit story. |
| `notebook-first` | Notebook First | Literal product-surface direction. |
| `before-it-fades` | Before It Fades | Emotional remembered-versus-lost direction. |
| `the-crossing` | The Crossing | One-way extraction wildcard. |

## Motion and accessibility contract

- The semantic DOM and default CSS are the finished state.
- Intro motion exists only inside `prefers-reduced-motion: no-preference`.
- Reduced motion, SSR, and no-JS render the complete settled artifact directly.
- Animated duplicates are decorative; the settled notebook, note, task, proof,
  and CTA remain semantic.
- CTAs link to `/app` and provide visible keyboard focus.
- No lab option may remove its signature proof on mobile.
- Use suite tokens and `--ease-out` / `--ease-in-out`; do not add raw colors or
  undocumented easing curves.
- Transform and opacity carry movement. Do not leave `will-change` active after
  the film.

## Files

- `src/app/lab/layout.tsx` keeps the review field clean.
- `src/app/lab/page.tsx` renders the noindex index.
- `src/app/lab/[slug]/page.tsx` renders a registry direction.
- `src/components/lab/registry.tsx` owns order, labels, and descriptions.
- `src/components/lab/switcher.tsx` owns navigation and replay.
- `src/components/lab/option-*.tsx` contains each scoped direction.

## Verification

```bash
npm run typecheck
npm run ds:check
npm run build
```

Review both preferred directions at desktop and phone widths in their first
frame, capture beat, approval/crossing beat, and settled state. Also review the
settled state with reduced motion enabled.
