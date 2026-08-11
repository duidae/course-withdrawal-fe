import { useState } from "react";
import { useIntl } from "react-intl";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Radio from "@mui/material/Radio";
import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import { BaseDialog } from "../../cool-ui/components/dialogs/BaseDialog";
import { BaseWithdrawalStatus } from "../../models";
import { type StudentRow } from "./types";
import { maxTextInputLength } from "../constants";

export const ReviewAction = {
  APPROVE: "approve",
  DECLINE: "decline",
} as const;

export type ReviewAction =
  (typeof ReviewAction)[keyof typeof ReviewAction];

type WithdrawalReviewDialogProps = {
  withdrawal: StudentRow;
  action: ReviewAction;
  onActionChange: (action: ReviewAction) => void;
  onConfirm: (reviewComment: string) => void;
  onCancel: () => void;
};

// TODO: overdue

export const WithdrawalReviewDialog = ({
  withdrawal,
  action,
  onActionChange,
  onConfirm,
  onCancel,
}: WithdrawalReviewDialogProps) => {
  const [reply, setReply] = useState("");
  const { formatMessage: f } = useIntl();
  const isReplyOverLimit = reply.length > maxTextInputLength;

  console.log(action);
  const isOverdue = withdrawal.status === BaseWithdrawalStatus.OVERDUE;

  return (
    <BaseDialog
      open={withdrawal !== undefined}
      size="sm"
      title={f({ id: "teacherDashboard.ticket.title" })}
      onConfirm={() => onConfirm(reply)}
      confirmBtnText={f({ id: "teacherDashboard.ticket.confirm" })}
      onCancel={onCancel}
      cancelBtnText={f({ id: "teacherDashboard.ticket.cancel" })}
      disableConfirmBtn={isOverdue || isReplyOverLimit}
    >
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <Typography variant="body1">
            {f({ id: "teacherDashboard.ticket.courseName" })}: {withdrawal.courseName}
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            <Typography variant="body2">
              {f({ id: "teacherDashboard.field.studentName" })}:{" "}
              {withdrawal.studentName}
            </Typography>
            <Typography variant="body2">
              {f({ id: "teacherDashboard.field.section" })}: {withdrawal.sectionName}
            </Typography>
            <Typography variant="body2">
              {f({ id: "teacherDashboard.field.loginId" })}:{" "}
              {withdrawal.loginId}
            </Typography>
            <Typography variant="body2">
              {f({ id: "teacherDashboard.field.studentId" })}:{" "}
              {withdrawal.studentId}
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          <Typography variant="body2">
            {f({ id: "teacherDashboard.ticket.reason.label" })}
          </Typography>
          <Paper
            variant="outlined"
            sx={{
              padding: 1.5,
              minHeight: "4.5em",
              fontSize: 14,
              color: "text.secondary",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
            }}
          >
            {withdrawal.reason}
          </Paper>
        </Box>
        {isOverdue && (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Alert severity="warning">
              <AlertTitle>
                {f({ id: "teacherDashboard.ticket.overdue.title" })}
              </AlertTitle>
              {f({ id: "teacherDashboard.ticket.overdue.desc" })}
            </Alert>
          </Box>
        )}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            <Typography variant="subtitle1">
              {f({ id: "teacherDashboard.ticket.reply.label" })}
            </Typography>
            <RadioGroup
              row
              value={undefined} // TODO: fix logic in radio button
              onChange={(e) =>
                onActionChange(e.target.value as ReviewAction)
              }
            >
              <FormControlLabel
                disabled={isOverdue}
                value={ReviewAction.APPROVE}
                control={<Radio />}
                label={f({ id: "teacherDashboard.withdrawal.approve" })}
              />
              <FormControlLabel
                disabled={isOverdue}
                value={ReviewAction.DECLINE}
                control={<Radio />}
                label={f({ id: "teacherDashboard.withdrawal.decline" })}
              />
            </RadioGroup>
          </Box>
          <TextField
            disabled={isOverdue}
            value={reply}
            label={f({ id: "teacherDashboard.ticket.comment" })}
            multiline
            minRows={3}
            onChange={(e) => setReply(e.target.value)}
            fullWidth
            error={isReplyOverLimit}
            slotProps={{ inputLabel: { shrink: true } }}
          />
          <Typography
            variant="caption"
            color={isReplyOverLimit ? "error" : "textSecondary"}
            sx={{ alignSelf: "flex-end" }}
          >
            {reply.length} / {maxTextInputLength}
          </Typography>
        </Box>
      </Box>
    </BaseDialog>
  );
};

type BatchReviewDialog = {
  actionType: ReviewAction;
  onConfirm: (reviewComment: string) => void;
  onCancel: () => void;
};

export const BatchReviewDialog = ({
  actionType,
  onConfirm,
  onCancel,
}: BatchReviewDialog) => {
  const [reply, setReply] = useState("");
  const { formatMessage: f } = useIntl();
  const isReplyOverLimit = reply.length > maxTextInputLength;

  return (
    <BaseDialog
      open={true}
      size="sm"
      title={f({
        id:
          actionType === ReviewAction.APPROVE
            ? "teacherDashboard.batch.approve.title"
            : "teacherDashboard.batch.decline.title",
      })}
      onConfirm={() => onConfirm(reply)}
      confirmBtnText={f({ id: "teacherDashboard.batch.confirm" })}
      onCancel={onCancel}
      cancelBtnText={f({ id: "teacherDashboard.ticket.cancel" })}
      disableConfirmBtn={isReplyOverLimit}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 2,
          height: "100%",
        }}
      >
        <Typography variant="body1">
          {f(
            {
              id:
                actionType === ReviewAction.APPROVE
                  ? "teacherDashboard.batch.approve.msg"
                  : "teacherDashboard.batch.decline.msg",
            },
            {
              br: () => <br />,
            },
          )}
        </Typography>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 1,
            height: "100%",
          }}
        >
          <TextField
            value={reply}
            label={f({ id: "teacherDashboard.batch.comment.label" })}
            multiline
            onChange={(e) => setReply(e.target.value)}
            fullWidth
            error={isReplyOverLimit}
            slotProps={{
              inputLabel: { shrink: true },
            }}
            sx={{
              flex: 1,
              "& .MuiInputBase-root": {
                height: "100%",
                alignItems: "flex-start",
              },
              "& .MuiInputBase-input": {
                height: "100% !important",
                overflow: "auto",
              },
            }}
          />
          <Typography
            variant="caption"
            color={isReplyOverLimit ? "error" : "textSecondary"}
            sx={{ alignSelf: "flex-end" }}
          >
            {reply.length} / {maxTextInputLength}
          </Typography>
        </Box>
      </Box>
    </BaseDialog>
  );
};
