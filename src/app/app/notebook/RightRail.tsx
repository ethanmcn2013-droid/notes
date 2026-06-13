"use client";

import { RelativeTime } from "./RelativeTime";

interface RightRailProps {
  notesCount: number;
  archivedCount: number;
  lastSavedTs: number | null;
}

export function RightRail({ notesCount, archivedCount, lastSavedTs }: RightRailProps) {
  return (
    <aside className="product product--authed">
      <dl className="product-stats product-stats--first">
        <div>
          <dt>Privacy</dt>
          <dd>Private by default</dd>
        </div>
        <div>
          <dt>Notes</dt>
          <dd>
            {notesCount === 0 ? (
              "None yet"
            ) : (
              <>
                <em>{notesCount}</em> {notesCount === 1 ? "note" : "notes"}
              </>
            )}
          </dd>
        </div>
        <div>
          <dt>Last saved</dt>
          <dd>
            {lastSavedTs ? (
              <em>
                <RelativeTime ts={lastSavedTs} />
              </em>
            ) : (
              "—"
            )}
          </dd>
        </div>
        <div>
          <dt>In Tasks</dt>
          <dd>
            {archivedCount === 0 ? (
              "—"
            ) : (
              <>
                <em>{archivedCount}</em>{" "}
                {archivedCount === 1 ? "note" : "notes"}
              </>
            )}
          </dd>
        </div>
      </dl>
      <p className="product-reassurance">
        Only you can see this.
      </p>
    </aside>
  );
}
