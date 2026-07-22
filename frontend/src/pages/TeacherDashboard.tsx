import { type FC, type ReactNode, useState, useEffect, useRef } from "react";
import { useIntl } from "react-intl";
import {
  Box,
  Button,
  IconButton,
  Typography,
  Divider,
  Stack,
} from "@mui/material";
import TextField from "@mui/material/TextField";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select, { type SelectChangeEvent } from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import EditIcon from "@mui/icons-material/Edit";
import RefreshIcon from "@mui/icons-material/Refresh";
import * as XLSX from "xlsx";

import { BaseDialog } from "../cool-ui/components/dialogs/BaseDialog";
import { QuillContentEditor } from "../components/QuillContentEditor";

import {
  INIT_STUDENTS,
  initCS,
  classOptions,
  statusOptions,
  chipSt,
} from "../apis/mockup";

type StudentRow = {
  id: number;
  name: string;
  school: string;
  studentId: string;
  applyTime: string;
  deadline: string;
  reason: string;
  status: string;
  approvalTime?: string;
  approver?: string;
  lastModified?: number;
  _orig?: string;
};

type StudentRowWithOrig = StudentRow & { _orig: string };

type StatusChipProps = {
  status: string;
  label?: string;
};

type TruncatedReasonProps = {
  text: string;
  onReadMore: () => void;
};

type SelectOption = {
  value: string;
  label: string;
};

type FilterSelectProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  width: number;
};

const SelectField = ({
  label,
  value,
  onChange,
  options,
  width,
}: FilterSelectProps) => {
  const labelId = `select-field-${label}`;
  return (
    <FormControl size="small" style={{ width }}>
      <InputLabel id={labelId}>{label}</InputLabel>
      <Select
        labelId={labelId}
        label={label}
        value={value}
        onChange={(e: SelectChangeEvent) => onChange(e.target.value)}
      >
        {options.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

function DateTimeCell({ value }: { value?: string }) {
  if (!value) return <span />;
  const sp = value.indexOf(" ");
  if (sp === -1)
    return (
      <span style={{ fontSize: 14, color: "#333", lineHeight: "1.43" }}>
        {value}
      </span>
    );
  return (
    <span style={{ fontSize: 14, color: "#333", lineHeight: "1.43" }}>
      {value.slice(0, sp)}
      <br />
      {value.slice(sp + 1)}
    </span>
  );
}

const StatusChip = ({ status, label: labelOverride }: StatusChipProps) => {
  const s = chipSt[status as keyof typeof chipSt] || chipSt["未申請"];
  const label = labelOverride ?? status;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "2px 10px",
        borderRadius: 100,
        fontSize: 13,
        height: 24,
        whiteSpace: "nowrap",
        ...s,
      }}
    >
      {label}
    </span>
  );
};

function TruncatedReason({ text, onReadMore }: TruncatedReasonProps) {
  const { formatMessage: f } = useIntl();
  const measRef = useRef<HTMLDivElement | null>(null);
  const [isOver, setIsOver] = useState(false);

  useEffect(() => {
    const measure = () => {
      const el = measRef.current;
      if (!el) return;
      const lh = Number.parseFloat(getComputedStyle(el).lineHeight) || 18;
      setIsOver(el.scrollHeight > lh * 2 + 2);
    };
    measure(); // immediate (may use pre-layout width)
    const t = setTimeout(measure, 0); // deferred: fires after table layout settles

    // Re-measure whenever the cell's own width changes (browser/window resize,
    // sidebar collapse, table column reflow, etc.) so <查看更多> shows/hides
    // dynamically instead of being locked in from the first render.
    let ro: ResizeObserver | undefined;
    if (typeof ResizeObserver !== "undefined" && measRef.current) {
      ro = new ResizeObserver(() => measure());
      ro.observe(measRef.current);
    }
    window.addEventListener("resize", measure);

    return () => {
      clearTimeout(t);
      if (ro) ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [text]);

  return (
    <div>
      <div
        ref={measRef}
        aria-hidden="true"
        style={{
          fontSize: 14,
          lineHeight: "1.43",
          height: 0,
          overflow: "hidden",
          wordBreak: "break-all",
        }}
      >
        {text}
      </div>

      {isOver ? (
        <div
          style={{
            fontSize: 14,
            color: "#333",
            lineHeight: "1.43",
            overflow: "hidden",
            maxHeight: "2.86em",
            wordBreak: "break-all",
          }}
        >
          <span
            style={{
              float: "right",
              clear: "right",
              height: "1.43em",
              width: "1px",
              display: "block",
            }}
          />
          <span style={{ float: "right", clear: "right" }}>
            {"... "}
            <button
              onClick={onReadMore}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 0,
                fontSize: 12,
                color: "#757575",
                fontFamily: "inherit",
                whiteSpace: "nowrap",
              }}
            >
              &lt;{f({ id: "teacherDashboard.reason.readMore" })}&gt;
            </button>
          </span>
          {text}
        </div>
      ) : (
        <div
          style={{
            fontSize: 14,
            color: "#333",
            lineHeight: "1.43",
            wordBreak: "break-all",
          }}
        >
          {text}
        </div>
      )}
    </div>
  );
}

