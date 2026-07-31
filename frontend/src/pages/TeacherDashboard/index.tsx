import { type FC, useEffect, useState } from "react";
import { useIntl } from "react-intl";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import * as XLSX from "xlsx";

import { getWithdrawals } from "../../apis/course-withdrawal.api";

import {
  initCS,
  classOptions as classUniversityOptions,
} from "../../apis/mockup";

import { statusOrder, pendingCountFormatter } from "./constants";
import { FilterBar } from "./FilterBar";
import { WithdrawalTable, type WithdrawalTableRow } from "./WithdrawalTable";
import {
  TicketReviewDialog,
  BatchReviewDialog,
  BatchReviewActionType,
} from "./ReviewDialog";
import { type StudentRow, WithdrawalStatus } from "./types";
import { type Withdrawal } from "../../models";
import { useCourseInfo } from "../../contexts/course-info.context";

export const TeacherDashboard: FC = () => {
  const { formatMessage: f } = useIntl();
  const { courseName } = useCourseInfo();
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [adminCS] = useState(initCS());
  const [searchName, setSearchName] = useState("");
  const [searchErrorType, setSearchErrorType] = useState<string | null>(null);
  const [reviewTicket, setReviewTicket] = useState<Withdrawal | undefined>(
    undefined,
  );
  const [batchReviewActionType, setBatchReviewActionType] = useState<
    BatchReviewActionType | undefined
  >(undefined);
  const [ticketDecision, setTicketDecision] = useState<"approve" | "decline">(
    "approve",
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

  useEffect(() => {
    const fetchWithdrawals = async () => {
      const first = await getWithdrawals({ page: 1 });
      const all = [...first.data];
      const totalPages = Math.ceil(first.total / first.pageSize);
      for (let page = 2; page <= totalPages; page++) {
        const next = await getWithdrawals({ page });
        all.push(...next.data);
      }
      setWithdrawals(all);
      setIsLoading(false);
    };
    fetchWithdrawals();
  }, []);

  const classOptions = [
    {
      value: f({ id: "teacherDashboard.filter.all" }),
      label: f({ id: "teacherDashboard.filter.all" }),
    },
    ...classUniversityOptions,
  ];

  const getSecForSchool = (school: string) => {
    const secs = adminCS["1"] || [];
    return (
      secs.find((s) => s.name === school) || {
        st: "2026/07/01 00:00",
        et: "2026/07/25 23:59",
        ad: "2026/08/08 23:59",
        notes: "",
      }
    );
  };
  const getEffectiveStatus = (withdrawal: Withdrawal) => {
    if (withdrawal.status !== WithdrawalStatus.PENDING)
      return withdrawal.status;
    const sec = getSecForSchool(withdrawal.school);
    if (!sec.ad) return withdrawal.status;
    const deadline = new Date(sec.ad.replace(/\//g, "-").replace(" ", "T"));
    return deadline < new Date() ? WithdrawalStatus.OVERDUE : withdrawal.status;
  };

  const effectiveWithdrawals: Withdrawal[] = withdrawals.map((w) => {
    const eff = getEffectiveStatus(w);
    return { ...w, status: eff, _orig: w.status };
  });
  const baseFiltered = effectiveWithdrawals.filter((s: Withdrawal) => {
    const nm =
      searchName === "" ||
      searchErrorType !== null ||
      s.name.includes(searchName);
    const cl =
      classFilter === f({ id: "teacherDashboard.filter.all" }) ||
      s.school === classFilter;
    const st =
      statusFilter === WithdrawalStatus.ALL || statusFilter === s.status;
    return nm && cl && st;
  });
  const filtered = frozenOrder
    ? [
        ...frozenOrder
          .map((id) => baseFiltered.find((s: Withdrawal) => s.id === id))
          .filter((entry): entry is Withdrawal => entry !== undefined),
        ...baseFiltered.filter((s: Withdrawal) => !frozenOrder.includes(s.id)),
      ]
    : [...baseFiltered].sort((a, b) => {
        const d = statusOrder[a.status] - statusOrder[b.status];
        if (d === 0) return (b.lastModified || 0) - (a.lastModified || 0);
        return d;
      });
  const selectableRows = filtered.filter(
    (s): s is Withdrawal =>
      s !== undefined && s.status !== WithdrawalStatus.OVERDUE,
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

  const onTicketReview = (withdrawal: Withdrawal) => {
    setReviewTicket(withdrawal);
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
    const rows = effectiveWithdrawals.map((s) => {
      const deadline =
        s._orig === WithdrawalStatus.OVERDUE
          ? s.deadline
          : getSecForSchool(s.school).ad;
      return [
        s.name,
        s.school,
        s.studentId,
        s.applyTime,
        s.reason,
        s.status,
        deadline,
        s.reviewTime || "",
        s.approver || "",
      ];
    });
    const title = f({ id: "teacherDashboard.title" });
    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, title);
    XLSX.writeFile(workbook, `${title}.xlsx`);
  };

  const onBatchApproveClick = () => {
    /*
    if (selected.length === 0) return;
    setWithdrawals((prev) =>
      prev.map((withdrawal) =>
        selected.includes(withdrawal.id)
          ? {
              ...withdrawal,
              status: "同意",
              reviewTime: withdrawal.reviewTime || "2026/05/11 00:00",
              approver:
                withdrawal.approver ||
                f({ id: "teacherDashboard.defaultApprover" }),
            }
          : withdrawal,
      ),
    );
    setSelected([]);
    */
    setBatchReviewActionType(BatchReviewActionType.APPROVE);
  };

  const onBatchDeclineClick = () => {
    setBatchReviewActionType(BatchReviewActionType.DECLINE);
  };

  const onBatchApprove = () => {
    // TODO: finish approve from api call
    onBatchDialogClose();
  };

  const onBatchDecline = () => {
    // TODO: finish decline from api call
    onBatchDialogClose();
  };

  const onBatchDialogClose = () => {
    setBatchReviewActionType(undefined);
  };

  const onTicketConfirm = () => {
    console.log("ticket confirm");
    onTicketDialogClose();
  };

  const onTicketDialogClose = () => {
    setReviewTicket(undefined);
  };

  const hasSelections = selected.length > 0;
  const allSelected =
    selectableRows.length > 0 && selected.length === selectableRows.length;

  const isSelected = (id: number) => selected.includes(id);
  const someSelected =
    selected.length > 0 && selected.length < selectableRows.length;

  const pendingCount = effectiveWithdrawals.filter(
    (s: StudentRow) =>
      s.status === WithdrawalStatus.PENDING ||
      s.status === WithdrawalStatus.OVERDUE,
  ).length;

  const noPendingStudents =
    withdrawals.filter((s) => s.status === WithdrawalStatus.PENDING).length ===
    0;

  const tableRows: WithdrawalTableRow[] = filtered.map((s) => ({
    ...s,
    displayDeadline:
      s._orig === WithdrawalStatus.OVERDUE
        ? s.deadline
        : getSecForSchool(s.school).ad,
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
        onReview={onTicketReview}
      />
      {reviewTicket !== undefined && (
        <TicketReviewDialog
          courseName={courseName}
          withdrawal={reviewTicket}
          decision={ticketDecision}
          onDecisionChange={setTicketDecision}
          onConfirm={onTicketConfirm}
          onCancel={onTicketDialogClose}
        />
      )}
      {batchReviewActionType !== undefined && (
        <BatchReviewDialog
          actionType={batchReviewActionType}
          onConfirm={
            batchReviewActionType === BatchReviewActionType.APPROVE
              ? onBatchApprove
              : onBatchDecline
          }
          onCancel={onBatchDialogClose}
        />
      )}
    </Box>
  );
};

export default TeacherDashboard;
