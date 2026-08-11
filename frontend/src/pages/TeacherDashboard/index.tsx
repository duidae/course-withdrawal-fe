import { type FC, useEffect, useState } from "react";
import { useIntl } from "react-intl";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import * as XLSX from "xlsx";
import { FilterBar } from "./FilterBar";
import { WithdrawalTable, type WithdrawalTableRow } from "./WithdrawalTable";
import {
  TicketReviewDialog,
  BatchReviewDialog,
  ReviewAction,
} from "./ReviewDialog";
import {
  type StudentRow,
  type StudentRowWithOrig,
  WithdrawalStatus,
} from "./types";
import {
  getCourseSettings,
  getWithdrawals,
  batchReviewWithdrawals,
  type CourseSettings,
} from "../../apis/course-withdrawal.api";
import { statusOrder, pendingCountFormatter } from "./constants";

type TeacherDashboardProps = {
  courseId: number;
};

export const TeacherDashboard: FC<TeacherDashboardProps> = ({ courseId }) => {
  const { formatMessage: f } = useIntl();
  const [courseSettings, setCourseSettings] = useState<CourseSettings | undefined>(undefined);
  const [withdrawals, setWithdrawals] = useState<StudentRow[]>([]);
  const [searchName, setSearchName] = useState("");
  const [searchErrorType, setSearchErrorType] = useState<string | null>(null);
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<StudentRow | undefined>(
    undefined,
  );
  const [batchReviewActionType, setBatchReviewActionType] = useState<
    ReviewAction | undefined
  >(undefined);
  const [reviewAction, setReviewAction] = useState<ReviewAction>(
    ReviewAction.APPROVE,
  );
  const [classFilter, setClassFilter] = useState(
    f({ id: "teacherDashboard.filter.all" }),
  );
  const [statusFilter, setStatusFilter] = useState<WithdrawalStatus>(
    WithdrawalStatus.PENDING,
  );
  const [frozenOrder, setFrozenOrder] = useState<number[] | null>(null);
  const [selected, setSelected] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const statusOptions = [
    {
      value: WithdrawalStatus.ALL,
      label: f({ id: "teacherDashboard.filter.all" }),
    },
    {
      value: WithdrawalStatus.PENDING,
      label: f({ id: "teacherDashboard.status.pending" }),
    },
    {
      value: WithdrawalStatus.OVERDUE,
      label: f({ id: "teacherDashboard.status.overdue" }),
    },
    {
      value: WithdrawalStatus.APPROVED,
      label: f({ id: "teacherDashboard.status.approved" }),
    },
    {
      value: WithdrawalStatus.DECLINED,
      label: f({ id: "teacherDashboard.status.declined" }),
    },
  ];

  const fetchWithdrawals = async () => {
    setIsLoading(true);
    const courseSettings = await getCourseSettings(courseId);
    const first = await getWithdrawals(courseId, { page: 1, pageSize: 10 });
    const all = [...(first.data as StudentRow[])];
    const totalPages = Math.ceil(first.total / first.pageSize);
    for (let page = 2; page <= totalPages; page++) {
      const next = await getWithdrawals(courseId, { page, pageSize: 10 });
      all.push(...(next.data as StudentRow[]));
    }
    setCourseSettings(courseSettings);
    setWithdrawals(all);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchWithdrawals();
  }, [courseId]);

  const classOptions = [
    {
      value: f({ id: "teacherDashboard.filter.all" }),
      label: f({ id: "teacherDashboard.filter.all" }),
    },
    ...(courseSettings?.sectionOptions?.map((option) => ({ value: option, label: option })) ?? []),
  ];

  const baseFiltered = withdrawals.filter((s) => {
    const nm =
      searchName === "" ||
      searchErrorType !== null ||
      s.studentName.includes(searchName);
    const cl =
      classFilter === f({ id: "teacherDashboard.filter.all" }) ||
      s.sectionName === classFilter;
    const st =
      statusFilter === WithdrawalStatus.ALL || statusFilter === s.status;
    return nm && cl && st;
  });
  const filtered = frozenOrder
    ? [
        ...frozenOrder
          .map((id) => baseFiltered.find((s) => s.id === id))
          .filter((entry): entry is StudentRowWithOrig => entry !== undefined),
        ...baseFiltered.filter((s) => !frozenOrder.includes(s.id)),
      ]
    : [...baseFiltered].sort((a, b) => {
        const d = statusOrder[a.status] - statusOrder[b.status];
        if (d === 0) return (b.lastModified || 0) - (a.lastModified || 0);
        return d;
      });
  const selectableRows = filtered.filter(
    (s) => s.status !== WithdrawalStatus.OVERDUE,
  );
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) setSelected(selectableRows.map((s) => s.id));
    else setSelected([]);
  };

  const toggleSelect = (id: number) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const onWithdrawalReview = (withdrawal: StudentRow) => {
    setSelectedWithdrawal(withdrawal);
  };

  const exportToExcel = () => {
    const headers = [
      f({ id: "teacherDashboard.field.studentName" }),
      f({ id: "teacherDashboard.field.section" }),
      f({ id: "teacherDashboard.field.studentId" }),
      f({ id: "teacherDashboard.field.applyTime" }),
      f({ id: "teacherDashboard.field.reason" }),
      f({ id: "teacherDashboard.field.decision" }),
      f({ id: "teacherDashboard.field.deadline" }),
      f({ id: "teacherDashboard.field.reviewTime" }),
      f({ id: "teacherDashboard.field.approver" }),
    ];
    const rows = withdrawals.map((s) => {
      const deadline = courseSettings?.reviewDeadline;
      return [
        s.studentName,
        s.sectionName,
        s.studentId,
        s.submittedAt,
        s.reason,
        s.status,
        deadline,
        s.reviewedAt || "",
        s.reviewerName || "",
      ];
    });
    const title = f({ id: "teacherDashboard.title" });
    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, title);
    XLSX.writeFile(workbook, `${title}.xlsx`);
  };

  const onBatchApproveClick = () => {
    setBatchReviewActionType(ReviewAction.APPROVE);
  };

  const onBatchDeclineClick = () => {
    setBatchReviewActionType(ReviewAction.DECLINE);
  };

  const onBatchDialogClose = () => {
    setBatchReviewActionType(undefined);
  };

  const onBatchAction = async (reviewComment: string) => {
    await batchReviewWithdrawals(courseId, {
      withdrawalIds: selected,
      status:
        batchReviewActionType === ReviewAction.APPROVE
          ? WithdrawalStatus.APPROVED
          : WithdrawalStatus.DECLINED,
      reviewComment,
    });
    setSelected([]);
    await fetchWithdrawals();
    onBatchDialogClose();
  };

  const onReviewDialogClose = () => {
    setSelectedWithdrawal(undefined);
  };

  const onReviewActionConfirm = () => {
    onReviewDialogClose();
  };

  const hasSelections = selected.length > 0;
  const allSelected =
    selectableRows.length > 0 && selected.length === selectableRows.length;

  const isSelected = (id: number) => selected.includes(id);
  const someSelected =
    selected.length > 0 && selected.length < selectableRows.length;

  const pendingCount = withdrawals.filter(
    (s) =>
      s.status === WithdrawalStatus.PENDING ||
      s.status === WithdrawalStatus.OVERDUE,
  ).length;

  const noPendingStudents =
    withdrawals.filter((s) => s.status === WithdrawalStatus.PENDING).length ===
    0;

  const tableRows: WithdrawalTableRow[] = filtered.map((s) => ({
    ...s,
    displayDeadline:
      s.status === WithdrawalStatus.OVERDUE
        ? s.deadline
        : courseSettings?.reviewDeadline ?? "",
  }));

  return (
    <Box
      sx={{ display: "flex", flexDirection: "column", gap: 3, paddingRight: 1 }}
    >
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <Typography variant="h1">
          {f({ id: "teacherDashboard.title" })}
        </Typography>
        <Typography variant="caption" component="p">
          {f(
            { id: "teacherDashboard.pending.count" },
            { count: pendingCount, ...pendingCountFormatter },
          )}
        </Typography>
        <FilterBar
          disabled={isLoading}
          searchName={searchName}
          searchErrorType={searchErrorType}
          onSearchNameChange={setSearchName}
          onSearchErrorTypeChange={setSearchErrorType}
          classFilter={classFilter}
          onClassFilterChange={setClassFilter}
          classOptions={classOptions}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          statusOptions={statusOptions}
          showRefresh={!!frozenOrder}
          onRefresh={() => {
            setFrozenOrder(null);
            setSelected([]);
          }}
          onExport={exportToExcel}
          selectedCount={selected.length}
          hasSelections={hasSelections}
          onApprove={onBatchApproveClick}
          onDecline={onBatchDeclineClick}
        />
      </Box>
      <WithdrawalTable
        rows={tableRows}
        isLoading={isLoading}
        showEmptyPendingMessage={
          statusFilter === WithdrawalStatus.PENDING && noPendingStudents
        }
        allSelected={allSelected}
        someSelected={someSelected}
        onSelectAll={handleSelectAll}
        isSelected={isSelected}
        onToggleSelect={toggleSelect}
        onReview={onWithdrawalReview}
      />
      {selectedWithdrawal !== undefined && (
        <TicketReviewDialog
          withdrawal={selectedWithdrawal}
          action={reviewAction}
          onActionChange={setReviewAction}
          onConfirm={onReviewActionConfirm}
          onCancel={onReviewDialogClose}
        />
      )}
      {batchReviewActionType !== undefined && (
        <BatchReviewDialog
          actionType={batchReviewActionType}
          onConfirm={onBatchAction}
          onCancel={onBatchDialogClose}
        />
      )}
    </Box>
  );
};

export default TeacherDashboard;
