import type { LabDataset, LabNote, LabNoteId } from "./lab-types";

export const LAB_NOW = Date.UTC(2026, 6, 16, 9, 30, 0);

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

type FixtureInput = Omit<LabNote, "createdAt" | "updatedAt"> & {
  ageMs: number;
  updatedAgeMs?: number;
};

function fixture(input: FixtureInput): LabNote {
  return {
    ...input,
    createdAt: LAB_NOW - input.ageMs,
    updatedAt: LAB_NOW - (input.updatedAgeMs ?? input.ageMs),
  };
}

const largeBody = [
  "Post-event debrief for the orchard room",
  "",
  "The arrival worked because the welcome table moved inside before the rain. The handoff between the venue team and the caterer was calm, but the supplier entrance needs a clearer sign before the next event.",
  "",
  "Keep the first ten minutes unhurried. Guests read the room from the doorway, so the lighting and the first person they meet matter more than another printed schedule.",
  "",
  ...Array.from(
    { length: 18 },
    (_, index) =>
      `Observation ${index + 1}. The room reset took ${12 + index} minutes. Keep this as private context until one exact follow-up is selected.`,
  ),
].join("\n");

const curated: LabNote[] = [
  fixture({
    id: "lab_two_words",
    body: "Call Maya",
    ageMs: 4 * MINUTE,
    syncState: "synced",
    approvedExtract: null,
    promotedTaskId: null,
  }),
  fixture({
    id: "lab_venue_walkthrough",
    body:
      "Venue walkthrough with Niamh and Eoin\n\nThe west entrance works for suppliers. The side gate catches on the stone after rain. Confirm the portable ramp with Eoin by Friday. Keep the family conversation about cost private for now.\n\nReception tables fit as drawn if the band uses the north wall.",
    ageMs: 18 * MINUTE,
    syncState: "synced",
    approvedExtract: null,
    promotedTaskId: null,
  }),
  fixture({
    id: "lab_supplier_delivery",
    body:
      "Supplier delivery moved to Tuesday\n\nDoyle Hire called at 08:40. Chairs now arrive Tuesday between 11:00 and 13:00, not Monday. Ask Leila to keep the service entrance clear.",
    ageMs: 42 * MINUTE,
    syncState: "synced",
    approvedExtract: null,
    promotedTaskId: null,
  }),
  fixture({
    id: "lab_meeting_notes",
    body:
      "Kickoff notes for Rowan Studio\n\nMaeve wants the first draft to feel direct, not polished. The launch date is still 14 October. Pricing copy waits for the final photography estimate.\n\nQuestions\n- Who signs off the short version?\n- Can the photographer hold 3 October?\n- Which two case studies are safe to name?",
    ageMs: 1.5 * HOUR,
    syncState: "synced",
    approvedExtract: null,
    promotedTaskId: null,
  }),
  fixture({
    id: "lab_teacher_calls",
    body:
      "Parent calls after class\n\nCall Aisha's father about the reading support plan. Call Tom's mother about the missed lab. Do not put either student's private context into a shared task.",
    ageMs: 2.2 * HOUR,
    syncState: "synced",
    approvedExtract: null,
    promotedTaskId: null,
  }),
  fixture({
    id: "lab_freelance_kickoff",
    body:
      "Freelance kickoff asks\n\nNeed the final logo files, access to the existing newsletter, and one person who can answer product questions. Ask for all three in tomorrow's follow-up.",
    ageMs: 3 * HOUR,
    syncState: "synced",
    approvedExtract: null,
    promotedTaskId: null,
  }),
  fixture({
    id: "lab_private_thought",
    body:
      "Private thought. Do not promote.\n\nI am not convinced the partnership is right. Keep this here until I have spoken to Ruth. The concern is trust, not timing.",
    ageMs: 4.4 * HOUR,
    syncState: "synced",
    approvedExtract: null,
    promotedTaskId: null,
  }),
  fixture({
    id: "lab_approved_extract",
    body:
      "Open-day follow-up\n\nThe welcome sign by the gate has faded. The private context is that we noticed it during a difficult client conversation. Reprint the welcome sign before the open day.",
    ageMs: 6 * HOUR,
    syncState: "synced",
    approvedExtract: "Reprint the welcome sign before the open day.",
    promotedTaskId: null,
  }),
  fixture({
    id: "lab_already_sent",
    body:
      "Bar stock before Saturday\n\nTonic is running low. The last delivery was short. Order two extra cases before Friday afternoon.",
    ageMs: 8 * HOUR,
    syncState: "synced",
    approvedExtract: "Order two extra cases before Friday afternoon.",
    promotedTaskId: "lab_task_lab_already_sent",
  }),
  fixture({
    id: "lab_markdown_like",
    body:
      "# Workshop notes\n\n- bring the paper samples\n- ask about access after 18:00\n- **do not** treat this as required formatting\n\nPlain text stays plain text.",
    ageMs: 12 * HOUR,
    syncState: "synced",
    approvedExtract: null,
    promotedTaskId: null,
  }),
  fixture({
    id: "lab_contacts",
    body:
      "Thursday contacts\n\nSamira: +44 1632 960123\nBrief: https://rowan-studio.example.test/brief\nMeet 24 July at 09:15 in Studio 4. Bring the O'Connell estimate.",
    ageMs: 20 * HOUR,
    syncState: "synced",
    approvedExtract: null,
    promotedTaskId: null,
  }),
  fixture({
    id: "lab_duplicate_a",
    body: "Confirm the portable ramp with Eoin by Friday.",
    ageMs: 1.2 * DAY,
    syncState: "synced",
    approvedExtract: null,
    promotedTaskId: null,
  }),
  fixture({
    id: "lab_duplicate_b",
    body: "Confirm portable ramp with Eoin before Friday afternoon.",
    ageMs: 1.4 * DAY,
    syncState: "synced",
    approvedExtract: null,
    promotedTaskId: null,
  }),
  fixture({
    id: "lab_unicode",
    body:
      "Café handover ☕\n\nMañana revisamos la entrega. João traerá las llaves. 日本語のメモもそのまま保存する。 Emoji came from the user, not the interface.",
    ageMs: 1.8 * DAY,
    syncState: "synced",
    approvedExtract: null,
    promotedTaskId: null,
  }),
  fixture({
    id: "lab_very_long_first_line",
    body:
      "This is a deliberately very long first line about the final supplier arrival plan, the room reset, the missing linen count, the wet-weather entrance, and the person who must hold the key before anyone else reaches the venue\n\nThe second line still needs to remain discoverable and readable.",
    ageMs: 2.2 * DAY,
    syncState: "synced",
    approvedExtract: null,
    promotedTaskId: null,
  }),
  fixture({
    id: "lab_search_title",
    body:
      "Delivery checklist for the north gate\n\nKeep the loading bay clear and check the intercom at 10:30.",
    ageMs: 3 * DAY,
    syncState: "synced",
    approvedExtract: null,
    promotedTaskId: null,
  }),
  fixture({
    id: "lab_search_body",
    body:
      "Flowers and linen\n\nThe final delivery window is 11:00 to 13:00. Linen stays on the lower rack.",
    ageMs: 4 * DAY,
    syncState: "synced",
    approvedExtract: null,
    promotedTaskId: null,
  }),
  fixture({
    id: "lab_search_extract",
    body:
      "Quiet note after the call\n\nMost of this stays private. The exact wording below is the only approved cut.",
    ageMs: 6 * DAY,
    syncState: "synced",
    approvedExtract: "Confirm Tuesday delivery with Doyle Hire.",
    promotedTaskId: null,
  }),
  fixture({
    id: "lab_offline_pending",
    body:
      "Captured on the train\n\nSignal dropped after Newbridge. Keep this local until the connection returns.",
    ageMs: 8 * DAY,
    syncState: "pending",
    approvedExtract: null,
    promotedTaskId: null,
  }),
  fixture({
    id: "lab_failed_sync",
    body:
      "This writing must survive a failed save\n\nThe row stays here with the exact text and a retry action. It is never removed just because sync failed.",
    ageMs: 10 * DAY,
    syncState: "failed",
    approvedExtract: null,
    promotedTaskId: null,
  }),
  fixture({
    id: "lab_large_body",
    body: largeBody,
    ageMs: 15 * DAY,
    syncState: "synced",
    approvedExtract: null,
    promotedTaskId: null,
  }),
  fixture({
    id: "lab_old_note",
    body:
      "First venue visit\n\nThe orchard was bare and the north wall still needed repair. Keep this as the old reference point.",
    ageMs: 480 * DAY,
    syncState: "synced",
    approvedExtract: null,
    promotedTaskId: null,
  }),
  fixture({
    id: "lab_email_context",
    body:
      "from: private.sender@example.test\nsubject: revised delivery\n\nThe sender address and subject stay private. Select only this sentence: Confirm the revised delivery time with the supplier.",
    ageMs: 520 * DAY,
    syncState: "synced",
    approvedExtract: null,
    promotedTaskId: null,
  }),
  fixture({
    id: "lab_punctuation",
    body:
      "Names, dates, and punctuation\n\n‘Yes,’ said Orla. Price range €1,200-€1,450. Reference A/B-27. The user typed this punctuation; Notes did not rewrite it.",
    ageMs: 600 * DAY,
    syncState: "synced",
    approvedExtract: null,
    promotedTaskId: null,
  }),
];

