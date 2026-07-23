import { useState } from "react";
import { useIntl } from "react-intl";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Radio from "@mui/material/Radio";
import { BaseDialog } from "../../cool-ui/components/dialogs/BaseDialog";

import { type Withdrawal } from "../../models";

type TicketDialogProps = {
  courseName: string;
  withdrawal: Withdrawal;
  decision: "approve" | "decline";
  onDecisionChange: (decision: "approve" | "decline") => void;
  onConfirm: () => void;
  onCancel: () => void;
};

export const TicketDialog = ({
  courseName,
  withdrawal,
  decision,
  onDecisionChange,
  onConfirm,
  onCancel,
}: TicketDialogProps) => {
  const [reply, setReply] = useState("");
  const { formatMessage: f } = useIntl();

  return (
    <BaseDialog
      open={withdrawal !== undefined}
      size="sm"
      title={f({ id: "teacherDashboard.ticket.title" })}
      onConfirm={onConfirm}
      confirmBtnText={f({ id: "teacherDashboard.ticket.confirm" })}
      onCancel={onCancel}
      cancelBtnText={f({ id: "teacherDashboard.ticket.cancel" })}
    >
      <Stack spacing={3}>
        <Stack spacing={0.5}>
          <Typography variant="body2">
            {f({ id: "teacherDashboard.ticket.courseName" })}: {courseName}
          </Typography>
          <Typography variant="body2">
            {f({ id: "teacherDashboard.field.studentName" })}: {withdrawal.name}
          </Typography>
          <Typography variant="body2">
            {f({ id: "teacherDashboard.field.section" })}: {withdrawal.school}
          </Typography>
          <Typography variant="body2">
            {f({ id: "teacherDashboard.field.loginId" })}: {withdrawal.loginId}
          </Typography>
          <Typography variant="body2">
            {f({ id: "teacherDashboard.field.studentId" })}:{" "}
            {withdrawal.studentId}
          </Typography>
        </Stack>
        <Stack spacing={1}>
          <Typography variant="body2">
            {f({ id: "teacherDashboard.ticket.reason.label" })}
          </Typography>
          <TextField
            value={withdrawal.reason}
            multiline
            minRows={3}
            fullWidth
            slotProps={{ input: { readOnly: true } }}
          />
        </Stack>
        <Stack spacing={2}>
          <Typography variant="subtitle1">
            {f({ id: "teacherDashboard.ticket.reply.label" })}
          </Typography>
          <RadioGroup
            row
            value={decision}
            onChange={(e) =>
              onDecisionChange(e.target.value as "approve" | "decline")
            }
          >
            <FormControlLabel
              value="approve"
              control={<Radio />}
              label={f({ id: "teacherDashboard.withdrawal.approve" })}
            />
            <FormControlLabel
              value="decline"
              control={<Radio />}
              label={f({ id: "teacherDashboard.withdrawal.decline" })}
            />
          </RadioGroup>
          <TextField
            value={reply}
            label={f({ id: "teacherDashboard.ticket.comment" })}
            multiline
            minRows={3}
            onChange={(e) => setReply(e.target.value)}
            fullWidth
            slotProps={{ inputLabel: { shrink: true } }}
          />
        </Stack>
      </Stack>
    </BaseDialog>
  );
};
