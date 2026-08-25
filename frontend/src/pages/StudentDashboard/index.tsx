import { type ReactNode, useEffect, useState } from "react";
import { useIntl } from "react-intl";
import { useSnackbar } from "notistack";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Divider from "@mui/material/Divider";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import Skeleton from "@mui/material/Skeleton";
import CancelIcon from "@mui/icons-material/Cancel";
import { withSnackbar } from "../../cool-ui/components/alert/SnackbarAlert";
import {
  BaseDialog,
  BaseDialogMode,
} from "../../cool-ui/components/dialogs/BaseDialog";
import { LTILoadingSpinner } from "../../cool-ui/components/loading-spinner/LTILoadingSpinner";
import { StatusChip } from "../../components/StatusChip";
import { CourseTimeline } from "./CourseTimeline";
import { ApplicationPanel } from "./ApplicationPanel";
import { NoticeContent } from "./NoticeContent";
import {
  getWithdrawal,
  createWithdrawal,
} from "../../apis/course-withdrawal.api";
import { BaseWithdrawalStatus, type WithdrawalDto } from "../../models";
import { maxTextInputLength } from "../constants";

const reviewedStatus: ReadonlySet<BaseWithdrawalStatus> = new Set([
  BaseWithdrawalStatus.APPROVED,
  BaseWithdrawalStatus.DECLINED,
  BaseWithdrawalStatus.OVERDUE,
]);

const emptyNoticeDelta = {
  ops: [{ insert: "-" }],
};

type StudentDashboardProps = {
  courseId: number;
};

