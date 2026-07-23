import { type ChangeEvent } from "react";
import { useIntl } from "react-intl";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Checkbox from "@mui/material/Checkbox";
import IconButton from "@mui/material/IconButton";
import CircularProgress from "@mui/material/CircularProgress";
import EditIcon from "@mui/icons-material/Edit";
import { columns, cellSx } from "./constants";
import { DateTimeCell } from "./DateTimeCell";
import { TruncatedReason } from "./TruncatedReason";
import { StatusChip } from "./StatusChip";
import { type StudentRow, type StudentRowWithOrig } from "./types";

export type StudentTableRow = StudentRowWithOrig & {
  displayDeadline: string;
  statusLabel: string;
};

type StudentTableProps = {
  rows: StudentTableRow[];
  isLoading?: boolean;
  showEmptyPendingMessage: boolean;
  allSelected: boolean;
  someSelected: boolean;
  onSelectAll: (e: ChangeEvent<HTMLInputElement>) => void;
  isSelected: (id: number) => boolean;
  onToggleSelect: (id: number) => void;
  onReview: (student: StudentRow) => void;
};

export function StudentTable({
  rows,
  isLoading,
  showEmptyPendingMessage,
  allSelected,
  someSelected,
  onSelectAll,
  isSelected,
  onToggleSelect,
  onReview,
}: StudentTableProps) {
  const { formatMessage: f } = useIntl();

  return (
    <TableContainer
      sx={{
        border: "1px solid rgba(0,0,0,0.12)",
        maxHeight: "calc(100vh - 300px)",
      }}
    >
      <Table stickyHeader sx={{ tableLayout: "fixed", minWidth: 1074 }}>
        <TableHead>
          <TableRow>
            <TableCell
              align="center"
              sx={{
                padding: "8px",
                width: 58,
                borderBottom: "1px solid rgba(0,0,0,0.12)",
                backgroundColor: "#f5f5f5",
              }}
            >
              <Checkbox
                checked={allSelected}
                indeterminate={someSelected}
                onChange={onSelectAll}
                sx={{
                  "&.Mui-checked": { color: "#0099cc" },
                }}
              />
            </TableCell>
            {columns.map((col) => (
              <TableCell
                key={col.key}
                align={col.key === "action" ? "center" : "left"}
                sx={{
                  padding: "8px",
                  fontSize: 14,
                  fontWeight: 500,
                  color: "#333",
                  borderBottom: "1px solid rgba(0,0,0,0.12)",
                  backgroundColor: "#f5f5f5",
                  whiteSpace: "nowrap",
                  ...(col.key === "reason"
                    ? { minWidth: col.width }
                    : { width: col.width }),
                }}
              >
                {f({ id: col.label })}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {isLoading && (
            <TableRow>
              <TableCell
                colSpan={11}
                align="center"
                sx={{ padding: "32px 8px" }}
              >
                <CircularProgress size={32} />
              </TableCell>
            </TableRow>
          )}
          {!isLoading && rows.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={11}
                align="center"
                sx={{ padding: "32px 8px", fontSize: 14, color: "#333" }}
              >
                {showEmptyPendingMessage
                  ? f({ id: "teacherDashboard.table.emptyPending" })
                  : f({ id: "teacherDashboard.table.emptyFiltered" })}
              </TableCell>
            </TableRow>
          )}
          {!isLoading &&
            rows.length > 0 &&
            rows.map((s) => (
              <TableRow
                key={s.id}
                sx={{
                  height: 72,
                  backgroundColor: isSelected(s.id)
                    ? "rgba(0,153,204,0.08)"
                    : "transparent",
                }}
              >
                <TableCell align="center" sx={cellSx}>
                  {s.status !== "逾期審核" && (
                    <Checkbox
                      checked={isSelected(s.id)}
                      onChange={() => onToggleSelect(s.id)}
                      sx={{
                        "&.Mui-checked": { color: "#0099cc" },
                      }}
                    />
                  )}
                </TableCell>
                <TableCell
                  sx={{
                    ...cellSx,
                    fontSize: 14,
                    color: "#333",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {s.name}
                </TableCell>
                <TableCell
                  sx={{
                    ...cellSx,
                    fontSize: 14,
                    color: "#333",
                    whiteSpace: "normal",
                    wordBreak: "break-word",
                    overflowWrap: "break-word",
                  }}
                >
                  {s.school}
                </TableCell>
                <TableCell
                  sx={{
                    ...cellSx,
                    fontSize: 14,
                    color: "#333",
                    whiteSpace: "normal",
                    wordBreak: "break-word",
                    overflowWrap: "break-word",
                  }}
                >
                  {s.studentId}
                </TableCell>
                <TableCell sx={{ ...cellSx, verticalAlign: "middle" }}>
                  <DateTimeCell value={s.applyTime} />
                </TableCell>
                <TableCell sx={{ ...cellSx, overflow: "hidden" }}>
                  <TruncatedReason
                    text={s.reason}
                    onReadMore={() => onReview(s)}
                  />
                </TableCell>
                <TableCell sx={cellSx}>
                  <StatusChip status={s.status} label={s.statusLabel} />
                </TableCell>
                <TableCell sx={{ ...cellSx, verticalAlign: "middle" }}>
                  <DateTimeCell value={s.displayDeadline} />
                </TableCell>
                <TableCell sx={{ ...cellSx, verticalAlign: "middle" }}>
                  <DateTimeCell value={s.approvalTime || ""} />
                </TableCell>
                <TableCell
                  sx={{
                    ...cellSx,
                    fontSize: 14,
                    color: "#333",
                    whiteSpace: "normal",
                    wordBreak: "break-word",
                    overflowWrap: "break-word",
                  }}
                >
                  {s.approver || ""}
                </TableCell>
                <TableCell
                  align="center"
                  sx={{ ...cellSx, verticalAlign: "middle" }}
                >
                  <IconButton
                    color="secondary"
                    aria-label={f({ id: "teacherDashboard.field.action" })}
                    onClick={() => onReview(s)}
                  >
                    <EditIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
