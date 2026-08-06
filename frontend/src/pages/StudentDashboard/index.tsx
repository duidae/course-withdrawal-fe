import { useEffect, useState } from "react";
import { useIntl } from "react-intl";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Divider from "@mui/material/Divider";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import CircularProgress from "@mui/material/CircularProgress";
import { getStudent } from "../../apis/course-withdrawal.api";
import { StatusChip } from "../../components/StatusChip";
import { NoticeContent } from "./NoticeContent";
import { CourseTimeline } from "./CourseTimeline";
import { ApplicationPanel } from "./ApplicationPanel";
import { type CourseSettings } from "./types";
import { BaseWithdrawalStatus, type Withdrawal } from "../../models";
import { maxTextInputLength } from "../constants";

const reviewedStatus: ReadonlySet<BaseWithdrawalStatus> = new Set([
  BaseWithdrawalStatus.APPROVED,
  BaseWithdrawalStatus.DECLINED,
  BaseWithdrawalStatus.OVERDUE,
]);

type StudentDashboardProps = {
  studentId: number;
  courseSettings: CourseSettings;
};

export const StudentDashboard = ({
  studentId,
  courseSettings,
}: StudentDashboardProps) => {
  const { formatMessage: f } = useIntl();
  const [student, setStudent] = useState<Withdrawal | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const [reason, setReason] = useState("");
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    const fetchApplication = async () => {
      setIsLoading(true);
      const result = await getStudent({ id: studentId });
      setStudent(result);
      setIsLoading(false);
    };
    fetchApplication();
  }, [studentId]);

  if (isLoading || !student) {
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

  const hasSubmitted = student.status !== BaseWithdrawalStatus.NOTSUBMITTED;
  const isDisabled = !reason.trim() || reason.length > maxTextInputLength || !confirmed;
  const isSectionEnabled = courseSettings.isEnabled !== false;
  const isAppExpired =
    !hasSubmitted && isSectionEnabled
      ? false
      : !hasSubmitted &&
        !!courseSettings.et &&
        new Date(courseSettings.et.replaceAll("/", "-").replace(" ", "T")) <
          new Date();
  const isReviewed = reviewedStatus.has(student.status);

  const canSubmit =
    !hasSubmitted &&
    !isAppExpired &&
    isSectionEnabled;

  const onSubmit = () => {
    console.log("submit");
  };

  return (
    <Box sx={{ padding: "24px 24px 64px" }}>
      <Stack direction="row" spacing={3} sx={{ alignItems: "center", mb: 3 }}>
        <Typography variant="h1">
          {f({ id: "studentDashboard.title" })}
        </Typography>
        <StatusChip status={student.status} />
      </Stack>

      <Stack spacing={3}>
        <Stack spacing={3}>
          <Stack spacing={2}>
            <Box>
              <Typography variant="h5" sx={{ lineHeight: 1.75 }}>
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
                {student.name}
              </Typography>
              <Typography variant="caption" sx={{ lineHeight: 1.66 }}>
                {f({ id: "studentDashboard.field.loginId" })}：{student.loginId}
              </Typography>
              <Typography variant="caption" sx={{ lineHeight: 1.66 }}>
                {f({ id: "studentDashboard.field.studentId" })}：
                {student.studentId}
              </Typography>
            </Stack>

            <ApplicationPanel
              sectionEnabled={isSectionEnabled}
              hasSubmitted={hasSubmitted}
              isAppExpired={isAppExpired}
              isReviewed={isReviewed}
              application={student}
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
                    size="small"
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
              size="large"
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