const StudentDashboardContent = ({ courseId }: StudentDashboardProps) => {
  const { formatMessage: f } = useIntl();
  const { enqueueSnackbar } = useSnackbar();
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingFailed, setIsLoadingFailed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitFailed, setIsSubmitFailed] = useState(false);
  const [withdrawal, setWithdrawal] = useState<WithdrawalDto | undefined>(
    undefined,
  );
  const [reason, setReason] = useState("");
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    let isCurrent = true;
    const fetchApplication = async () => {
      setIsLoading(true);
      setIsLoadingFailed(false);
      try {
        const result = await getWithdrawal(courseId);
        if (isCurrent) setWithdrawal(result);
      } catch {
        if (isCurrent) setIsLoadingFailed(true);
      } finally {
        if (isCurrent) setIsLoading(false);
      }
    };
    fetchApplication();
    return () => {
      isCurrent = false;
    };
  }, [courseId]);

  useEffect(() => {
    if (isLoadingFailed) {
      enqueueSnackbar(f({ id: "studentDashboard.error.fetchFailed" }), {
        variant: "error",
      });
    }
  }, [isLoadingFailed, enqueueSnackbar, f]);

  const isSectionDisabled =
    withdrawal?.status === BaseWithdrawalStatus.NOTENABLED;
  const isNotStarted = withdrawal?.status === BaseWithdrawalStatus.NOTSTARTED;
  const isAppExpired = withdrawal?.status === BaseWithdrawalStatus.OVERDUE;
  const hasSubmitted =
    !!withdrawal && withdrawal.status !== BaseWithdrawalStatus.NOTSUBMITTED;
  const isReviewed = !!withdrawal && reviewedStatus.has(withdrawal.status);

  const canSubmit =
    !isLoading &&
    !isLoadingFailed &&
    !hasSubmitted &&
    !isSectionDisabled &&
    !isNotStarted &&
    !isAppExpired;

  const isSubmitBtnDisabled =
    !reason.trim() ||
    reason.length > maxTextInputLength ||
    !confirmed ||
    isSubmitting;

  const onSubmit = async () => {
    if (!withdrawal?.sectionId) {
      setIsSubmitFailed(true);
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await createWithdrawal(courseId, {
        sectionId: withdrawal.sectionId,
        reason,
      });
      setWithdrawal(result);
      enqueueSnackbar(f({ id: "studentDashboard.submitSuccess.message" }), {
        variant: "success",
      });
    } catch {
      setIsSubmitFailed(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const fieldValue = (value: ReactNode, width = 120) =>
    isLoading ? (
      <Skeleton variant="text" width={width} sx={{ display: "inline-block" }} />
    ) : (
      value
    );

  const headerJSX = (
    <Stack direction="row" spacing={3} sx={{ alignItems: "center", mb: 3 }}>
      <Typography variant="h1">
        {f({ id: "studentDashboard.title" })}
      </Typography>
      {isLoading ? (
        <Skeleton variant="rounded" width={96} height={32} />
      ) : (
        withdrawal && <StatusChip status={withdrawal.status} />
      )}
    </Stack>
  );

  const courseInfoJSX = (
    <>
      <Box>
        <Typography variant="h5" sx={{ lineHeight: 1.75 }}>
          {f({ id: "studentDashboard.field.courseTitle" })}：
          {fieldValue(withdrawal?.courseName, 200)}
        </Typography>
        {withdrawal?.sectionName && (
          <Typography variant="subtitle2" sx={{ lineHeight: 1.75 }}>
            {f({ id: "studentDashboard.field.section" })}：
            {fieldValue(withdrawal.sectionName, 120)}
          </Typography>
        )}
        <Typography variant="subtitle2" sx={{ lineHeight: 1.75 }}>
          {f({ id: "studentDashboard.field.teachers" })}：
          {fieldValue(withdrawal?.teachers?.join("、"), 160)}
        </Typography>
      </Box>
      <CourseTimeline
        isLoading={isLoading}
        startAt={isSectionDisabled ? "-" : withdrawal?.startAt}
        endAt={isSectionDisabled ? "-" : withdrawal?.endAt}
        reviewDeadline={isSectionDisabled ? "-" : withdrawal?.reviewDeadline}
      />
    </>
  );

  const studentInfoJSX = (
    <Stack spacing={0.5}>
      <Typography variant="caption" sx={{ lineHeight: 1.66 }}>
        {f({ id: "studentDashboard.field.studentName" })}：
        {fieldValue(withdrawal?.studentName, 80)}
      </Typography>
      <Typography variant="caption" sx={{ lineHeight: 1.66 }}>
        {f({ id: "studentDashboard.field.loginId" })}：
        {fieldValue(withdrawal?.loginId, 160)}
      </Typography>
      <Typography variant="caption" sx={{ lineHeight: 1.66 }}>
        {f({ id: "studentDashboard.field.studentId" })}：
        {fieldValue(withdrawal?.studentId, 100)}
      </Typography>
    </Stack>
  );

  const applicationJSX = isLoading ? (
    <Skeleton variant="rounded" height={130} />
  ) : (
    withdrawal && (
      <ApplicationPanel
        isSectionDisabled={isSectionDisabled}
        isNotStarted={isNotStarted}
        hasSubmitted={hasSubmitted}
        isAppExpired={isAppExpired}
        isReviewed={isReviewed}
        application={withdrawal}
        reason={reason}
        onReasonChange={setReason}
      />
    )
  );

  const noticeJSX = (
    <Stack spacing={1}>
      <Typography variant="h6" sx={{ fontWeight: 700 }}>
        {f({ id: "studentDashboard.notice.title" })}
      </Typography>
      <Paper variant="outlined">
        {isLoading ? (
          <Skeleton variant="rounded" height={160} />
        ) : (
          <NoticeContent delta={withdrawal?.notice ?? emptyNoticeDelta} />
        )}
      </Paper>
    </Stack>
  );

  const submitCheckJSX = (
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
  );

  const submitBtnJSX = (
    <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
      <Button
        variant="contained"
        size="large"
        disabled={isSubmitBtnDisabled}
        onClick={onSubmit}
        sx={{ fontWeight: 500 }}
      >
        {f({ id: "studentDashboard.submit" })}
      </Button>
    </Box>
  );

  const submitFailDialogJSX = (
    <BaseDialog
      open={isSubmitFailed}
      size="xs"
      mode={BaseDialogMode.Info}
      title={f({ id: "studentDashboard.submitError.title" })}
      confirmBtnText={f({ id: "studentDashboard.submitError.confirm" })}
      onConfirm={() => setIsSubmitFailed(false)}
    >
      <Typography variant="body1">
        <CancelIcon color="error" fontSize="small" />
        {f({ id: "studentDashboard.submitError.message" })}
      </Typography>
    </BaseDialog>
  );

  return (
    <Box>
      {headerJSX}
      <Stack spacing={3}>
        <Stack spacing={3}>
          <Stack spacing={2}>
            {courseInfoJSX}
            {studentInfoJSX}
            {applicationJSX}
          </Stack>
          <Divider />
          <Stack spacing={2}>
            {noticeJSX}
            {canSubmit && submitCheckJSX}
          </Stack>
        </Stack>
        {canSubmit && submitBtnJSX}
      </Stack>
      {submitFailDialogJSX}
      <LTILoadingSpinner show={isSubmitting} />
    </Box>
  );
};

export const StudentDashboard = withSnackbar(StudentDashboardContent);
