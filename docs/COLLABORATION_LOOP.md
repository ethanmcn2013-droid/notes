# Signal Notes Collaboration Loop

Signal Notes owns the context layer of the Signal Studio collaboration loop.

Core question:

What was captured, decided, or learned?

## Role In The Ecosystem

Notes turns meetings, calls, thoughts, and planning context into usable work.

It should help creators and collaborators understand:

- what was said
- what was decided
- what is unresolved
- what became an action
- what risk or question needs attention

## Growth Loop Responsibility

Notes gives a shared workspace its memory. It should make collaboration feel serious without making it complicated.

It supports this loop:

Workspace created -> collaborators invited -> work becomes clearer -> shareable output created -> new creator discovered.

Notes is responsible for the "context becomes work" moment.

## Shared Objects Notes Should Respect

| Object | Notes meaning |
| --- | --- |
| Workspace | The place where captured context belongs. |
| Person | Attendee, owner, decision maker, collaborator, supplier, or client. |
| Note | Captured context with extractable actions, decisions, risks, questions, and references. |
| Decision | A dated choice with reason, owner, and linked work. |
| Risk | Captured concern that can connect to tasks, roadmap, and analytics. |
| Update | A meaningful note, decision, or extracted item that can feed activity and briefings. |
| Shareable output | Meeting summary, decision summary, action summary, or follow-up note. |

## Cycle 1 Product Work

Prioritise:

- manual extraction before automation
- action extraction into Tasks
- decision log shape
- risk/question capture
- meeting follow-up summary
- events for note created, action extracted, decision logged, risk captured, and summary shared

Avoid:

- becoming a generic notes app
- extracting work without user approval
- hiding decisions inside long notes
- making collaborators read everything before seeing what matters

## Acceptance Test

For the wedding/events wedge, a venue meeting note should produce:

- tasks for follow-ups
- a decision summary
- unresolved questions
- a planning risk if something is waiting
- a short shareable follow-up for the couple or supplier

## Cycle 2: Invite And First View

Notes owns the "What was decided" part of the invited collaborator's first view.

Role defaults for Notes:

- Creator controls which notes or summaries are shared.
- Collaborator can see shared summaries and relevant decisions.
- Guest can open a selected follow-up or decision summary.
- Client / supplier can see questions and decisions relevant to them.
- Viewer can see only intentionally public summaries.

Cycle 2 implementation targets:

- meeting follow-up summary
- decision summary visibility rules
- action extraction into Tasks with creator approval
- private-note protection
- note follow-up source tracking

Acceptance test:

A couple receives a venue meeting follow-up with decisions, open questions, and follow-up actions, without seeing the venue's internal notes.

## Cycle 7: Wedding Meeting Follow-Up

Notes now shows the wedding/events proof scene directly:

- a seeded venue meeting follow-up
- action, decision, question, and risk extraction blocks
- a public-safe explanation of how meeting context becomes workspace work

This is the context layer for the same scene already used by Tasks and Roadmap.

Next implementation targets:

- user-approved extraction into Signal Tasks
- decision summary sharing
- private/internal note protection
- source tracking for shared follow-up links
