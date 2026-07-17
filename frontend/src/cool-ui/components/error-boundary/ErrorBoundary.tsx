import { useState } from "react";
import type { ReactNode } from "react";
import { ErrorBoundary as ReactErrorBoundary } from "react-error-boundary";
import { ErrorFallback } from "./ErrorFallback";

type ErrorBoundaryProps = {
  children: ReactNode;
};

/**
 * 【ErrorBoundary】
 *
 * 封裝 react-error-boundary 的 ErrorBoundary，並自動傳入 componentStack 給 ErrorFallback。
 * 直接包覆需要保護的子元件即可，無需額外設定。
 *
 * @coolUI
 * @prop {ReactNode} children - 需要保護的子元件
 */
export function ErrorBoundary({ children }: ErrorBoundaryProps) {
  const [componentStack, setComponentStack] = useState("");

  if (import.meta.env.PROD) {
    return <>{children}</>;
  }

  return (
    <ReactErrorBoundary
      onError={(_error, info) => {
        setComponentStack(info.componentStack ?? "");
      }}
      fallbackRender={({ error, resetErrorBoundary }) => (
        <ErrorFallback
          error={error}
          resetErrorBoundary={() => {
            setComponentStack("");
            resetErrorBoundary();
          }}
          componentStack={componentStack}
        />
      )}
    >
      {children}
    </ReactErrorBoundary>
  );
}
