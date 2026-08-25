import { useRef, useState } from "react";
import { useIntl } from "react-intl";
import { useSnackbar } from "notistack";
import { type default as Quill } from "quill";
import { type Dayjs } from "dayjs";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import { BaseDialog } from "../../cool-ui/components/dialogs/BaseDialog";
import { batchUpdateCourseSettings } from "../../apis/course-withdrawal.api.mock";
import { maxNoticeInputLength } from "../constants";
import {
  WithdrawalPeriodFields,
  isTimeOrderInvalid,
} from "./WithdrawalPeriodFields";
import { NoticeEditorField } from "./NoticeEditorField";

type BatchSettingsEditDialogProps = {
  open: boolean;
  courseId: number;
  sectionIds: number[];
  onClose: () => void;
  onSaved: () => void;
};

export const BatchSettingsEditDialog = ({
  open,
  courseId,
  sectionIds,
  onClose,
  onSaved,
}: BatchSettingsEditDialogProps) => {
  const { formatMessage: f } = useIntl();
  const { enqueueSnackbar } = useSnackbar();
  const quillRef = useRef<Quill>(null);

  const [startAt, setStartAt] = useState<Dayjs | null>(null);
  const [endAt, setEndAt] = useState<Dayjs | null>(null);
  const [reviewDeadline, setReviewDeadline] = useState<Dayjs | null>(null);
  const [overrideNotice, setOverrideNotice] = useState(false);
  const [noticeDelta, setNoticeDelta] = useState<object | undefined>(undefined);
  const [noticeLength, setNoticeLength] = useState(0);

  const reset = () => {
    setStartAt(null);
    setEndAt(null);
    setReviewDeadline(null);
    setOverrideNotice(false);
    setNoticeDelta(undefined);
    setNoticeLength(0);
    quillRef.current?.setText("");
  };

  const timeOrderInvalid = isTimeOrderInvalid(startAt, endAt, reviewDeadline);
  const isNoticeOverLimit =
    overrideNotice && noticeLength > maxNoticeInputLength;

  const disableConfirmBtn =
    !startAt ||
    !endAt ||
    !reviewDeadline ||
    timeOrderInvalid ||
    isNoticeOverLimit;

  const handleCancel = () => {
    reset();
    onClose();
  };

  const handleConfirm = async () => {
    if (disableConfirmBtn || !startAt || !endAt || !reviewDeadline) return;

    try {
      await batchUpdateCourseSettings(courseId, {
        sectionIds,
        startAt: startAt.toISOString(),
        endAt: endAt.toISOString(),
        reviewDeadline: reviewDeadline.toISOString(),
        ...(overrideNotice ? { noticeDelta } : {}),
      });
      onSaved();
      reset();
      onClose();
    } catch {
      enqueueSnackbar(f({ id: "adminDashboard.error.updateSectionFailed" }), {
        variant: "error",
      });
    }
  };

  return (
    <BaseDialog
      open={open}
      size="md"
      title={"批次編輯設定"}
      confirmBtnText={"儲存"}
      cancelBtnText={"取消"}
      onConfirm={handleConfirm}
      onCancel={handleCancel}
      disableConfirmBtn={disableConfirmBtn}
    >
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <Typography
          variant="subtitle2"
          color="textSecondary"
          sx={{ fontWeight: 500 }}
        >
          修改申請停修期間
        </Typography>

        <WithdrawalPeriodFields
          startAt={startAt}
          endAt={endAt}
          reviewDeadline={reviewDeadline}
          onStartAtChange={setStartAt}
          onEndAtChange={setEndAt}
          onReviewDeadlineChange={setReviewDeadline}
        />

        <FormControlLabel
          control={
            <Checkbox
              checked={overrideNotice}
              onChange={(e) => setOverrideNotice(e.target.checked)}
            />
          }
          label="覆寫注意事項"
        />

        <NoticeEditorField
          quillRef={quillRef}
          label={"停修申請注意事項"}
          disabled={!overrideNotice}
          noticeLength={noticeLength}
          onTextChange={(_contents, _delta, _source, editor) => {
            setNoticeDelta(editor.getContents());
            setNoticeLength(editor.getText().trim().length);
          }}
        />
      </Box>
    </BaseDialog>
  );
};
