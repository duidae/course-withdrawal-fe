import { type FC, useEffect, useState } from "react";
import { useIntl } from "react-intl";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import * as XLSX from "xlsx";

import { getWithdrawals } from "../../apis/course-withdrawal.api";

import {
  initCS,
  classOptions as classUniversityOptions,
  statusOptions as statusIndividualOptions,
} from "../../apis/mockup";

import { statusOrder, pendingCountFormatter } from "./constants";
import { FilterBar } from "./FilterBar";
import { WithdrawalTable, type StudentTableRow } from "./WithdrawalTable";
import { TicketDialog } from "./TicketDialog";
import { type StudentRow, type StudentRowWithOrig } from "./types";
import { type Withdrawal } from "../../models";

export const TeacherDashboard: FC = () => {
  const { formatMessage: f } = useIntl();
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [adminCS] = useState(initCS());
  const [searchName, setSearchName] = useState("");
  const [searchErrorType, setSearchErrorType] = useState<string | null>(null);
  const [reviewTicket, setReviewTicket] = useState<Withdrawal | undefined>(
    undefined,
  );
  const [ticketDecision, setTicketDecision] = useState<"approve" | "decline">(
    "approve",
  );
  const [classFilter, setClassFilter] = useState(
    f({ id: "teacherDashboard.filter.all" }),
  );
  const [statusFilter, setStatusFilter] = useState("待審核");
  const [frozenOrder, setFrozenOrder] = useState<number[] | null>(null);
  const [selected, setSelected] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

  const statusOptions = [
    {
      value: f({ id: "teacherDashboard.filter.all" }),
      label: f({ id: "teacherDashboard.filter.all" }),
    },
    ...statusIndividualOptions,
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
  const getEffectiveStatus = (student: StudentRow) => {
    if (student.status !== "待審核") return student.status;
    const sec = getSecForSchool(student.school);
    if (!sec.ad) return student.status;
    const deadline = new Date(sec.ad.replace(/\//g, "-").replace(" ", "T"));
    return deadline < new Date() ? "逾期審核" : student.status;
  };

  const statusLabelIds: Record<string, string> = {
    待審核: "teacherDashboard.status.pending",
    逾期審核: "teacherDashboard.status.overdue",
    同意: "teacherDashboard.status.approved",
    不同意: "teacherDashboard.status.declined",
  };
  const getStatusLabel = (status: string) =>
    statusLabelIds[status] ? f({ id: statusLabelIds[status] }) : status;

  const effectiveStudents: StudentRowWithOrig[] = withdrawals.map((w) => {
    const eff = getEffectiveStatus(w);
    return { ...w, status: eff, _orig: w.status };
  });
  const baseFiltered = effectiveStudents.filter((s: StudentRowWithOrig) => {
    // When search has validation error, don't apply name filter
    const nm =
      searchName === "" ||
      searchErrorType !== null ||
      s.name.includes(searchName);
    const cl =
      classFilter === f({ id: "teacherDashboard.filter.all" }) ||
      s.school === classFilter;
    const st =
      statusFilter === f({ id: "teacherDashboard.filter.all" }) ||
      (statusFilter === "待審核" && s.status === "待審核") ||
      (statusFilter === "逾期審核" && s.status === "逾期審核") ||
      (statusFilter === "同意停修" && s.status === "同意") ||
      (statusFilter === "不同意停修" && s.status === "不同意");
    return nm && cl && st;
  });
  const filtered = frozenOrder
    ? [
        ...frozenOrder
          .map((id) =>
            baseFiltered.find((s: StudentRowWithOrig) => s.id === id),
          )
          .filter((entry): entry is StudentRowWithOrig => entry !== undefined),
        ...baseFiltered.filter(
          (s: StudentRowWithOrig) => !frozenOrder.includes(s.id),
        ),
      ]
    : [...baseFiltered].sort((a, b) => {
        const d = statusOrder[a.status] - statusOrder[b.status];
        if (d === 0) return (b.lastModified || 0) - (a.lastModified || 0);
        return d;
      });
  const selectableRows = filtered.filter(
    (s): s is StudentRowWithOrig => s !== undefined && s.status !== "逾期審核",
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
      f({ id: "teacherDashboard.field.approvalTime" }),
      f({ id: "teacherDashboard.field.approver" }),
    ];
    const rows = effectiveStudents.map((s) => {
      const deadline =
        s._orig === "逾期審核" ? s.deadline : getSecForSchool(s.school).ad;
      return [
        s.name,
        s.school,
        s.studentId,
        s.applyTime,
        s.reason,
        getStatusLabel(s.status),
        deadline,
        s.approvalTime || "",
        s.approver || "",
      ];
    });
    const title = f({ id: "teacherDashboard.title" });
    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, title);
    XLSX.writeFile(workbook, `${title}.xlsx`);
  };

  const batchApprove = () => {
    if (selected.length === 0) return;
    setWithdrawals((prev) =>
      prev.map((withdrawal) =>
        selected.includes(withdrawal.id)
          ? {
              ...withdrawal,
              status: "同意",
              approvalTime: withdrawal.approvalTime || "2026/05/11 00:00",
              approver:
                withdrawal.approver ||
                f({ id: "teacherDashboard.defaultApprover" }),
            }
          : withdrawal,
      ),
    );
    setSelected([]);
  };

  const batchDecline = () => {
    console.log("batch decline");
  };

  const onTicketConfirm = () => {
    console.log("ticket confirm");
  };

  const onTicketCancel = () => {
    setReviewTicket(undefined);
  };

  const hasSelections = selected.length > 0;
  const allSelected =
    selectableRows.length > 0 && selected.length === selectableRows.length;

  const isSelected = (id: number) => selected.includes(id);
  const someSelected =
    selected.length > 0 && selected.length < selectableRows.length;

  const pendingCount = effectiveStudents.filter(
    (s: StudentRow) => s.status === "待審核" || s.status === "逾期審核",
  ).length;

  const noPendingStudents =
    withdrawals.filter((s) => s.status === "待審核").length === 0;

  const tableRows: StudentTableRow[] = filtered.map((s) => ({
    ...s,
    displayDeadline:
      s._orig === "逾期審核" ? s.deadline : getSecForSchool(s.school).ad,
    statusLabel: getStatusLabel(s.status),
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
          onApprove={batchApprove}
          onDecline={batchDecline}
        />
      </Box>

      <WithdrawalTable
        rows={tableRows}
        isLoading={isLoading}
        showEmptyPendingMessage={statusFilter === "待審核" && noPendingStudents}
        allSelected={allSelected}
        someSelected={someSelected}
        onSelectAll={handleSelectAll}
        isSelected={isSelected}
        onToggleSelect={toggleSelect}
        onReview={onTicketReview}
      />

      {reviewTicket !== undefined && (
        <TicketDialog
          withdrawal={reviewTicket}
          decision={ticketDecision}
          onDecisionChange={setTicketDecision}
          onConfirm={onTicketConfirm}
          onCancel={onTicketCancel}
        />
      )}
    </Box>
  );
};

export default TeacherDashboard;
