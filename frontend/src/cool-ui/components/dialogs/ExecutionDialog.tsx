import { type FC, type ReactNode } from "react";
import { useIntl } from "react-intl";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Typography,
  Stack,
} from "@mui/material";
import { Cancel, CheckCircle } from "@mui/icons-material";
import { ExecutionStatus } from "./dialog.enum";
import { dialogHeightMap } from "./dialog.utils";
import { ExecutionFooter } from "./dialog-assets";
import { DialogLoadingSpinner } from "../loading-spinner/DialogLoadingSpinner";

type ExecutionDialogProps = {
  status: ExecutionStatus;
  executionTitle: string;
  loadingTitle?: string;
  resultTitle?: string;
  open: boolean;
  canExecute: boolean;
  size?: "xs" | "sm" | "md";
  executeBtnText?: string;
  cancelBtnText?: string;
  confirmBtnText?: string;
  executeBtnColor?:
    | "inherit"
    | "primary"
    | "secondary"
    | "success"
    | "error"
    | "info"
    | "warning";
  successMessage?: string;
  failedMessage?: string;
  onClose: () => void;
  onExecute: () => void;
  children: ReactNode;
};

/**
 * 【ExecutionDialog 執行對話框】
 *
 * ExecutionDialog 是只會執行單一動作的對話框，執行結果也只有「成功」或「失敗」。
 *
 * 使用時，需要將「執行標題 executionTitle」、「載入標題 loadingTitle」、「結果標題 resultTitle」傳入，
 * 並使用「status」來控制對話框的狀態，「canExecute」來控制是否可以執行。
 *
 * 對話框大小、按鈕文字與顏色、執行結果訊息皆可以客製化。
 *
 * @coolUI
 * @prop {StepperStatus} status - 步進式對話框狀態
 * @prop {string} executionTitle - 執行標題
 * @prop {string} loadingTitle - 載入標題
 * @prop {string} resultTitle - 結果標題
 * @prop {boolean} open - 控制對話框開啟
 * @prop {boolean} canExecute - 是否可以執行
 * @prop {'xs' | 'sm' | 'md'} size - 對話框大小
 * @prop {string} executionBtnText - 執行按鈕文字
 * @prop {string} cancelBtnText - 取消按鈕文字
 * @prop {string} confirmBtnText - 完成按鈕文字
 * @prop {'inherit' | 'primary' | 'secondary' | 'success' | 'error' | 'info' | 'warning'} executeBtnColor - 執行按鈕顏色
 * @prop {string} successMessage - 執行成功訊息
 * @prop {string} failedMessage - 執行失敗訊息
 * @prop {() => void} onClose - 關閉對話框的 Callback
 * @prop {() => void} onExecute - 執行的 Callback
 * @prop {ReactNode} children - 子元件
 *
 **/
export const ExecutionDialog: FC<ExecutionDialogProps> = (
  props: ExecutionDialogProps,
) => {
  const {
    executionTitle,
    loadingTitle,
    resultTitle,
    status,
    open,
    canExecute,
    onClose,
    onExecute,
    size = "md",
    executeBtnText,
    cancelBtnText,
    confirmBtnText,
    executeBtnColor,
    successMessage,
    failedMessage,
  } = props;

  const { formatMessage: f } = useIntl();

  const getDialogTitle = (status: ExecutionStatus) => {
    switch (status) {
      case ExecutionStatus.Start:
        return executionTitle;
      case ExecutionStatus.Loading:
        return loadingTitle;
      case ExecutionStatus.Success:
        return resultTitle;
      case ExecutionStatus.Failed:
        return resultTitle;
      default:
        return "";
    }
  };

  const getDialogContent = (status: ExecutionStatus) => {
    switch (status) {
      case ExecutionStatus.Start:
        return props.children;
      case ExecutionStatus.Loading:
        return <DialogLoadingSpinner show={true} />;
      case ExecutionStatus.Success:
        return (
          <Stack direction="row" spacing={1}>
            <CheckCircle fontSize="small" color="success" />
            <Typography>
              {successMessage || f({ id: "cool-ui.success" })}
            </Typography>
          </Stack>
        );
      case ExecutionStatus.Failed:
        return (
          <Stack direction="row" spacing={1}>
            <Cancel fontSize="small" color="error" />
            <Typography>
              {failedMessage || f({ id: "cool-ui.failed" })}
            </Typography>
          </Stack>
        );
      default:
        return "";
    }
  };

  const handleClose = (
    _event: object,
    reason?: "backdropClick" | "escapeKeyDown",
  ) => {
    // disable close event for backdropClick and escapeKeyDown
    if (reason !== undefined) {
      return;
    }
    onClose();
  };

  return (
    <Dialog
      open={open}
      fullWidth={true}
      maxWidth={size || "md"}
      PaperProps={{
        sx: {
          height: dialogHeightMap.get(size || "md"),
        },
      }}
      onClose={handleClose}
    >
      <DialogTitle variant="h4">{getDialogTitle(status)}</DialogTitle>

      <Divider />
      <DialogContent>{getDialogContent(status)}</DialogContent>

      {status !== ExecutionStatus.Loading && <Divider />}
      <DialogActions disableSpacing>
        <ExecutionFooter
          status={status}
          canExecute={canExecute}
          executeBtnText={executeBtnText}
          cancelBtnText={cancelBtnText}
          confirmBtnText={confirmBtnText}
          onCancel={onClose}
          onExecute={onExecute}
          onConfirm={onClose}
          executeBtnColor={executeBtnColor}
        />
      </DialogActions>
    </Dialog>
  );
};
