import { useIntl } from "react-intl";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Radio from "@mui/material/Radio";
import { BaseDialog } from "../../cool-ui/components/dialogs/BaseDialog";

type TicketDialogProps = {
  open: boolean;
  decision: "approve" | "decline";
  onDecisionChange: (decision: "approve" | "decline") => void;
  onConfirm: () => void;
  onCancel: () => void;
};

export const TicketDialog = ({
  open,
  decision,
  onDecisionChange,
  onConfirm,
  onCancel,
}: TicketDialogProps) => {
  const { formatMessage: f } = useIntl();

  return (
    <BaseDialog
      open={open}
      size="sm"
      title={f({ id: "teacherDashboard.ticket.title" })}
      onConfirm={onConfirm}
      confirmBtnText={f({ id: "teacherDashboard.ticket.confirm" })}
      onCancel={onCancel}
      cancelBtnText={f({ id: "teacherDashboard.ticket.cancel" })}
    >
      <Stack spacing={3}>
        <Stack spacing={1}>
          <Typography variant="body2">
            {f({ id: "teacherDashboard.ticket.reason.label" })}
          </Typography>
          <TextField
            value="aaa"
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
          <TextField defaultValue="aaa" multiline minRows={3} fullWidth />
        </Stack>
      </Stack>
    </BaseDialog>
  );
};
