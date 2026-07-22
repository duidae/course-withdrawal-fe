import { useState, useEffect, useRef } from "react";
import { useIntl } from "react-intl";
import { type TruncatedReasonProps } from "./types";

export function TruncatedReason({ text, onReadMore }: TruncatedReasonProps) {
  const { formatMessage: f } = useIntl();
  const measRef = useRef<HTMLDivElement | null>(null);
  const [isOver, setIsOver] = useState(false);

  useEffect(() => {
    const measure = () => {
      const el = measRef.current;
      if (!el) return;
      const lh = Number.parseFloat(getComputedStyle(el).lineHeight) || 18;
      setIsOver(el.scrollHeight > lh * 2 + 2);
    };
    measure(); // immediate (may use pre-layout width)
    const t = setTimeout(measure, 0); // deferred: fires after table layout settles

    // Re-measure whenever the cell's own width changes (browser/window resize,
    // sidebar collapse, table column reflow, etc.) so <查看更多> shows/hides
    // dynamically instead of being locked in from the first render.
    let ro: ResizeObserver | undefined;
    if (typeof ResizeObserver !== "undefined" && measRef.current) {
      ro = new ResizeObserver(() => measure());
      ro.observe(measRef.current);
    }
    window.addEventListener("resize", measure);

    return () => {
      clearTimeout(t);
      if (ro) ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [text]);

  return (
    <div>
      <div
        ref={measRef}
        aria-hidden="true"
        style={{
          fontSize: 14,
          lineHeight: "1.43",
          height: 0,
          overflow: "hidden",
          wordBreak: "break-all",
        }}
      >
        {text}
      </div>

      {isOver ? (
        <div
          style={{
            fontSize: 14,
            color: "#333",
            lineHeight: "1.43",
            overflow: "hidden",
            maxHeight: "2.86em",
            wordBreak: "break-all",
          }}
        >
          <span
            style={{
              float: "right",
              clear: "right",
              height: "1.43em",
              width: "1px",
              display: "block",
            }}
          />
          <span style={{ float: "right", clear: "right" }}>
            {"... "}
            <button
              onClick={onReadMore}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 0,
                fontSize: 12,
                color: "#757575",
                fontFamily: "inherit",
                whiteSpace: "nowrap",
              }}
            >
              &lt;{f({ id: "teacherDashboard.reason.readMore" })}&gt;
            </button>
          </span>
          {text}
        </div>
      ) : (
        <div
          style={{
            fontSize: 14,
            color: "#333",
            lineHeight: "1.43",
            wordBreak: "break-all",
          }}
        >
          {text}
        </div>
      )}
    </div>
  );
}
