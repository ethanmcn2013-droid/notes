"use client";

import { useEffect, useState } from "react";

import { relativeTime } from "./utils";

export function RelativeTime({ ts }: { ts: number }) {
  // Self-contained tick so the whole notebook doesn't re-render once
  // a minute just to refresh a timestamp. Only the timestamp updates.
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 60_000);
    return () => window.clearInterval(id);
  }, []);
  return <>{relativeTime(ts, now)}</>;
}
