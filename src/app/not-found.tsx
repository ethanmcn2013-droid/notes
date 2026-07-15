import Link from "next/link";

export default function NotFound() {
  return (
    <main className="notes-not-found">
      <div className="notes-not-found__content">
        <p className="notes-not-found__eyebrow">404 · Missing page</p>
        <h1>This page faded.</h1>
        <p>
          The address may have changed, but your private notebook is still
          where you left it.
        </p>
        <Link className="notes-not-found__action" href="/">
          Back to Signal Notes
        </Link>
      </div>
    </main>
  );
}
