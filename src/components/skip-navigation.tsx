"use client";

import type { MouseEvent } from "react";

export function SkipNavigation() {
  function moveFocusToMain(event: MouseEvent<HTMLAnchorElement>) {
    const main = document.querySelector<HTMLElement>("main");
    if (!main) return;

    event.preventDefault();
    const suppliedId = main.id.length > 0;
    const suppliedTabIndex = main.hasAttribute("tabindex");
    if (!suppliedId) main.id = "main-content";
    if (!suppliedTabIndex) main.setAttribute("tabindex", "-1");
    main.focus({ preventScroll: true });
    main.scrollIntoView({ block: "start" });

    if (!suppliedTabIndex) {
      main.addEventListener("blur", () => main.removeAttribute("tabindex"), {
        once: true,
      });
    }
  }

  return (
    <nav aria-label="Skip navigation">
      <a
        className="skip-navigation"
        href="#main-content"
        onClick={moveFocusToMain}
      >
        Skip to content
      </a>
    </nav>
  );
}
