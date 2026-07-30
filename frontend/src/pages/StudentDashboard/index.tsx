import { useEffect, useState } from "react";
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
import CircularProgress from "@mui/material/CircularProgress";
import { getStudent } from "../../apis/course-withdrawal.api";
import { NoticeContent } from "./NoticeContent";
import { CourseTimeline } from "./CourseTimeline";
import { ApplicationPanel } from "./ApplicationPanel";
import { type CourseSettings } from "./types";
import { type Withdrawal } from "../../models";

type StudentDashboardProps = {
  studentId: number;
  courseSettings: CourseSettings;
};

export const StudentDashboard = ({
  studentId,
  courseSettings,
}: StudentDashboardProps) => {
  const { formatMessage: f } = useIntl();
  const [application, setApplication] = useState<Withdrawal | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const [reason, setReason] = useState("");
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    const fetchApplication = async () => {
      setIsLoading(true);
      const result = await getStudent({ id: studentId });
      setApplication(result);
      setIsLoading(false);
    };
    fetchApplication();
  }, [studentId]);

  if (isLoading || !application) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          padding: "64px 24px",
        }}
      >
        <CircularProgress size={32} />
      </Box>
    );
  }

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
        <Chip
          size="medium"
          label={application.status}
          sx={{ color: "text.secondary" }}
        />
      </Stack>

      <Stack spacing={3}>
        <Stack spacing={3}>
          <Stack spacing={2}>
            <Box>
              <Typography variant="subtitle1" sx={{ lineHeight: 1.75 }}>
                {f({ id: "studentDashboard.field.courseTitle" })}：
                {courseSettings.name}
              </Typography>
              <Typography variant="subtitle2" sx={{ lineHeight: 1.75 }}>
                {f({ id: "studentDashboard.field.section" })}：
                {courseSettings.section}
              </Typography>
              <Typography variant="subtitle2" sx={{ lineHeight: 1.75 }}>
                {f({ id: "studentDashboard.field.teachers" })}：
                {courseSettings.teachers.join("、")}
              </Typography>
            </Box>

            <CourseTimeline
              sectionEnabled={isSectionEnabled}
              st={courseSettings.st}
              et={courseSettings.et}
              ad={courseSettings.ad}
            />

            <Stack spacing={0.5}>
              <Typography variant="caption" sx={{ lineHeight: 1.66 }}>
                {f({ id: "studentDashboard.field.studentName" })}：
                {application.name}
              </Typography>
              <Typography variant="caption" sx={{ lineHeight: 1.66 }}>
                {f({ id: "studentDashboard.field.loginId" })}：
                {application.loginId}
              </Typography>
              <Typography variant="caption" sx={{ lineHeight: 1.66 }}>
                {f({ id: "studentDashboard.field.studentId" })}：
                {application.studentId}
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

          <Stack spacing={2}>
            <Stack spacing={1}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                {f({ id: "studentDashboard.notice.title" })}
              </Typography>
              <Paper variant="outlined">
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
        </Stack>

        {canSubmit && (
          <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
            <Button
              variant="contained"
              disabled={isDisabled}
              onClick={onSubmit}
              sx={{ fontWeight: 500 }}
            >
              {f({ id: "studentDashboard.submit" })}
            </Button>
          </Box>
        )}
      </Stack>
    </Box>
  );
};
