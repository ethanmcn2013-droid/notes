import { Notebook } from "./Notebook";

export const metadata = {
  title: "Signal Notes — notebook",
  description: "Capture in three seconds. Find it later.",
};

export default function NotebookPage() {
  return (
    <>
      <header className="suitebar" aria-label="Signal Studio suite">
        <a href="https://signalstudio.ie">
          signal studio<span>.</span>
        </a>
        <nav>
          <a href="https://tasks.signalstudio.ie">tasks</a>
          <a href="https://roadmap.signalstudio.ie">roadmap</a>
          <a href="https://analytics.signalstudio.ie">analytics</a>
          <strong>notes</strong>
        </nav>
      </header>

      <Notebook />
    </>
  );
}
