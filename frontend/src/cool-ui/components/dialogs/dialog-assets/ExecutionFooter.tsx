import { type FC } from "react";
import { useIntl } from "react-intl";
import { ExecutionStatus } from "../dialog.enum";
import { Button, Stack } from "@mui/material";

type ExecutionFooterProps = {
  status: ExecutionStatus;
  canExecute: boolean;
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
  onCancel: () => void;
  onExecute: () => void;
  onConfirm: () => void;
};

export const ExecutionFooter: FC<ExecutionFooterProps> = (
  props: ExecutionFooterProps,
) => {
  const {
    status,
    canExecute,
    executeBtnText,
    cancelBtnText,
    confirmBtnText,
    executeBtnColor,
    onCancel,
    onExecute,
    onConfirm,
  } = props;

  const { formatMessage: f } = useIntl();

  // Footer button initial state
  let isShowFooter = true;
  let isCancelButtonShow = true;
  let isExecuteButtonShow = true;
  let isConfirmButtonShow = false;

  switch (status) {
    case ExecutionStatus.Loading:
      isShowFooter = false;
      break;
    case ExecutionStatus.Success:
      isCancelButtonShow = false;
      isExecuteButtonShow = false;
      isConfirmButtonShow = true;
      break;
    case ExecutionStatus.Failed:
      isCancelButtonShow = false;
      isExecuteButtonShow = false;
      isConfirmButtonShow = true;
      break;
    default:
      break;
  }

  return (
    <Stack
      direction="row"
      sx={{
        width: "100%",
        height: "36px",
        justifyContent: "flex-end",
        alignItems: "center",
      }}
    >
      {isShowFooter && isCancelButtonShow && (
        <Button variant="text" onClick={onCancel}>
          {cancelBtnText || f({ id: "cool-ui.cancel" })}
        </Button>
      )}

      {isShowFooter && isExecuteButtonShow && (
        <Button
          variant="contained"
          sx={{ marginLeft: "8px" }}
          onClick={onExecute}
          disabled={!canExecute}
          color={executeBtnColor || "primary"}
        >
          {executeBtnText || f({ id: "cool-ui.next" })}
        </Button>
      )}

      {isShowFooter && isConfirmButtonShow && (
        <Button variant="contained" onClick={onConfirm} color="primary">
          {confirmBtnText || f({ id: "cool-ui.confirm" })}
        </Button>
      )}
    </Stack>
  );
};
