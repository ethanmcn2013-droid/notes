"use client";

import dynamic from "next/dynamic";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import {
  LabAnnouncement,
  MetricsStrip,
  UndoToast,
} from "./lab-components";
import { hasProtectedDetailWork } from "./lab-model";
import { NotesLabProvider, useNotesLab } from "./lab-store";
import type {
  LabDataset,
  LabInitialConfig,
  LabMode,
  LabOption,
  LabScenario,
  LabViewport,
} from "./lab-types";
import styles from "./notes-lab.module.css";

const OptionA = dynamic(() => import("./option-a"), { loading: OptionLoading });
const OptionB = dynamic(() => import("./option-b"), { loading: OptionLoading });
const OptionC = dynamic(() => import("./option-c"), { loading: OptionLoading });

const OPTION_LABELS: Record<LabOption, string> = {
  a: "Instant Notebook",
  b: "Quiet Editorial Stream",
  c: "Capture Field",
};

const OPTION_ORDER = Object.keys(OPTION_LABELS) as LabOption[];

const SCENARIO_LABELS: Record<LabScenario, string> = {
  capture: "Capture",
  stream: "Stream",
  search: "Search",
  detail: "Detail + extraction",
};

function OptionLoading() {
  return <div className={styles.optionLoading} aria-label="Loading design direction">Preparing direction…</div>;
}

