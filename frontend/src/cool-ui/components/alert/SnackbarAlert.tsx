import React, { forwardRef, useCallback } from "react";
import { Alert, Typography } from "@mui/material";
import { getDisplayName } from "@mui/utils";
import {
  useSnackbar,
  SnackbarContent,
  SnackbarProvider,
  type CustomContentProps,
  type SnackbarProviderProps,
} from "notistack";

export interface WithSnackbarOptions {
  maxSnack?: number;
  anchorOrigin?: SnackbarProviderProps["anchorOrigin"];
  autoHideDuration?: number;
}

export const AlertSeverity = {
  Success: "success",
  Info: "info",
  Warning: "warning",
  Error: "error",
} as const;
export type AlertSeverity = (typeof AlertSeverity)[keyof typeof AlertSeverity];

const SnackbarAlert = forwardRef<HTMLDivElement, CustomContentProps>(
  (props, ref) => {
    const { id: snackbarId, message, variant } = props;
    const { closeSnackbar } = useSnackbar();
    const handleDismiss = useCallback(() => {
      closeSnackbar(snackbarId);
    }, [snackbarId, closeSnackbar]);

    return (
      <SnackbarContent ref={ref}>
        <Alert severity={variant as AlertSeverity} onClose={handleDismiss}>
          <Typography whiteSpace="pre-line">{message}</Typography>
        </Alert>
      </SnackbarContent>
    );
  },
);

/**
 * withSnackbar 用於將警示框功能注入到元件中，我們通常會對 page 元件使用 withSnackbar。使用前需安裝 notistack 套件。
 *
 * snackbar 的共同參數可以透過 `options` 進行設定，包含：
 * - maxSnack: 最大警示框數量
 * - anchorOrigin: 警示框位置
 * - autoHideDuration: 自動隱藏時間
 *
 * 注入 withSnackbar 後，底下的所有子元件都可以透過 `enqueueSnackbar` 來觸發顯示警示框。
 *
 * 而 enqueueSnackbar 有以下參數可以進行客製化：
 * - message: 警示框訊息
 * - options: 警示框客製化參數 （ref: [notistack-mutual props](https://notistack.com/api-reference#mutual-props)）
 */
export const withSnackbar = <T extends Record<string, unknown>>(
  WrapComponent: React.ComponentType<T>,
  options?: WithSnackbarOptions,
): React.ComponentType<T> => {
  // Default options
  const {
    maxSnack = 8,
    anchorOrigin = { vertical: "top", horizontal: "center" },
    autoHideDuration = 5000,
  } = options || {};

  const ComponentWithSnackbar = (props: React.PropsWithChildren<T>) => (
    <SnackbarProvider
      maxSnack={maxSnack}
      anchorOrigin={anchorOrigin}
      autoHideDuration={autoHideDuration}
      Components={{
        success: SnackbarAlert,
        info: SnackbarAlert,
        error: SnackbarAlert,
        warning: SnackbarAlert,
      }}
    >
      <WrapComponent {...props} />
    </SnackbarProvider>
  );

  ComponentWithSnackbar.displayName = `withSnackbar(${getDisplayName(WrapComponent)})`;

  return ComponentWithSnackbar;
};
