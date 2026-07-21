import { type FC, type ReactNode } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
} from "@mui/material";
import { StepperTitle, StepperFooter } from "./dialog-assets";
import { StepperStatus } from "./dialog.enum";
import { dialogHeightMap } from "./dialog.utils";

type StepperDialogProps = {
  stepNames: string[];
  stepContents: ReactNode[];
  stepActions: ((() => void) | null)[];
  resultContent: ReactNode;
  status: StepperStatus;
  stepIndex: number;
  open: boolean;
  canProceed: boolean;
  onPrevious: () => void;
  onClose: () => void;
  onComplete?: () => void;
  size?: "xs" | "sm" | "md";
  cancelBtnText?: string;
  previousBtnText?: string;
  nextBtnText?: string;
  confirmBtnText?: string;
};

/**
 * 【StepperDialog 步進式對話框】
 *
 * 此元件使用 Dialog 客製化了帶步驟的對話框，可以動態地根據當前步驟來展示不同的內容。
 *
 * 使用時，需要將步驟的「名稱列表 stepNames」和「內容列表 stepContents」、「操作列表 stepActions」傳入。
 * 並使用「status」來控制步驟狀態，「stepIndex」來指定當前進行的步驟。
 *
 * @coolUI
 * @prop {string[]} stepNames - 步驟名稱列表
 * @prop {ReactNode[]} stepContents - 步驟內容列表
 * @prop {(() => void)[]} stepActions - 步驟操作列表
 * @prop {ReactNode} resultContent - 結果內容
 * @prop {StepperStatus} status - 步進式對話框狀態
 * @prop {number} stepIndex - 步進式對話框當前步驟
 * @prop {boolean} open - 控制對話框開啟
 * @prop {boolean} canProceed - 是否可以進行下一步
 * @prop {() => void} onPrevious - 上一步的 Callback
 * @prop {() => void} onClose - 關閉對話框的 Callback
 * @prop {() => void} onComplete - 執行完後，關閉對話框的 Callback
 * @prop {'xs' | 'sm' | 'md'} size - 對話框大小
 * @prop {string} cancelBtnText - 取消按鈕文字
 * @prop {string} previousBtnText - 上一步按鈕文字
 * @prop {string} nextBtnText - 下一步按鈕文字
 * @prop {string} confirmBtnText - 完成按鈕文字
 *
 **/
export const StepperDialog: FC<StepperDialogProps> = (
  props: StepperDialogProps,
) => {
  const {
    stepNames,
    stepContents,
    stepActions,
    resultContent,
    status,
    stepIndex,
    open,
    canProceed,
    onPrevious,
    onClose,
    onComplete,
    size,
    cancelBtnText,
    previousBtnText,
    nextBtnText,
    confirmBtnText,
  } = props;

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

  // Validation: stepNames, stepContents, and stepActions must have the same length
  if (
    stepNames.length !== stepContents.length ||
    stepNames.length !== stepActions.length ||
    stepContents.length !== stepActions.length
  ) {
    throw new Error(
      "stepNames, stepContents, and stepActions must have the same length",
    );
  }

  return (
    <Dialog
      open={open}
      fullWidth={true}
      maxWidth={size || "md"}
      slotProps={{
        paper: {
          sx: {
            height: dialogHeightMap.get(size || "md"),
          },
        },
      }}
      onClose={handleClose}
    >
      <DialogTitle>
        <StepperTitle steps={stepNames} stepIndex={stepIndex} />
      </DialogTitle>

      <Divider />

      <DialogContent>
        {status === StepperStatus.Result
          ? resultContent
          : stepContents[stepIndex]}
      </DialogContent>

      {status !== StepperStatus.Loading && <Divider />}

      <DialogActions disableSpacing>
        <StepperFooter
          status={status}
          canProceed={canProceed}
          cancelBtnText={cancelBtnText}
          previousBtnText={previousBtnText}
          nextBtnText={nextBtnText}
          confirmBtnText={confirmBtnText}
          onCancel={onClose}
          onPrevious={onPrevious}
          onNext={() => stepActions[stepIndex]?.()}
          onConfirm={!!onComplete ? onComplete : onClose}
        />
      </DialogActions>
    </Dialog>
  );
};
