import { useEffect, useRef, useState } from "react";
import styles from "./DetailItem.module.css";

export default function DetailItem({
  label,
  text,
  wide,
}: {
  label: string;
  text: string;
  wide?: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const resetCopiedTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const displayText = text || "—";

  useEffect(() => {
    return () => {
      if (resetCopiedTimeout.current) {
        clearTimeout(resetCopiedTimeout.current);
      }
    };
  }, []);

  const copyText = async () => {
    if (!text || !navigator.clipboard) {
      return;
    }

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      resetCopiedTimeout.current = setTimeout(() => {
        setCopied(false);
      }, 350);
    } catch {
      // Do not show the copied indicator when clipboard access fails.
    }
  };

  return (
    <div className={`${styles.detailItem} ${wide ? styles.wide : ""}`}>
      <span>{label}</span>
      <strong
        className={`${styles.copyableDetail} ${copied ? styles.copied : ""}`}
        onClick={copyText}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            void copyText();
          }
        }}
        role="button"
        tabIndex={text ? 0 : -1}
        title={text ? "Click para copiar" : undefined}
      >
        {displayText}
      </strong>
    </div>
  );
}
