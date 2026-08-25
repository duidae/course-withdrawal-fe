import { type ReactNode, type FC, useEffect, useRef, useState } from "react";
import { useIntl } from "react-intl";
import * as XLSX from "xlsx";
import { useSnackbar } from "notistack";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import CancelIcon from "@mui/icons-material/Cancel";
import { withSnackbar } from "../../cool-ui/components/alert/SnackbarAlert";
import {
  BaseDialog,
  BaseDialogMode,
} from "../../cool-ui/components/dialogs/BaseDialog";
import { LTILoadingSpinner } from "../../cool-ui/components/loading-spinner/LTILoadingSpinner";
import { FilterBar, WithdrawalStatusOption } from "./FilterBar";
import { WithdrawalTable, type EmptyMessageType } from "./WithdrawalTable";
import {
  WithdrawalReviewDialog,
  BatchReviewDialog,
  ReviewAction,
} from "./ReviewDialog";
import { type StudentRow } from "./types";
import {
  getWithdrawals,
  batchReviewWithdrawals,
  reviewWithdrawal,
} from "../../apis/course-withdrawal.api";
import { statusOrder, defaultPageSize } from "../constants";

const pendingCountFormatter = {
  red: (chunks: ReactNode[]) => (
    <span style={{ color: "#cc0000" }}>{chunks}</span>
  ),
};

type TeacherDashboardProps = {
  courseId: number;
};

