import { useState, useEffect, useRef } from "react";
import { useIntl } from "react-intl";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";

type TruncatedReasonProps = {
  text: string;
  onReadMore: () => void;
};

export const TruncatedReason = ({ text, onReadMore }: TruncatedReasonProps) => {
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
    <Box>
      <Box
        ref={measRef}
        aria-hidden="true"
        sx={{
          fontSize: 14,
          lineHeight: 1.43,
          height: 0,
          overflow: "hidden",
          wordBreak: "break-all",
        }}
      >
        {text}
      </Box>

      {isOver ? (
        <Box
          sx={{
            fontSize: 14,
            color: "#333",
            lineHeight: 1.43,
            overflow: "hidden",
            maxHeight: "2.86em",
            wordBreak: "break-all",
          }}
        >
          <Box
            component="span"
            sx={{
              float: "right",
              clear: "right",
              height: "1.43em",
              width: "1px",
              display: "block",
            }}
          />
          <Box component="span" sx={{ float: "right", clear: "right" }}>
            {"... "}
            <Button
              onClick={onReadMore}
              disableRipple
              sx={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 0,
                minWidth: 0,
                fontSize: 14,
                fontWeight: 400,
                textTransform: "none",
                color: "#757575",
                fontFamily: "inherit",
                whiteSpace: "nowrap",
                "&:hover": { background: "none" },
              }}
            >
              &lt;{f({ id: "teacherDashboard.reason.readMore" })}&gt;
            </Button>
          </Box>
          {text}
        </Box>
      ) : (
        <Box
          sx={{
            fontSize: 14,
            color: "#333",
            lineHeight: 1.43,
            wordBreak: "break-all",
          }}
        >
          {text}
        </Box>
      )}
    </Box>
  );
};
