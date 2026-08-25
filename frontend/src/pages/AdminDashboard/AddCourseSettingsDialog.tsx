import { useRef, useState } from "react";
import { useIntl } from "react-intl";
import { type default as Quill } from "quill";
import { type Dayjs } from "dayjs";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Alert from "@mui/material/Alert";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableBody from "@mui/material/TableBody";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import { BaseDialog } from "../../cool-ui/components/dialogs/BaseDialog";
import { findCourseById } from "../../apis/course-withdrawal.api.mock";
import { maxNoticeInputLength } from "../constants";
import {
  WithdrawalPeriodFields,
  isTimeOrderInvalid,
} from "./WithdrawalPeriodFields";
import { NoticeEditorField } from "./NoticeEditorField";

type AddedCourse = {
  courseId: number;
  semester: string;
  courseName: string;
};

export type BatchAddCourseWithdrawalSettingsInput = {
  courses: AddedCourse[];
  startAt: string;
  endAt: string;
  reviewDeadline: string;
  noticeDelta?: object;
};

type AddCourseSettingsDialogProps = {
  open: boolean;
  existingCourseIds: number[];
  onConfirm: (input: BatchAddCourseWithdrawalSettingsInput) => void;
  onCancel: () => void;
};

type AlertState = {
  severity: "error" | "warning";
  message: string;
};

export const AddCourseSettingsDialog = ({
  open,
  existingCourseIds,
  onConfirm,
  onCancel,
}: AddCourseSettingsDialogProps) => {
  const { formatMessage: f } = useIntl();
  const quillRef = useRef<Quill>(null);

  const [courseIdInput, setCourseIdInput] = useState("");
  const [added, setAdded] = useState<AddedCourse[]>([]);
  const [alert, setAlert] = useState<AlertState | null>(null);

  const [startAt, setStartAt] = useState<Dayjs | null>(null);
  const [endAt, setEndAt] = useState<Dayjs | null>(null);
  const [reviewDeadline, setReviewDeadline] = useState<Dayjs | null>(null);
  const [noticeDelta, setNoticeDelta] = useState<object | undefined>(undefined);
  const [noticeLength, setNoticeLength] = useState(0);

  const reset = () => {
    setCourseIdInput("");
    setAdded([]);
    setAlert(null);
    setStartAt(null);
    setEndAt(null);
    setReviewDeadline(null);
    setNoticeDelta(undefined);
    setNoticeLength(0);
    quillRef.current?.setText("");
  };

  const handleAddCourse = () => {
    const idText = courseIdInput.trim();
    if (!idText) return;

    if (!/^\d+$/.test(idText)) {
      setAlert({
        severity: "error",
        message: f({ id: "adminDashboard.addDialog.courseIdInvalid" }),
      });
      return;
    }

    const courseId = Number(idText);
    if (added.some((c) => c.courseId === courseId)) {
      setAlert({
        severity: "error",
        message: f({ id: "adminDashboard.addDialog.courseAlreadyAdded" }),
      });
      return;
    }
    if (existingCourseIds.includes(courseId)) {
      setAlert({
        severity: "error",
        message: f({ id: "adminDashboard.addDialog.courseAlreadyEnabled" }),
      });
      return;
    }

    const course = findCourseById(courseId);
    if (!course) {
      setAlert({
        severity: "warning",
        message: f({ id: "adminDashboard.addDialog.courseNotFound" }),
      });
      return;
    }

    setAlert(null);
    setCourseIdInput("");
    setAdded((prev) => [
      ...prev,
      {
        courseId,
        semester: course.semester,
        courseName: course.courseName,
      },
    ]);
  };

  const handleRemoveCourse = (courseId: number) => {
    setAdded((prev) => prev.filter((c) => c.courseId !== courseId));
  };

  const timeOrderInvalid = isTimeOrderInvalid(startAt, endAt, reviewDeadline);
  const isNoticeOverLimit = noticeLength > maxNoticeInputLength;

  const disableConfirmBtn =
    added.length === 0 ||
    !startAt ||
    !endAt ||
    !reviewDeadline ||
    timeOrderInvalid ||
    isNoticeOverLimit;

  const handleCancel = () => {
    reset();
    onCancel();
  };

  const handleConfirm = () => {
    if (disableConfirmBtn || !startAt || !endAt || !reviewDeadline) return;

    onConfirm({
      courses: added,
      startAt: startAt.toISOString(),
      endAt: endAt.toISOString(),
      reviewDeadline: reviewDeadline.toISOString(),
      noticeDelta,
    });
    reset();
  };

  return (
    <BaseDialog
      open={open}
      size="md"
      title={"新增開放停修課程"}
      confirmBtnText={"完成"}
      cancelBtnText={"取消"}
      onConfirm={handleConfirm}
      onCancel={handleCancel}
      disableConfirmBtn={disableConfirmBtn}
    >
      <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
        {alert && (
          <Alert severity={alert.severity} onClose={() => setAlert(null)}>
            {alert.message}
          </Alert>
        )}

        <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mb: 2 }}>
          <Stack direction="row" spacing={2} sx={{ alignItems: "flex-start" }}>
            <TextField
              label={"進行中學期的課程ID"}
              value={courseIdInput}
              onChange={(e) => setCourseIdInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAddCourse();
              }}
              sx={{ width: 220 }}
            />
            <Button
              onClick={handleAddCourse}
              variant="outlined"
              color="primary"
              startIcon={<AddIcon />}
              sx={{ mt: 0.5 }}
            >
              加入
            </Button>
          </Stack>

          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ width: 60, padding: "4px", pr: 2 }}>
                  <Typography variant="caption" color="textSecondary">
                    課程 ID
                  </Typography>
                </TableCell>
                <TableCell sx={{ width: 150, padding: "4px", pr: 2 }}>
                  <Typography variant="caption" color="textSecondary">
                    學期
                  </Typography>
                </TableCell>
                <TableCell sx={{ padding: "4px" }}>
                  <Typography variant="caption" color="textSecondary">
                    課程名稱
                  </Typography>
                </TableCell>
                <TableCell sx={{ width: 40 }} />
              </TableRow>
            </TableHead>
            <TableBody>
              {added.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    您尚未加入任何課程
                  </TableCell>
                </TableRow>
              ) : (
                added.map((c) => (
                  <TableRow key={c.courseId}>
                    <TableCell>{c.courseId}</TableCell>
                    <TableCell>{c.semester}</TableCell>
                    <TableCell>{c.courseName}</TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => handleRemoveCourse(c.courseId)}
                      >
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Box>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <Typography variant="subtitle1" color="textSecondary">
            預設申請與審核期間
          </Typography>
          <WithdrawalPeriodFields
            startAt={startAt}
            endAt={endAt}
            reviewDeadline={reviewDeadline}
            onStartAtChange={setStartAt}
            onEndAtChange={setEndAt}
            onReviewDeadlineChange={setReviewDeadline}
          />
        </Box>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <Typography variant="subtitle1" color="textSecondary">
            預設停修申請注意事項
          </Typography>
          <NoticeEditorField
            quillRef={quillRef}
            noticeLength={noticeLength}
            onTextChange={(_contents, _delta, _source, editor) => {
              setNoticeDelta(editor.getContents());
              setNoticeLength(editor.getText().trim().length);
            }}
          />
        </Box>
      </Box>
    </BaseDialog>
  );
};
