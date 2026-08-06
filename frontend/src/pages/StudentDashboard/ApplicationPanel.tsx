import { useIntl } from "react-intl";
import Stack from "@mui/material/Stack";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import { AccordionItem } from "./AccordionItem";
import { type Application } from "./types";
import { maxTextInputLength } from "../constants";

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
  const { formatMessage: f } = useIntl();

  if (!sectionEnabled) {
    return (
      <Alert severity="info">
        <AlertTitle>
          {f({ id: "studentDashboard.panel.disabledTitle" })}
        </AlertTitle>
        {f({ id: "studentDashboard.panel.disabledDesc" })}
      </Alert>
    );
  }

  if (hasSubmitted) {
    const reasonAccordion = (
      <AccordionItem title={f({ id: "studentDashboard.field.reason" })}>
        <Stack spacing={1}>
          <Typography variant="caption" sx={{ color: "text.secondary" }}>
            {application.reason}
          </Typography>
          {application.applyTime && (
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              {f(
                { id: "studentDashboard.panel.applyTime" },
                { time: application.applyTime },
              )}
            </Typography>
          )}
        </Stack>
      </AccordionItem>
    );

    return (
      <Paper variant="outlined" sx={{ boxShadow: 1 }}>
        {reasonAccordion}
        {isReviewed && (
          <AccordionItem
            title={f({ id: "studentDashboard.panel.reviewComment" })}
          >
            <Stack spacing={0.5}>
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                {application.comment ||
                  f({ id: "studentDashboard.panel.noComment" })}
              </Typography>
              {application.approver && (
                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                  {f(
                    { id: "studentDashboard.panel.approver" },
                    { name: application.approver },
                  )}
                </Typography>
              )}
              {application.reviewTime && (
                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                  {f(
                    { id: "studentDashboard.panel.reviewTime" },
                    { time: application.reviewTime },
                  )}
                </Typography>
              )}
            </Stack>
          </AccordionItem>
        )}
      </Paper>
    );
  }

  const expireAlertJSX = (
    <Alert severity="error">
      <AlertTitle>
        {f({ id: "studentDashboard.panel.expiredTitle" })}
      </AlertTitle>
      {f({ id: "studentDashboard.panel.expiredDesc" })}
    </Alert>
  );

  const isReasonOverLimit = reason.length > maxTextInputLength;

  const applicationEditorJSX = (
    <Stack spacing={1}>
      <TextField
        multiline
        rows={4}
        label={f({ id: "studentDashboard.field.reason.label" })}
        value={reason}
        onChange={(e) => onReasonChange(e.target.value)}
        error={isReasonOverLimit}
      />
      <Typography
        variant="body1"
        sx={{
          textAlign: "right",
          fontSize: 12,
          color: isReasonOverLimit ? "error.main" : "text.secondary",
        }}
      >
        {`${reason.length} / ${maxTextInputLength}`}
      </Typography>
    </Stack>
  );

  return isAppExpired ? expireAlertJSX : applicationEditorJSX;
};
