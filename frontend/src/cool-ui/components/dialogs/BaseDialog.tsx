import { type FC, type ReactNode } from "react";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Box,
} from "@mui/material";

export const BaseDialogMode = {
  Default: "default",
  Loading: "loading",
  Info: "info",
} as const;
export type BaseDialogMode =
  (typeof BaseDialogMode)[keyof typeof BaseDialogMode];

type BaseDialogProps = {
  open: boolean;
  title: string;
  confirmBtnText?: string;
  cancelBtnText?: string;
  confirmBtnColor?: "error" | "primary" | "success";
  size?: "xs" | "sm" | "md";
  onConfirm?: () => void;
  onCancel?: () => void;
  mode?: BaseDialogMode;
  disableConfirmBtn?: boolean;
  children: ReactNode;
};

export const dialogHeightMap = new Map<string, string>([
  ["xs", "280px"],
  ["sm", "570px"],
  ["md", "600px"],
]);

export const BaseDialog: FC<BaseDialogProps> = (props: BaseDialogProps) => {
  const mode = props.mode ?? BaseDialogMode.Default;
  let showCancelButton: boolean;
  let showConfirmButton: boolean;

  switch (mode) {
    case BaseDialogMode.Loading:
      showCancelButton = false;
      showConfirmButton = false;
      break;
    case BaseDialogMode.Info:
      showCancelButton = false;
      showConfirmButton = true;
      break;
    case BaseDialogMode.Default:
      showCancelButton = true;
      showConfirmButton = true;
      break;
  }

  return (
    <div>
      <Dialog
        open={props.open}
        fullWidth={true}
        maxWidth={props.size ?? "sm"}
        slotProps={{
          paper: {
            sx: {
              height: dialogHeightMap.get(props.size ?? "sm"),
            },
          },
        }}
      >
        <DialogTitle variant="h4">{props.title}</DialogTitle>

        <DialogContent dividers>
          {mode === BaseDialogMode.Loading ? (
            <Box
              sx={{
                display: "flex",
                height: "100%",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <CircularProgress size="4rem" thickness={6} />
            </Box>
          ) : (
            props.children
          )}
        </DialogContent>

        {(showCancelButton || showConfirmButton) && (
          <DialogActions>
            {showCancelButton && (
              <Button
                variant="text"
                onClick={props.onCancel}
                sx={{ fontWeight: 500 }}
              >
                {props.cancelBtnText}
              </Button>
            )}
            {showConfirmButton && (
              <Button
                variant="contained"
                color={props.confirmBtnColor ?? "primary"}
                disabled={props.disableConfirmBtn ?? false}
                onClick={props.onConfirm}
                sx={{ fontWeight: 500 }}
              >
                {props.confirmBtnText}
              </Button>
            )}
          </DialogActions>
        )}
      </Dialog>
    </div>
  );
};
