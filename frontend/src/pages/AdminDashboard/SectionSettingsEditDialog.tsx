import { useEffect, useRef, useState } from "react";
import { useIntl } from "react-intl";
import { useSnackbar } from "notistack";
import { type default as Quill } from "quill";
import dayjs, { type Dayjs } from "dayjs";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import {
  BaseDialog,
  BaseDialogMode,
} from "../../cool-ui/components/dialogs/BaseDialog";
import {
  getSectionSettings,
  updateSectionSettings,
  getSectionName,
} from "../../apis/course-withdrawal.api.mock";
import { maxNoticeInputLength } from "../constants";
import {
  WithdrawalPeriodFields,
  isTimeOrderInvalid,
} from "./WithdrawalPeriodFields";
import { NoticeEditorField } from "./NoticeEditorField";

type SectionSettingsEditDialogProps = {
  courseId: number;
  sectionId: number | null;
  onClose: () => void;
  onSaved: () => void;
};

export const SectionSettingsEditDialog = ({
  courseId,
  sectionId,
  onClose,
  onSaved,
}: SectionSettingsEditDialogProps) => {
  const { formatMessage: f } = useIntl();
  const { enqueueSnackbar } = useSnackbar();
  const quillRef = useRef<Quill>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [sectionName, setSectionName] = useState("");
  const [startAt, setStartAt] = useState<Dayjs | null>(null);
  const [endAt, setEndAt] = useState<Dayjs | null>(null);
  const [reviewDeadline, setReviewDeadline] = useState<Dayjs | null>(null);
  const [noticeDelta, setNoticeDelta] = useState<object | undefined>(undefined);
  const [noticeLength, setNoticeLength] = useState(0);

  useEffect(() => {
    if (sectionId === null) return;

    setIsLoading(true);
    setSectionName(getSectionName(sectionId) ?? "");
    getSectionSettings(courseId, sectionId)
      .then((detail) => {
        setStartAt(detail.startAt ? dayjs(detail.startAt) : null);
        setEndAt(detail.endAt ? dayjs(detail.endAt) : null);
        setReviewDeadline(
          detail.reviewDeadline ? dayjs(detail.reviewDeadline) : null,
        );
      })
      .catch(() => {
        enqueueSnackbar(f({ id: "adminDashboard.error.loadSectionFailed" }), {
          variant: "error",
        });
      })
      .finally(() => setIsLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId, sectionId]);

  if (sectionId === null) return null;

  const timeOrderInvalid = isTimeOrderInvalid(startAt, endAt, reviewDeadline);
  const isNoticeOverLimit = noticeLength > maxNoticeInputLength;

  const disableConfirmBtn =
    !startAt ||
    !endAt ||
    !reviewDeadline ||
    timeOrderInvalid ||
    isNoticeOverLimit;

  const handleConfirm = async () => {
    if (disableConfirmBtn || !startAt || !endAt || !reviewDeadline) return;

    try {
      await updateSectionSettings(courseId, sectionId, {
        startAt: startAt.toISOString(),
        endAt: endAt.toISOString(),
        reviewDeadline: reviewDeadline.toISOString(),
        noticeDelta,
      });
      onSaved();
      onClose();
    } catch {
      enqueueSnackbar(f({ id: "adminDashboard.error.updateSectionFailed" }), {
        variant: "error",
      });
    }
  };

  return (
    <BaseDialog
      open={sectionId !== null}
      size="md"
      mode={isLoading ? BaseDialogMode.Loading : BaseDialogMode.Default}
      title={"編輯班別設定"}
      confirmBtnText={"儲存"}
      cancelBtnText={"取消"}
      onConfirm={handleConfirm}
      onCancel={onClose}
      disableConfirmBtn={disableConfirmBtn}
    >
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <Box>
          <Typography
            variant="subtitle2"
            color="textSecondary"
            sx={{ fontWeight: 500, mb: 1 }}
          >
            修改班別
          </Typography>
          <Typography variant="body1">{sectionName}</Typography>
        </Box>

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

        <NoticeEditorField
          quillRef={quillRef}
          label={"停修申請注意事項"}
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