const statusOrder: Record<string, number> = {
  待審核: 1,
  逾期審核: 2,
  同意: 3,
  不同意: 4,
};

const pendingCountFormatter = {
  red: (chunks: ReactNode[]) => (
    <span style={{ color: "#cc0000" }}>{chunks}</span>
  ),
};

export const TeacherDashboard: FC = () => {
  const [students, setStudents] = useState<StudentRow[]>(INIT_STUDENTS);
  const [adminCS] = useState(initCS());
  const [searchName, setSearchName] = useState("");
  const [searchErrorType, setSearchErrorType] = useState<string | null>(null);
  const [isTicketOpen, setIsTicketOpen] = useState<boolean>(false);
  const [classFilter, setClassFilter] = useState("全部");
  const [statusFilter, setStatusFilter] = useState("待審核");
  const [frozenOrder, setFrozenOrder] = useState<number[] | null>(null);
  const [selected, setSelected] = useState<number[]>([]);
  const { formatMessage: f } = useIntl();

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

  const effectiveStudents: StudentRowWithOrig[] = students.map((s) => {
    const eff = getEffectiveStatus(s);
    return { ...s, status: eff, _orig: s.status };
  });
  const baseFiltered = effectiveStudents.filter((s: StudentRowWithOrig) => {
    // When search has validation error, don't apply name filter
    const nm =
      searchName === "" ||
      searchErrorType !== null ||
      s.name.includes(searchName);
    const cl = classFilter === "全部" || s.school === classFilter;
    const st =
      statusFilter === "全部" ||
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

  const openReview = (student: StudentRow) => {
    setIsTicketOpen(true);
  };

  const exportToExcel = () => {
    const headers = [
      f({ id: "teacherDashboard.field.studentName" }),
      f({ id: "teacherDashboard.field.class" }),
      f({ id: "teacherDashboard.field.studentId" }),
      f({ id: "teacherDashboard.field.applyTime" }),
      f({ id: "teacherDashboard.field.reason" }),
      f({ id: "teacherDashboard.field.reviewResult" }),
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
    setStudents((prev) =>
      prev.map((student) =>
        selected.includes(student.id)
          ? {
              ...student,
              status,
              approvalTime: student.approvalTime || "2026/05/11 00:00",
              approver:
                student.approver ||
                f({ id: "teacherDashboard.defaultApprover" }),
            }
          : student,
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
    setIsTicketOpen(false);
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

  const controlJSX = (
    <>
      {/* Filter row */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <div style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>
          <TextField
            label={f({ id: "teacherDashboard.filter.studentName" })}
            value={searchName}
            onChange={(e) => {
              const val = e.target.value;
              setSearchName(val);
              if (val === "") {
                setSearchErrorType(null);
              } else if (val.length > 50) {
                setSearchErrorType("tooLong");
              } else if (/[^一-鿿㐀-䶿豈-﫿ꀀ-꒏A-Za-z]/.test(val)) {
                setSearchErrorType("invalidChars");
              } else {
                setSearchErrorType(null);
              }
            }}
            error={!!searchErrorType}
            helperText={
              searchErrorType === "invalidChars"
                ? f({ id: "teacherDashboard.filter.nameInvalidChars" })
                : searchErrorType === "tooLong"
                  ? f({ id: "teacherDashboard.filter.nameTooLong" })
                  : ""
            }
            style={{ width: 220 }}
          />
          <SelectField
            label={f({ id: "teacherDashboard.field.class" })}
            value={classFilter}
            onChange={(v) => setClassFilter(v)}
            options={classOptions}
            width={220}
          />
          <SelectField
            label={f({ id: "teacherDashboard.field.reviewResult" })}
            value={statusFilter}
            onChange={(v) => setStatusFilter(v)}
            options={statusOptions}
            width={220}
          />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {frozenOrder && (
            <button
              onClick={() => {
                setFrozenOrder(null);
                setSelected([]);
              }}
              className="mui-btn mui-outlined-default"
              style={{
                color: "#555",
                border: "1px solid rgba(0,0,0,0.23)",
                background: "transparent",
                borderRadius: 4,
                padding: "6px 14px",
                fontSize: 14,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <RefreshIcon /> {f({ id: "teacherDashboard.actions.refresh" })}
            </button>
          )}
          <Button variant="outlined" onClick={exportToExcel}>
            {f({ id: "teacherDashboard.actions.exportAll" })}
          </Button>
        </div>
      </div>

      {/* Action bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
        }}
      >
        <span style={{ fontSize: 14, fontWeight: 500, color: "#333" }}>
          {f(
            { id: "teacherDashboard.selection.count" },
            { count: selected.length },
          )}
        </span>
        <Button
          size="small"
          variant="outlined"
          color="success"
          disabled={!hasSelections}
          onClick={batchApprove}
        >
          {f({ id: "teacherDashboard.withdrawal.approve" })}
        </Button>
        <Button
          size="small"
          variant="outlined"
          color="error"
          disabled={!hasSelections}
          onClick={batchDecline}
        >
          {f({ id: "teacherDashboard.withdrawal.decline" })}
        </Button>
      </div>
    </>
  );

  const headerJSX = (
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
      {controlJSX}
    </Box>
  );

  const tableJSX = (
    <div
      style={{
        border: "1px solid rgba(0,0,0,0.12)",
        overflow: "auto",
        maxHeight: "calc(100vh - 300px)",
      }}
    >
      <table
        style={{
          width: "100%",
          tableLayout: "fixed",
          borderCollapse: "collapse",
          minWidth: 1074,
        }}
      >
        <thead>
          <tr>
            <th
              style={{
                padding: "8px",
                width: 58,
                textAlign: "center",
                borderBottom: "1px solid rgba(0,0,0,0.12)",
                background: "#f5f5f5",
                position: "sticky",
                top: 0,
                zIndex: 2,
              }}
            >
              <input
                type="checkbox"
                checked={allSelected}
                ref={(el) => {
                  if (el) el.indeterminate = someSelected;
                }}
                onChange={handleSelectAll}
                style={{ accentColor: "#0099cc" }}
              />
            </th>
            {[
              {
                key: "studentName",
                label: "teacherDashboard.field.studentName",
                width: 100,
              },
              {
                key: "class",
                label: "teacherDashboard.field.class",
                width: 110,
              },
              {
                key: "studentId",
                label: "teacherDashboard.field.studentId",
                width: 128,
              },
              {
                key: "applyTime",
                label: "teacherDashboard.field.applyTime",
                width: 96,
              },
              {
                key: "reason",
                label: "teacherDashboard.field.reason",
                width: 160,
              },
              {
                key: "reviewResult",
                label: "teacherDashboard.field.reviewResult",
                width: 100,
              },
              {
                key: "deadline",
                label: "teacherDashboard.field.deadline",
                width: 96,
              },
              {
                key: "approvalTime",
                label: "teacherDashboard.field.approvalTime",
                width: 96,
              },
              {
                key: "approver",
                label: "teacherDashboard.field.approver",
                width: 80,
              },
              {
                key: "action",
                label: "teacherDashboard.field.action",
                width: 50,
              },
            ].map((col) => (
              <th
                key={col.key}
                style={{
                  padding: "8px",
                  textAlign: col.key === "action" ? "center" : "left",
                  fontSize: 14,
                  fontWeight: 500,
                  color: "#333",
                  borderBottom: "1px solid rgba(0,0,0,0.12)",
                  background: "#f5f5f5",
                  position: "sticky",
                  top: 0,
                  zIndex: 2,
                  ...(col.key === "reason"
                    ? { minWidth: col.width }
                    : { width: col.width }),
                  whiteSpace: "nowrap",
                }}
              >
                {f({ id: col.label })}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filtered.length === 0 ? (
            <tr>
              <td
                colSpan={11}
                style={{
                  padding: "32px 8px",
                  textAlign: "center",
                  fontSize: 14,
                  color: "#333",
                }}
              >
                {statusFilter === "待審核" &&
                students.filter((s) => s.status === "待審核").length === 0
                  ? f({ id: "teacherDashboard.table.emptyPending" })
                  : f({ id: "teacherDashboard.table.emptyFiltered" })}
              </td>
            </tr>
          ) : (
            filtered.map((s) => (
              <tr
                key={s.id}
                style={{
                  height: 72,
                  background: isSelected(s.id)
                    ? "rgba(0,153,204,0.08)"
                    : "transparent",
                }}
              >
                <td
                  style={{
                    padding: "8px",
                    textAlign: "center",
                    borderBottom: "1px solid rgba(0,0,0,0.06)",
                  }}
                >
                  {s.status !== "逾期審核" && (
                    <input
                      type="checkbox"
                      checked={isSelected(s.id)}
                      onChange={() => toggleSelect(s.id)}
                      style={{ accentColor: "#0099cc" }}
                    />
                  )}
                </td>
                {/* 申請學生 */}
                <td
                  style={{
                    padding: "8px",
                    fontSize: 14,
                    color: "#333",
                    borderBottom: "1px solid rgba(0,0,0,0.06)",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {s.name}
                </td>
                {/* 班別 — 字元過長時換行顯示，不做省略號隱藏 */}
                <td
                  style={{
                    padding: "8px",
                    fontSize: 14,
                    color: "#333",
                    borderBottom: "1px solid rgba(0,0,0,0.06)",
                    whiteSpace: "normal",
                    wordBreak: "break-word",
                    overflowWrap: "break-word",
                  }}
                >
                  {s.school}
                </td>
                {/* 學號 — 字元過長時換行顯示，不做省略號隱藏 */}
                <td
                  style={{
                    padding: "8px",
                    fontSize: 14,
                    color: "#333",
                    borderBottom: "1px solid rgba(0,0,0,0.06)",
                    whiteSpace: "normal",
                    wordBreak: "break-word",
                    overflowWrap: "break-word",
                  }}
                >
                  {s.studentId}
                </td>
                {/* 申請時間 */}
                <td
                  style={{
                    padding: "8px",
                    borderBottom: "1px solid rgba(0,0,0,0.06)",
                    verticalAlign: "middle",
                  }}
                >
                  <DateTimeCell value={s.applyTime} />
                </td>
                {/* 停修原因 */}
                <td
                  style={{
                    padding: "8px",
                    borderBottom: "1px solid rgba(0,0,0,0.06)",
                    overflow: "hidden",
                  }}
                >
                  <TruncatedReason
                    text={s.reason}
                    onReadMore={() => openReview(s)}
                  />
                </td>
                {/* 審核結果 */}
                <td
                  style={{
                    padding: "8px",
                    borderBottom: "1px solid rgba(0,0,0,0.06)",
                  }}
                >
                  <StatusChip
                    status={s.status}
                    label={getStatusLabel(s.status)}
                  />
                </td>
                {/* 審核期限：原本就是逾期審核的學生顯示歷史截止日，其他顯示 admin 當前設定 */}
                <td
                  style={{
                    padding: "8px",
                    borderBottom: "1px solid rgba(0,0,0,0.06)",
                    verticalAlign: "middle",
                  }}
                >
                  <DateTimeCell
                    value={
                      s._orig === "逾期審核"
                        ? s.deadline
                        : getSecForSchool(s.school).ad
                    }
                  />
                </td>
                {/* 審核時間 */}
                <td
                  style={{
                    padding: "8px",
                    borderBottom: "1px solid rgba(0,0,0,0.06)",
                    verticalAlign: "middle",
                  }}
                >
                  <DateTimeCell value={s.approvalTime || ""} />
                </td>
                {/* 審核人 — 字元過長時換行顯示，不做省略號隱藏 */}
                <td
                  style={{
                    padding: "8px",
                    fontSize: 14,
                    color: "#333",
                    borderBottom: "1px solid rgba(0,0,0,0.06)",
                    whiteSpace: "normal",
                    wordBreak: "break-word",
                    overflowWrap: "break-word",
                  }}
                >
                  {s.approver || ""}
                </td>
                {/* 審核 — 鉛筆 IconButton（逾期審核也顯示） */}
                <td
                  style={{
                    padding: "8px",
                    borderBottom: "1px solid rgba(0,0,0,0.06)",
                    textAlign: "center",
                    verticalAlign: "middle",
                  }}
                >
                  <IconButton
                    color="secondary"
                    aria-label={f({ id: "teacherDashboard.field.action" })}
                    onClick={() => openReview(s)}
                  >
                    <EditIcon />
                  </IconButton>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );

  const ticketDialogJSX = (
    <BaseDialog
      open={isTicketOpen}
      size="sm"
      //mode={BaseDialogMode.Info}
      title={f({ id: "teacherDashboard.ticket.title" })}
      onConfirm={onTicketConfirm}
      confirmBtnText={f({ id: "teacherDashboard.ticket.confirm" })}
      onCancel={onTicketCancel}
      cancelBtnText={f({ id: "teacherDashboard.ticket.cancel" })}
    >
      <Stack spacing={3}>
        <Stack spacing={1}>
          <Typography variant="h6">基礎條款</Typography>
          <QuillContentEditor content={"aaa"} />
        </Stack>
        <Divider />
        <Stack spacing={2}>
          <Typography variant="h6">選擇性授權項目</Typography>
        </Stack>
      </Stack>
    </BaseDialog>
  );

  return (
    <Box
      sx={{ display: "flex", flexDirection: "column", gap: 3, paddingRight: 1 }}
    >
      {headerJSX}
      {tableJSX}
      {ticketDialogJSX}
    </Box>
  );
};

export default TeacherDashboard;
