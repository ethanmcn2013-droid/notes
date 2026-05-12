const STORAGE_KEY = "signal-notes-demo";
const PRIVATE_EMPTY_LINES = [
  "Writings you can’t say out loud.",
  "For things not ready for the room yet.",
  "Ideas before they become decisions.",
  "Not everything needs to be shared.",
  "A place to think before you speak.",
  "For thoughts still forming.",
  "Some things are only for you.",
];

class PrivateNotesEmptyState {
  constructor({ copy, root, textarea }) {
    this.copy = copy;
    this.root = root;
    this.textarea = textarea;
    this.index = 0;
    this.timer = null;
    this.reducedMotion = prefersReducedMotion();
  }

  start() {
    this.render();
    this.sync();
  }

  sync() {
    const empty = this.textarea.value.trim().length === 0;
    this.root.classList.toggle("is-hidden", !empty);

    if (!empty || this.reducedMotion) {
      this.stopRotation();
      return;
    }

    this.startRotation();
  }

  startRotation() {
    if (this.timer) return;
    this.timer = window.setInterval(() => this.rotate(), 5200);
  }

  stopRotation() {
    window.clearInterval(this.timer);
    this.timer = null;
  }

  rotate() {
    this.root.classList.add("is-changing");
    window.setTimeout(() => {
      this.index = nextIndex(this.index, PRIVATE_EMPTY_LINES.length);
      this.render();
      this.root.classList.remove("is-changing");
    }, 320);
  }

  render() {
    this.copy.textContent = PRIVATE_EMPTY_LINES[this.index];
  }
}

const seedNotes = [
  {
    id: "n-0",
    body: "Venue meeting follow-up\nDecision: ceremony layout is confirmed.\nAction: confirm supplier arrival times before Friday.\nRisk: final-week walkthrough slips if guest numbers are late.",
    createdAt: Date.now() - 1000 * 60 * 6,
    promoted: true,
  },
  {
    id: "n-1",
    body: "Florist confirms pink, not red.\nUpdate the venue checklist after lunch.",
    createdAt: Date.now() - 1000 * 60 * 18,
    promoted: true,
  },
  {
    id: "n-2",
    body: "Supplier delivery slipped to Tuesday.\nAsk Marcus whether the install order changes.",
    createdAt: Date.now() - 1000 * 60 * 52,
    promoted: false,
  },
  {
    id: "n-3",
    body: "Sarah wants the handover note shorter.\nKeep the decision log but lose the filler.",
    createdAt: Date.now() - 1000 * 60 * 60 * 3,
    promoted: false,
  },
];

const capture = document.querySelector("#capture");
const search = document.querySelector("#search");
const stream = document.querySelector("#stream");
const count = document.querySelector("#count");
const openNote = document.querySelector("#open-note");
const openBody = document.querySelector("#open-body");
const openTime = document.querySelector("#open-time");
const promote = document.querySelector("#promote");
const privateEmptyState = new PrivateNotesEmptyState({
  copy: document.querySelector("#private-empty-copy"),
  root: document.querySelector("#private-empty-state"),
  textarea: capture,
});

let notes = readNotes();
let selectedId = null;

render();
privateEmptyState.start();
capture.focus({ preventScroll: true });

capture.addEventListener("keydown", (event) => {
  if (event.key !== "Enter" || event.shiftKey) return;
  event.preventDefault();
  saveCapture();
});

capture.addEventListener("input", () => {
  privateEmptyState.sync();
});

search.addEventListener("input", render);
promote.addEventListener("click", () => {
  if (!selectedId) return;
  // Privacy guardrail: Notes never shares the full note body into collaborative
  // surfaces. This demo only marks that the user drafted an action privately;
  // future Tasks extraction must be explicit, selected, and user-approved.
  notes = notes.map((note) =>
    note.id === selectedId ? { ...note, promoted: true } : note,
  );
  writeNotes();
  render();
});

function saveCapture() {
  const body = capture.value.trim();
  if (!body) return;

  const note = {
    id: `n-${Date.now()}`,
    body,
    createdAt: Date.now(),
    promoted: false,
  };

  notes = [note, ...notes];
  selectedId = note.id;
  capture.value = "";
  privateEmptyState.sync();
  writeNotes();
  render();
}

function render() {
  const query = search.value.trim().toLowerCase();
  const visible = notes.filter((note) => note.body.toLowerCase().includes(query));

  count.value = `${visible.length} ${visible.length === 1 ? "note" : "notes"}`;
  stream.innerHTML = "";

  visible.forEach((note) => {
    const item = document.createElement("li");
    const button = document.createElement("button");
    button.className = "note-row";
    button.type = "button";
    button.addEventListener("click", () => {
      selectedId = note.id;
      renderOpenNote(note);
    });

    const copy = document.createElement("span");
    const title = document.createElement("span");
    const preview = document.createElement("span");
    title.className = "note-title";
    preview.className = "note-preview";
    title.textContent = getTitle(note.body);
    preview.textContent = getPreview(note.body);
    copy.append(title, preview);

    const meta = document.createElement("span");
    meta.className = "note-meta";
    meta.textContent = relativeTime(note.createdAt);
    if (note.promoted) {
      const dot = document.createElement("span");
      dot.className = "dot";
      dot.setAttribute("aria-label", "Private action drafted");
      meta.prepend(dot);
    }

    button.append(copy, meta);
    item.append(button);
    stream.append(item);
  });

  const selected = notes.find((note) => note.id === selectedId);
  if (selected) {
    renderOpenNote(selected);
  } else {
    openNote.hidden = true;
  }
}

function renderOpenNote(note) {
  openNote.hidden = false;
  openTime.textContent = relativeTime(note.createdAt);
  openBody.textContent = note.body;
  promote.textContent = note.promoted ? "Action drafted" : "Draft action";
  promote.disabled = note.promoted;
}

function getTitle(body) {
  return body.split("\n").find(Boolean) || "Untitled";
}

function getPreview(body) {
  const lines = body.split("\n").filter(Boolean);
  return lines.slice(1).join(" ") || lines[0] || "";
}

function relativeTime(timestamp) {
  const diff = Math.max(1, Math.round((Date.now() - timestamp) / 60000));
  if (diff < 60) return `${diff}m ago`;
  const hours = Math.round(diff / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

function readNotes() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    return Array.isArray(stored) ? stored : seedNotes;
  } catch {
    return seedNotes;
  }
}

function writeNotes() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
}

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function nextIndex(current, length) {
  if (length <= 1) return 0;
  return (current + 1) % length;
}
