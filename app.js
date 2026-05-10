const STORAGE_KEY = "signal-notes-demo";

const seedNotes = [
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

let notes = readNotes();
let selectedId = null;

render();
capture.focus({ preventScroll: true });

capture.addEventListener("keydown", (event) => {
  if (event.key !== "Enter" || event.shiftKey) return;
  event.preventDefault();
  saveCapture();
});

search.addEventListener("input", render);
promote.addEventListener("click", () => {
  if (!selectedId) return;
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
      dot.setAttribute("aria-label", "Promoted to Signal Tasks");
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
  promote.textContent = note.promoted ? "Task linked" : "Task";
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
