"use client";

import { useEffect, type MouseEvent } from "react";
import { usePathname } from "next/navigation";

export function SkipNavigation() {
  const pathname = usePathname();

  useEffect(() => {
    const main = document.querySelector<HTMLElement>("main");
    if (!main || main.id) return;
    main.id = "main-content";
    main.dataset.skipNavigationTarget = "true";

    return () => {
      if (main.dataset.skipNavigationTarget === "true") {
        main.removeAttribute("id");
        delete main.dataset.skipNavigationTarget;
      }
    };
  }, [pathname]);

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
