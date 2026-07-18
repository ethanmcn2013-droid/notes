import styles from "./notes-lab.module.css";

/**
 * Static Notes wordmark fallback for this isolated lab. It follows the repo's
 * vendored signal-design-system@2.0.1 tokens; it does not claim parity with the
 * canonical Signal Design System 2.1 component or its motion contract.
 */
export function NotesWordmark({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  return (
    <span
      className={`${styles.wordmark} ${styles[`wordmark_${size}`]}`}
      data-kind="notes"
      aria-label="notes."
    >
      <span>notes</span>
      <span className={styles.wordmarkPeriod} aria-hidden="true">
        .
      </span>
    </span>
  );
}
