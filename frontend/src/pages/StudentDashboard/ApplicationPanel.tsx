import { useIntl } from "react-intl";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import { AccordionItem } from "./AccordionItem";
import { maxTextInputLength } from "../constants";
import { formatDate } from "../util";

type Application = {
  reason?: string;
  submittedAt?: string;
  reviewComment?: string;
  reviewerName?: string;
  reviewedAt?: string;
};

type ApplicationPanelProps = {
  isSectionDisabled: boolean;
  isNotStarted: boolean;
  hasSubmitted: boolean;
  isAppExpired: boolean;
  isReviewed: boolean;
  application: Application;
  reason: string;
  onReasonChange: (value: string) => void;
};

export const ApplicationPanel = ({
  isSectionDisabled,
  isNotStarted,
  hasSubmitted,
  isAppExpired,
  isReviewed,
  application,
  reason,
  onReasonChange,
}: ApplicationPanelProps) => {
  const { formatMessage: f } = useIntl();

  const notEnabledAlertJSX = (
    <Alert severity="info" variant="outlined">
      <AlertTitle>
        {f({ id: "studentDashboard.panel.disabledTitle" })}
      </AlertTitle>
      {f({ id: "studentDashboard.panel.disabledDesc" })}
    </Alert>
  );

  const notStartedAlertJSX = (
    <Alert severity="info" variant="outlined">
      <AlertTitle>
        {f({ id: "studentDashboard.panel.notStartedTitle" })}
      </AlertTitle>
      {f({ id: "studentDashboard.panel.notStartedDesc" })}
    </Alert>
  );

  const expireAlertJSX = (
    <Alert severity="error" variant="outlined">
      <AlertTitle>
        {f({ id: "studentDashboard.panel.expiredTitle" })}
      </AlertTitle>
      {f({ id: "studentDashboard.panel.expiredDesc" })}
    </Alert>
  );

  const reasonAccordion = (
    <AccordionItem title={f({ id: "studentDashboard.field.reason" })}>
      <Stack spacing={1}>
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          {application.reason}
        </Typography>
        {application.submittedAt && (
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            {f(
              { id: "studentDashboard.panel.submittedAt" },
              { time: formatDate(application.submittedAt), br: () => <br /> },
            )}
          </Typography>
        )}
      </Stack>
    </AccordionItem>
  );

  const reviewCommentJSX = (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <Paper variant="outlined">{reasonAccordion}</Paper>
      {isReviewed && (
        <Paper variant="outlined">
          <AccordionItem
            title={f({ id: "studentDashboard.panel.reviewComment" })}
          >
            <Stack spacing={0.5}>
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                {application.reviewComment ||
                  f({ id: "studentDashboard.panel.noComment" })}
              </Typography>
              {application.reviewerName && (
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  {f(
                    { id: "studentDashboard.panel.reviewer" },
                    { name: application.reviewerName, br: () => <br /> },
                  )}
                </Typography>
              )}
              {application.reviewedAt && (
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  {f(
                    { id: "studentDashboard.panel.reviewedAt" },
                    { time: formatDate(application.reviewedAt) },
                  )}
                </Typography>
              )}
            </Stack>
          </AccordionItem>
        </Paper>
      )}
    </Box>
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

  if (isSectionDisabled) {
    return notEnabledAlertJSX;
  } else if (isNotStarted) {
    return notStartedAlertJSX;
  } else if (isAppExpired) {
    return expireAlertJSX;
  } else if (hasSubmitted) {
    return reviewCommentJSX;
  } else {
    return applicationEditorJSX;
  }
};
