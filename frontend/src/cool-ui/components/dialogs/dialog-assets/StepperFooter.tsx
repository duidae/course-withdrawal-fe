import { type FC } from "react";
import { useIntl } from "react-intl";
import { StepperStatus } from "../dialog.enum";
import { Box, Button, Stack } from "@mui/material";

type StepperFooterProps = {
  status: StepperStatus;
  canProceed: boolean;
  cancelBtnText?: string;
  previousBtnText?: string;
  nextBtnText?: string;
  confirmBtnText?: string;
  onCancel: () => void;
  onPrevious: () => void;
  onNext?: () => void;
  onConfirm: () => void;
};

export const StepperFooter: FC<StepperFooterProps> = (
  props: StepperFooterProps,
) => {
  const {
    status,
    canProceed,
    cancelBtnText,
    previousBtnText,
    nextBtnText,
    confirmBtnText,
    onCancel,
    onPrevious,
    onNext,
    onConfirm,
  } = props;

  const { formatMessage: f } = useIntl();

  // Footer button initial state
  let isShowFooter = true;
  let isCancelButtonShow = true;
  let isPreviousButtonShow = false;
  let isNextButtonShow = true;
  let isCompletedButtonShow = false;

  switch (status) {
    case StepperStatus.Start:
      isPreviousButtonShow = false;
      break;
    case StepperStatus.InProgress:
      isPreviousButtonShow = true;
      break;
    case StepperStatus.Loading:
      isShowFooter = false;
      break;
    case StepperStatus.Result:
      isCancelButtonShow = false;
      isNextButtonShow = false;
      isCompletedButtonShow = true;
      break;
  }

  return (
    <Stack
      direction="row"
      sx={{
        width: "100%",
        height: "36px",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      {isShowFooter && isCancelButtonShow && (
        <Button variant="text" onClick={onCancel}>
          {cancelBtnText || f({ id: "cool-ui.cancel" })}
        </Button>
      )}

      <Box>
        {isShowFooter && isPreviousButtonShow && (
          <Button variant="contained" onClick={onPrevious}>
            {previousBtnText || f({ id: "cool-ui.previous" })}
          </Button>
        )}
        {isShowFooter && isNextButtonShow && (
          <Button
            variant="contained"
            sx={{ marginLeft: "8px" }}
            onClick={onNext}
            disabled={!canProceed}
          >
            {nextBtnText || f({ id: "cool-ui.next" })}
          </Button>
        )}
      </Box>

      {isShowFooter && isCompletedButtonShow && (
        <Button variant="contained" onClick={onConfirm}>
          {confirmBtnText || f({ id: "cool-ui.confirm" })}
        </Button>
      )}
    </Stack>
  );
};