const subjects = [
  "Morning setup",
  "Supplier call",
  "Parent meeting",
  "Client review",
  "Workshop reset",
  "Invoice question",
  "Venue access",
  "Course reading",
  "Freelance handover",
  "Community hall",
  "Equipment check",
  "Weekend plan",
];

const details = [
  "Keep the first arrival unhurried and leave five minutes for the key handover.",
  "The delivery reference is D-47. Confirm the name at the gate before opening it.",
  "One sentence may become work later. The rest remains private context.",
  "The room reads better with the long table moved away from the window.",
  "Call after 15:30. Before then, keep the note in the recent stream.",
  "Search should find this line without adding a folder, tag, title, or status.",
];

const generated: LabNote[] = Array.from({ length: 72 }, (_, index) => {
  const subject = subjects[index % subjects.length];
  const detail = details[Math.floor(index / subjects.length) % details.length];
  return fixture({
    id: `lab_generated_${String(index + 1).padStart(3, "0")}` as LabNoteId,
    body: `${subject} ${index + 1}\n\n${detail} Reference ${String(index + 17).padStart(3, "0")}.`,
    ageMs: (index + 24) * 9 * HOUR,
    syncState: "synced",
    approvedExtract: index === 31 ? "Confirm the name at the gate before opening it." : null,
    promotedTaskId:
      index === 31 ? "lab_task_lab_generated_032" : null,
  });
});

export const LAB_NOTES: readonly LabNote[] = [...curated, ...generated];

if (LAB_NOTES.length !== 96) {
  throw new Error(`Signal Notes design lab fixture count drifted: ${LAB_NOTES.length}`);
}

const edgeIds = new Set<LabNoteId>([
  "lab_venue_walkthrough",
  "lab_two_words",
  "lab_very_long_first_line",
  "lab_meeting_notes",
  "lab_private_thought",
  "lab_approved_extract",
  "lab_already_sent",
  "lab_duplicate_a",
  "lab_duplicate_b",
  "lab_unicode",
  "lab_large_body",
  "lab_offline_pending",
  "lab_failed_sync",
  "lab_email_context",
  "lab_punctuation",
]);

export const LAB_DATASET_IDS: Record<LabDataset, readonly LabNoteId[]> = {
  sparse: LAB_NOTES.slice(0, 6).map((note) => note.id),
  normal: LAB_NOTES.slice(0, 24).map((note) => note.id),
  dense: LAB_NOTES.map((note) => note.id),
  edge: LAB_NOTES.filter((note) => edgeIds.has(note.id)).map((note) => note.id),
};

export function freshLabNotes(): LabNote[] {
  return LAB_NOTES.map((note) => ({ ...note }));
}