const TeacherDashboardContent: FC<TeacherDashboardProps> = ({ courseId }) => {
  const { formatMessage: f } = useIntl();
  const { enqueueSnackbar } = useSnackbar();
  const optionAllI18n = f({ id: "teacherDashboard.filter.all" });
  const statusOptions = [
    {
      value: WithdrawalStatusOption.ALL,
      label: optionAllI18n,
    },
    {
      value: WithdrawalStatusOption.PENDING,
      label: f({ id: "teacherDashboard.status.pending" }),
    },
    {
      value: WithdrawalStatusOption.OVERDUE,
      label: f({ id: "teacherDashboard.status.overdue" }),
    },
    {
      value: WithdrawalStatusOption.APPROVED,
      label: f({ id: "teacherDashboard.status.approved" }),
    },
    {
      value: WithdrawalStatusOption.DECLINED,
      label: f({ id: "teacherDashboard.status.declined" }),
    },
  ];

  // Action status
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingFailed, setIsLoadingFailed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitFailed, setIsSubmitFailed] = useState(false);

  // Filter bar
  const [searchName, setSearchName] = useState("");
  const [searchErrorType, setSearchErrorType] = useState<string | null>(null);
  const [sectionFilter, setSectionFilter] = useState(optionAllI18n);
  const [statusFilter, setStatusFilter] = useState<WithdrawalStatusOption>(
    WithdrawalStatusOption.PENDING,
  );

  const [withdrawals, setWithdrawals] = useState<StudentRow[] | null>([]);
  const [selectedSingleWithdrawal, setSelectedSingleWithdrawal] = useState<
    StudentRow | undefined
  >(undefined);
  const [selectedBatchWithdrawals, setSelectedBatchWithdrawals] = useState<
    string[]
  >([]);
  const [batchReviewActionType, setBatchReviewActionType] = useState<
    ReviewAction | undefined
  >(undefined);

  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(defaultPageSize);
  const [total, setTotal] = useState(0);
  const latestRequestId = useRef(0);

  useEffect(() => {
    if (isLoadingFailed) {
      enqueueSnackbar(f({ id: "studentDashboard.error.fetchFailed" }), {
        variant: "error",
      });
    }
  }, [isLoadingFailed, enqueueSnackbar, f]);

  const fetchWithdrawals = async () => {
    const requestId = ++latestRequestId.current;
    setIsLoading(true);
    setIsLoadingFailed(false);
    try {
      const result = await getWithdrawals(courseId, {
        page: page + 1,
        pageSize: rowsPerPage,
      });
      if (latestRequestId.current !== requestId) return;
      setWithdrawals(result.data as StudentRow[] | null);
      setTotal(result.total);
    } catch {
      if (latestRequestId.current === requestId) setIsLoadingFailed(true);
    } finally {
      if (latestRequestId.current === requestId) setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWithdrawals();
  }, [courseId, page, rowsPerPage]);

  useEffect(() => {
    setSelectedBatchWithdrawals([]);
  }, [searchName, sectionFilter, statusFilter, rowsPerPage, page]);

  const handleChangePage = (newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (newRowsPerPage: number) => {
    setRowsPerPage(newRowsPerPage);
    setPage(0);
  };

  const sectionOptionsFromWithdrawals = Array.from(
    new Map(
      (withdrawals ?? [])
        .filter(
          (s): s is StudentRow & { sectionId: number; sectionName: string } =>
            s.sectionId !== undefined && s.sectionName !== undefined,
        )
        .map((s) => [s.sectionId, s.sectionName] as const),
    ),
  ).map(([sectionId, sectionName]) => ({
    value: String(sectionId),
    label: sectionName,
  }));

  const sectionOptions = [
    {
      value: optionAllI18n,
      label: optionAllI18n,
    },
    ...sectionOptionsFromWithdrawals,
  ];

  const baseFiltered = (withdrawals ?? []).filter((s) => {
    const isNameMatch =
      searchName === "" ||
      searchErrorType !== null ||
      s.studentName.includes(searchName);
    const isSectionMatch =
      sectionFilter === optionAllI18n || String(s.sectionId) === sectionFilter;
    const isStatusMatch =
      statusFilter === WithdrawalStatusOption.ALL || statusFilter === s.status;
    return isNameMatch && isSectionMatch && isStatusMatch;
  });
  const filtered = [...baseFiltered].sort((a, b) => {
    const d = statusOrder[a.status] - statusOrder[b.status];
    if (d === 0) return (b.lastModified || 0) - (a.lastModified || 0);
    return d;
  });
  const selectableRows = filtered.filter(
    (s) => s.status !== WithdrawalStatusOption.OVERDUE,
  );
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked)
      setSelectedBatchWithdrawals(selectableRows.map((s) => s.id));
    else setSelectedBatchWithdrawals([]);
  };

  const toggleSelect = (id: string) => {
    setSelectedBatchWithdrawals((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const onSingleWithdrawalReview = (withdrawal: StudentRow) => {
    setSelectedSingleWithdrawal(withdrawal);
  };

  const exportToExcel = () => {
    try {
      const headers = [
        f({ id: "teacherDashboard.field.studentName" }),
        f({ id: "teacherDashboard.field.section" }),
        f({ id: "teacherDashboard.field.studentId" }),
        f({ id: "teacherDashboard.field.submittedAt" }),
        f({ id: "teacherDashboard.field.reason" }),
        f({ id: "teacherDashboard.field.decision" }),
        f({ id: "teacherDashboard.field.deadline" }),
        f({ id: "teacherDashboard.field.reviewedAt" }),
        f({ id: "teacherDashboard.field.reviewer" }),
      ];
      const rows = (withdrawals ?? []).map((s) => {
        return [
          s.studentName,
          s.sectionName,
          s.studentId,
          s.submittedAt,
          s.reason,
          s.status,
          s.reviewDeadline,
          s.reviewedAt || "",
          s.reviewerName || "",
        ];
      });
      const title = f({ id: "teacherDashboard.title" });
      const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, title);
      XLSX.writeFile(workbook, `${title}.xlsx`);
      enqueueSnackbar(f({ id: "teacherDashboard.export.success" }), {
        variant: "success",
      });
    } catch {
      enqueueSnackbar(f({ id: "teacherDashboard.export.failed" }), {
        variant: "error",
      });
    }
  };

  const onSingleReviewDialogClose = () => {
    setSelectedSingleWithdrawal(undefined);
  };

  const onSingleReviewConfirm = async (
    reviewAction: ReviewAction,
    reviewComment: string,
  ) => {
    if (!selectedSingleWithdrawal?.id) return;

    setIsSubmitting(true);
    try {
      await reviewWithdrawal(courseId, selectedSingleWithdrawal.id, {
        status:
          reviewAction === ReviewAction.APPROVE
            ? WithdrawalStatusOption.APPROVED
            : WithdrawalStatusOption.DECLINED,
        reviewComment,
      });
      await fetchWithdrawals();
      onSingleReviewDialogClose();
    } catch {
      setIsSubmitFailed(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const onBatchApproveClick = () => {
    setBatchReviewActionType(ReviewAction.APPROVE);
  };

  const onBatchDeclineClick = () => {
    setBatchReviewActionType(ReviewAction.DECLINE);
  };

  const onBatchReviewDialogClose = () => {
    setBatchReviewActionType(undefined);
  };

  const onBatchReviewConfirm = async (reviewComment: string) => {
    setIsSubmitting(true);
    try {
      await batchReviewWithdrawals(courseId, {
        withdrawalIds: selectedBatchWithdrawals,
        status:
          batchReviewActionType === ReviewAction.APPROVE
            ? WithdrawalStatusOption.APPROVED
            : WithdrawalStatusOption.DECLINED,
        reviewComment,
      });
      setSelectedBatchWithdrawals([]);
      await fetchWithdrawals();
      onBatchReviewDialogClose();
    } catch {
      setIsSubmitFailed(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasSelections = selectedBatchWithdrawals.length > 0;
  const isAllSelected =
    selectableRows.length > 0 &&
    selectedBatchWithdrawals.length === selectableRows.length;

  const isSelected = (id: string) => selectedBatchWithdrawals.includes(id);
  const isSomeSelected =
    selectedBatchWithdrawals.length > 0 &&
    selectedBatchWithdrawals.length < selectableRows.length;

  const pendingCount = (withdrawals ?? []).filter(
    (s) =>
      s.status === WithdrawalStatusOption.PENDING ||
      s.status === WithdrawalStatusOption.OVERDUE,
  ).length;

  const noPendingStudents =
    (withdrawals ?? []).filter(
      (s) => s.status === WithdrawalStatusOption.PENDING,
    ).length === 0;

  const emptyMessageType: EmptyMessageType =
    withdrawals === null
      ? "notEnabled"
      : total === 0
        ? "submission"
        : statusFilter === WithdrawalStatusOption.PENDING && noPendingStudents
          ? "pending"
          : "filtered";

  const disabled =
    isLoading || isLoadingFailed || !withdrawals || withdrawals?.length === 0;

  const headerJSX = (
    <>
      <Typography variant="h1">
        {f({ id: "teacherDashboard.title" })}
      </Typography>
      <Typography variant="caption" component="p">
        {f(
          { id: "teacherDashboard.pending.count" },
          { count: pendingCount, ...pendingCountFormatter },
        )}
      </Typography>
    </>
  );

  const submitErrorDialogJSX = (
    <BaseDialog
      open={isSubmitFailed}
      size="xs"
      mode={BaseDialogMode.Info}
      title={f({ id: "teacherDashboard.actionError.title" })}
      confirmBtnText={f({ id: "teacherDashboard.actionError.confirm" })}
      onConfirm={() => setIsSubmitFailed(false)}
    >
      <Typography
        variant="body1"
        sx={{ display: "flex", alignItems: "center", gap: 1 }}
      >
        <CancelIcon color="error" fontSize="small" />
        {f({ id: "teacherDashboard.actionError.message" })}
      </Typography>
    </BaseDialog>
  );

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 3,
      }}
    >
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {headerJSX}
        <FilterBar
          disabled={disabled}
          searchName={searchName}
          searchErrorType={searchErrorType}
          onSearchNameChange={setSearchName}
          onSearchErrorTypeChange={setSearchErrorType}
          sectionFilter={sectionFilter}
          onSectionFilterChange={setSectionFilter}
          sectionOptions={sectionOptions}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          statusOptions={statusOptions}
          onExport={exportToExcel}
          selectedCount={selectedBatchWithdrawals.length}
          hasSelections={hasSelections}
          onApprove={onBatchApproveClick}
          onDecline={onBatchDeclineClick}
        />
      </Box>
      <WithdrawalTable
        disabled={disabled}
        isLoading={isLoading}
        rows={filtered}
        emptyMessageType={emptyMessageType}
        isAllSelected={isAllSelected}
        isSomeSelected={isSomeSelected}
        onSelectAll={handleSelectAll}
        isSelected={isSelected}
        onToggleSelect={toggleSelect}
        onReview={onSingleWithdrawalReview}
        page={page}
        rowsPerPage={rowsPerPage}
        total={total}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
      {selectedSingleWithdrawal !== undefined && (
        <WithdrawalReviewDialog
          withdrawal={selectedSingleWithdrawal}
          onConfirm={onSingleReviewConfirm}
          onCancel={onSingleReviewDialogClose}
        />
      )}
      {batchReviewActionType !== undefined && (
        <BatchReviewDialog
          actionType={batchReviewActionType}
          onConfirm={onBatchReviewConfirm}
          onCancel={onBatchReviewDialogClose}
        />
      )}
      {submitErrorDialogJSX}
      <LTILoadingSpinner show={isSubmitting} />
    </Box>
  );
};

export const TeacherDashboard = withSnackbar(TeacherDashboardContent);
