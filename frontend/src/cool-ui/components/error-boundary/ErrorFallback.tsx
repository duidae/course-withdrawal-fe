import { Box, Button, Typography } from "@mui/material";
import type { FallbackProps } from "react-error-boundary";

type ErrorFallbackProps = FallbackProps & {
  componentStack?: string;
};

/**
 * 【ErrorFallback 錯誤畫面】
 *
 * 搭配 react-error-boundary 的 ErrorBoundary 使用，作為 FallbackComponent 傳入。
 * 捕捉到錯誤時會顯示錯誤名稱、訊息與元件堆疊，並提供重設按鈕。
 *
 * 建議透過 ErrorBoundaryWithFallback 使用，以自動傳入 componentStack。
 *
 * @coolUI
 * @prop {unknown} error - 捕捉到的錯誤
 * @prop {() => void} resetErrorBoundary - 重設 ErrorBoundary 狀態的 callback
 * @prop {string} componentStack - React 元件堆疊（由 onError 取得）
 */
export function ErrorFallback({
  error,
  resetErrorBoundary,
  componentStack,
}: ErrorFallbackProps) {
  const err = error instanceof Error ? error : new Error(String(error));

  return (
    <Box
      sx={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        bgcolor: "#1a1a1a",
        color: "#e8e8e8",
        overflowY: "auto",
        p: 4,
        fontFamily: "monospace",
      }}
    >
      <Typography
        variant="h6"
        sx={{
          color: "#ff5555",
          fontWeight: 700,
          mb: 1,
          fontFamily: "monospace",
        }}
      >
        Uncaught Runtime Error
      </Typography>

      <Typography
        component="pre"
        sx={{
          fontSize: "0.95rem",
          color: "#ff8888",
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
          mb: 3,
          fontFamily: "monospace",
        }}
      >
        {err.name}: {err.message}
      </Typography>

      {componentStack && (
        <>
          <Typography
            variant="caption"
            sx={{
              color: "#888",
              textTransform: "uppercase",
              letterSpacing: 1,
              mb: 0.5,
              display: "block",
            }}
          >
            Component Stack
          </Typography>
          <Typography
            component="pre"
            sx={{
              fontSize: "0.8rem",
              color: "#aaa",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              mb: 3,
              fontFamily: "monospace",
            }}
          >
            {componentStack}
          </Typography>
        </>
      )}

      <Button
        variant="outlined"
        size="small"
        onClick={resetErrorBoundary}
        sx={{ color: "#e8e8e8", borderColor: "#e8e8e8" }}
      >
        Try Again
      </Button>
    </Box>
  );
}
