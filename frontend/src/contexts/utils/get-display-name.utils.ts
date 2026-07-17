import React from "react";

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
export function getDisplayName(Component: React.ComponentType<any>): string {
  return Component.displayName || Component.name || "Component";
}
