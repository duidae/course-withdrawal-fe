import { useState } from "react";
import { useIntl } from "react-intl";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Divider from "@mui/material/Divider";
import Chip from "@mui/material/Chip";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import { NoticeContent } from "./NoticeContent";
import { CourseTimeline } from "./CourseTimeline";
import { ApplicationPanel } from "./ApplicationPanel";
import { type CourseSettings } from "./types";

export type Application = {
  status: string;
  reason?: string;
  applyTime?: string;
  comment?: string;
  approver?: string;
  reviewTime?: string;
};

type StudentDashboardProps = {
  application: Application;
  courseSettings: CourseSettings;
};

export const StudentDashboard = ({
  application,
  courseSettings,
}: StudentDashboardProps) => {
  const { formatMessage: f } = useIntl();
  const [reason, setReason] = useState("");
  const [confirmed, setConfirmed] = useState(false);

  const hasSubmitted = application.status !== "未申請";
  const isDisabled = !reason.trim() || !confirmed;
  const isSectionEnabled = courseSettings.isEnabled !== false;
  const isAppExpired =
    !hasSubmitted && isSectionEnabled
      ? false
      : !hasSubmitted &&
        !!courseSettings.et &&
        new Date(courseSettings.et.replaceAll("/", "-").replace(" ", "T")) <
          new Date();
  const isReviewed =
    application.status === "同意" ||
    application.status === "不同意" ||
    application.status === "逾期審核";

  const canSubmit = !hasSubmitted && !isAppExpired && isSectionEnabled;

  const onSubmit = () => {
    console.log("submit");
  };

  return (
    <Box sx={{ padding: "24px 24px 64px" }}>
      <Stack direction="row" spacing={3} sx={{ alignItems: "center", mb: 3 }}>
        <Typography variant="h1">
          {f({ id: "studentDashboard.title" })}
        </Typography>
        <Chip label={application.status} />
      </Stack>

      <Stack spacing={2}>
        <Stack spacing={5}>
          <Stack spacing={2}>
            <Box>
              <Typography variant="body1" sx={{ lineHeight: 1.75 }}>
                {f({ id: "studentDashboard.field.courseTitle" })}：深度學習 Deep
                Learning
              </Typography>
              <Typography variant="body1" sx={{ lineHeight: 1.75 }}>
                {f({ id: "studentDashboard.field.section" })}：國立成功大學
              </Typography>
              <Typography variant="body1" sx={{ lineHeight: 1.75 }}>
                {f({ id: "studentDashboard.field.teachers" })}
                ：彭文孝、陳永昇、謝秉均
              </Typography>
            </Box>

            <CourseTimeline
              sectionEnabled={isSectionEnabled}
              st={courseSettings.st}
              et={courseSettings.et}
              ad={courseSettings.ad}
            />

            <Stack spacing={0.25}>
              <Typography variant="caption" sx={{ lineHeight: 1.66 }}>
                {f({ id: "studentDashboard.field.studentName" })}：陳O佑
              </Typography>
              <Typography variant="caption" sx={{ lineHeight: 1.66 }}>
                {f({ id: "studentDashboard.field.loginId" })}
                ：F34097391@mail.ncku.edu.tw
              </Typography>
              <Typography variant="caption" sx={{ lineHeight: 1.66 }}>
                {f({ id: "studentDashboard.field.studentId" })}：成大_F34097391
              </Typography>
            </Stack>

            <ApplicationPanel
              sectionEnabled={isSectionEnabled}
              hasSubmitted={hasSubmitted}
              isAppExpired={isAppExpired}
              isReviewed={isReviewed}
              application={application}
              reason={reason}
              onReasonChange={setReason}
            />
          </Stack>

          <Divider />

          <Stack spacing={1}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              {f({ id: "studentDashboard.notice.title" })}
            </Typography>
            <Paper variant="outlined" sx={{ padding: 2 }}>
              {courseSettings.notes ? (
                <Box
                  className="ql-editor"
                  sx={{
                    padding: 0,
                    fontSize: 16,
                    lineHeight: 1.5,
                    minHeight: "auto",
                  }}
                  dangerouslySetInnerHTML={{ __html: courseSettings.notes }}
                />
              ) : (
                <NoticeContent />
              )}
            </Paper>
          </Stack>

          {canSubmit && (
            <FormControlLabel
              control={
                <Checkbox
                  checked={confirmed}
                  onChange={(e) => setConfirmed(e.target.checked)}
                />
              }
              label={
                <Typography variant="caption">
                  {f({ id: "studentDashboard.checkbox.confirm" })}
                  <Box component="span" sx={{ color: "error.light" }}>
                    *
                  </Box>
                </Typography>
              }
            />
          )}
        </Stack>

        {canSubmit && (
          <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
            <Button
              variant="contained"
              disabled={isDisabled}
              onClick={onSubmit}
            >
              {f({ id: "studentDashboard.submit" })}
            </Button>
          </Box>
        )}
      </Stack>
    </Box>
  );
};
