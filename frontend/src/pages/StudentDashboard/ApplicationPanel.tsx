import Stack from "@mui/material/Stack";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import { AccordionItem } from "./AccordionItem";
import { type Application } from "./types";

type ApplicationPanelProps = {
  sectionEnabled: boolean;
  hasSubmitted: boolean;
  isAppExpired: boolean;
  isReviewed: boolean;
  application: Application;
  reason: string;
  onReasonChange: (value: string) => void;
};

export const ApplicationPanel = ({
  sectionEnabled,
  hasSubmitted,
  isAppExpired,
  isReviewed,
  application,
  reason,
  onReasonChange,
}: ApplicationPanelProps) => {
  if (!sectionEnabled) {
    return (
      <Alert severity="info">
        <AlertTitle>停修功能未開放</AlertTitle>
        您無法透過 COOL 申請課程停修，請逕洽您的校務選課系統辦理。
      </Alert>
    );
  }

  if (hasSubmitted) {
    const reasonAccordion = (
      <AccordionItem title="停修原因">
        <Stack spacing={1}>
          <Typography variant="caption">{application.reason}</Typography>
          {application.applyTime && (
            <Typography variant="caption">
              - 申請時間：{application.applyTime}
            </Typography>
          )}
        </Stack>
      </AccordionItem>
    );

    return (
      <Paper variant="outlined" sx={{ boxShadow: 1 }}>
        {reasonAccordion}
        {isReviewed && (
          <AccordionItem title="審核評語">
            <Stack spacing={0.5}>
              <Typography variant="caption">
                {application.comment || "- 無"}
              </Typography>
              {application.approver && (
                <Typography variant="caption">
                  - 審核人 {application.approver}
                </Typography>
              )}
              {application.reviewTime && (
                <Typography variant="caption">
                  - 審核時間：{application.reviewTime}
                </Typography>
              )}
            </Stack>
          </AccordionItem>
        )}
      </Paper>
    );
  }

  if (isAppExpired) {
    return (
      <Alert severity="error">
        <AlertTitle>已超過停修申請時間</AlertTitle>
        您已無法透過 COOL 申請此課程停修，請聯繫課程授課教師。
      </Alert>
    );
  }

  return (
    <Stack spacing={1}>
      <TextField
        multiline
        rows={4}
        label="停修原因"
        value={reason}
        onChange={(e) =>
          e.target.value.length <= 500 && onReasonChange(e.target.value)
        }
      />
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ textAlign: "right" }}
      >
        {reason.length} / 500
      </Typography>
    </Stack>
  );
};