function ReviewShell({ initialViewport }: { initialViewport: LabViewport }) {
  const { state, actions } = useNotesLab();
  const [viewport, setViewport] = useState<LabViewport>(initialViewport);
  const [hydrated, setHydrated] = useState(false);
  const optionTabRefs = useRef<Partial<Record<LabOption, HTMLButtonElement | null>>>({});

  const activateOption = useCallback((option: LabOption) => {
    actions.setOption(option);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        optionTabRefs.current[option]?.focus({ preventScroll: true });
      });
    });
  }, [actions]);

  function onOptionKeyDown(
    event: ReactKeyboardEvent<HTMLButtonElement>,
    option: LabOption,
  ) {
    const currentIndex = OPTION_ORDER.indexOf(option);
    let nextOption: LabOption | null = null;
    if (event.key === "ArrowRight") {
      nextOption = OPTION_ORDER[(currentIndex + 1) % OPTION_ORDER.length];
    } else if (event.key === "ArrowLeft") {
      nextOption = OPTION_ORDER[(currentIndex - 1 + OPTION_ORDER.length) % OPTION_ORDER.length];
    } else if (event.key === "Home") {
      nextOption = OPTION_ORDER[0];
    } else if (event.key === "End") {
      nextOption = OPTION_ORDER[OPTION_ORDER.length - 1];
    }
    if (!nextOption) return;
    event.preventDefault();
    activateOption(nextOption);
  }

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    // Rebuild from the five allowlisted review controls. Unknown parameters
    // may contain pasted private material and must not persist in the URL.
    const url = new URL(window.location.pathname, window.location.origin);
    url.searchParams.set("option", state.option);
    url.searchParams.set("scenario", state.scenario);
    url.searchParams.set("dataset", state.dataset);
    url.searchParams.set("mode", state.mode);
    url.searchParams.set("viewport", viewport);
    window.history.replaceState(null, "", `${url.pathname}${url.search}`);
  }, [state.dataset, state.mode, state.option, state.scenario, viewport]);

  useEffect(() => {
    function shortcuts(event: globalThis.KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLocaleLowerCase() === "k") {
        if (event.defaultPrevented) return;
        if (hasProtectedDetailWork(state)) {
          event.preventDefault();
          actions.closeNote();
          return;
        }
        const search = document.querySelector<HTMLInputElement>("[data-lab-search]");
        if (search) {
          event.preventDefault();
          search.focus();
        }
      }
      if (event.altKey && ["1", "2", "3"].includes(event.key)) {
        event.preventDefault();
        activateOption(({ "1": "a", "2": "b", "3": "c" } as const)[event.key as "1" | "2" | "3"]);
      }
    }
    document.addEventListener("keydown", shortcuts);
    return () => document.removeEventListener("keydown", shortcuts);
  }, [actions, activateOption, state]);

  return (
    <div
      className={styles.labRoot}
      data-lab-hydrated={hydrated ? "true" : "false"}
      data-sentry-mask="true"
      data-clarity-mask="true"
      data-dd-privacy="mask"
      data-1p-ignore="true"
    >
      <header className={styles.reviewChrome}>
        <div className={styles.reviewIdentity}>
          <span className={styles.reviewEyebrow}>Signal Notes · Phase 1</span>
          <strong>Capture system design lab</strong>
          <p>Isolated fixtures. In-memory only. Reload resets every edit and simulated receipt.</p>
        </div>

        <nav
          className={styles.optionTabs}
          aria-label="Design direction"
          aria-orientation="horizontal"
          role="tablist"
        >
          {OPTION_ORDER.map((option) => (
            <button
              ref={(node) => {
                optionTabRefs.current[option] = node;
              }}
              key={option}
              id={`design-option-tab-${option}`}
              type="button"
              role="tab"
              aria-selected={state.option === option}
              aria-controls="design-lab-canvas"
              tabIndex={state.option === option ? 0 : -1}
              onClick={() => activateOption(option)}
              onKeyDown={(event) => onOptionKeyDown(event, option)}
            >
              <span>{option.toUpperCase()}</span>
              {OPTION_LABELS[option]}
            </button>
          ))}
        </nav>

        <div className={styles.scenarioTabs} role="group" aria-label="Review scenario">
          {(Object.keys(SCENARIO_LABELS) as LabScenario[]).map((scenario) => (
            <button
              key={scenario}
              type="button"
              aria-pressed={state.scenario === scenario}
              onClick={() => actions.setScenario(scenario)}
            >
              {SCENARIO_LABELS[scenario]}
            </button>
          ))}
        </div>

        <div className={styles.reviewSelects}>
          <label>
            Dataset
            <select value={state.dataset} onChange={(event) => actions.setDataset(event.target.value as LabDataset)}>
              <option value="sparse">Sparse · 6</option>
              <option value="normal">Normal · 24</option>
              <option value="dense">Dense · 96</option>
              <option value="edge">Edge cases · 15</option>
            </select>
          </label>
          <label>
            Mode
            <select value={state.mode} onChange={(event) => actions.setMode(event.target.value as LabMode)}>
              <option value="default">Default</option>
              <option value="empty">Empty</option>
              <option value="loading">Loading</option>
              <option value="saving">Saving</option>
              <option value="saved">Saved</option>
              <option value="offline">Offline</option>
              <option value="error">Error rehearsal</option>
              <option value="conflict">Conflict</option>
              <option value="read-only">Read-only</option>
            </select>
          </label>
          <label>
            Canvas
            <select value={viewport} onChange={(event) => setViewport(event.target.value as LabViewport)}>
              <option value="auto">Responsive</option>
              <option value="390">390 mobile</option>
              <option value="768">768 tablet</option>
              <option value="1280">1280 desktop</option>
              <option value="1440">1440 desktop</option>
              <option value="1728">1728 large</option>
            </select>
          </label>
          <button type="button" onClick={() => actions.setDataset(state.dataset)}>Reset fixture</button>
        </div>
      </header>

      <section className={styles.canvasStage} aria-label={`Option ${state.option.toUpperCase()} review canvas`}>
        <div
          id="design-lab-canvas"
          role="tabpanel"
          aria-labelledby={`design-option-tab-${state.option}`}
          className={styles.canvas}
          data-viewport={viewport}
          data-active-option={state.option}
        >
          {state.option === "a" ? <OptionA /> : null}
          {state.option === "b" ? <OptionB /> : null}
          {state.option === "c" ? <OptionC /> : null}
        </div>
      </section>

      <footer className={styles.labFooter}>
        <span>Privacy-safe local timings, never note bodies or search terms</span>
        <MetricsStrip />
      </footer>
      <UndoToast />
      <LabAnnouncement />
    </div>
  );
}

export function NotesDesignLab({
  initialConfig,
  initialViewport,
}: {
  initialConfig: LabInitialConfig;
  initialViewport: LabViewport;
}) {
  return (
    <NotesLabProvider initialConfig={initialConfig}>
      <ReviewShell initialViewport={initialViewport} />
    </NotesLabProvider>
  );
}
