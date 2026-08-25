import { type ChangeEvent } from "react";
import { useIntl } from "react-intl";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TablePagination from "@mui/material/TablePagination";
import Checkbox from "@mui/material/Checkbox";
import IconButton from "@mui/material/IconButton";
import Skeleton from "@mui/material/Skeleton";
import EditIcon from "@mui/icons-material/Edit";
import { DateTimeCell } from "./DateTimeCell";
import { TruncatedReason } from "./TruncatedReason";
import { StatusChip } from "../../components/StatusChip";
import { BaseWithdrawalStatus } from "../../models";
import { type StudentRow } from "./types";
import { pageSizeOptions } from "../constants";
import { formatDate } from "../util";

const columns = [
  {
    key: "studentName",
    label: "teacherDashboard.table.header.studentName",
    width: 100,
  },
  {
    key: "class",
    label: "teacherDashboard.field.section",
    width: 110,
  },
  {
    key: "studentId",
    label: "teacherDashboard.field.studentId",
    width: 128,
  },
  {
    key: "submittedAt",
    label: "teacherDashboard.field.submittedAt",
    width: 96,
  },
  {
    key: "reason",
    label: "teacherDashboard.field.reason",
    width: 160,
  },
  {
    key: "decision",
    label: "teacherDashboard.field.decision",
    width: 100,
  },
  {
    key: "deadline",
    label: "teacherDashboard.field.deadline",
    width: 96,
  },
  {
    key: "reviewedAt",
    label: "teacherDashboard.field.reviewedAt",
    width: 96,
  },
  {
    key: "reviewer",
    label: "teacherDashboard.field.reviewer",
    width: 80,
  },
  {
    key: "action",
    label: "teacherDashboard.field.action",
    width: 50,
  },
];

const cellStyle = {
  padding: "8px",
  borderBottom: "1px solid rgba(0,0,0,0.06)",
};

export type EmptyMessageType =
  | "submission"
  | "pending"
  | "filtered"
  | "notEnabled";

type WithdrawalTableProps = {
  disabled: boolean;
  isLoading: boolean;
  rows: StudentRow[];
  emptyMessageType: EmptyMessageType;
  isAllSelected: boolean;
  isSomeSelected: boolean;
  page: number;
  rowsPerPage: number;
  total: number;
  onSelectAll: (e: ChangeEvent<HTMLInputElement>) => void;
  isSelected: (id: string) => boolean;
  onToggleSelect: (id: string) => void;
  onReview: (withdrawal: StudentRow) => void;
  onPageChange: (newPage: number) => void;
  onRowsPerPageChange: (rowsPerPage: number) => void;
};

export const WithdrawalTable = ({
  disabled,
  isLoading,
  rows,
  emptyMessageType,
  isAllSelected,
  isSomeSelected,
  page,
  rowsPerPage,
  total,
  onSelectAll,
  isSelected,
  onToggleSelect,
  onReview,
  onPageChange,
  onRowsPerPageChange,
}: WithdrawalTableProps) => {
  const { formatMessage: f } = useIntl();

  const handleChangePage = (_: unknown, newPage: number) => {
    onPageChange(newPage);
  };

  const handleChangeRowsPerPage = (e: ChangeEvent<HTMLInputElement>) => {
    onRowsPerPageChange(Number.parseInt(e.target.value, 10));
  };

  const showEmptyMessage =
    emptyMessageType === "notEnabled" || rows.length === 0;

  const skeletonRowsJSX = Array.from({ length: Math.min(rowsPerPage, 5) }).map(
    (_, i) => (
      <TableRow key={i} sx={{ height: 72 }}>
        <TableCell align="center" sx={cellStyle}>
          <Skeleton
            variant="circular"
            width={20}
            height={20}
            sx={{ display: "inline-block" }}
          />
        </TableCell>
        {columns.map((col) => (
          <TableCell key={col.key} sx={cellStyle}>
            {col.key === "decision" ? (
              <Skeleton variant="rounded" width={64} height={24} />
            ) : col.key === "action" ? (
              <Skeleton
                variant="circular"
                width={24}
                height={24}
                sx={{ margin: "0 auto" }}
              />
            ) : (
              <Skeleton variant="text" width="80%" />
            )}
          </TableCell>
        ))}
      </TableRow>
    ),
  );

  const emptyMessageRowJSX = (
    <TableRow>
      <TableCell
        colSpan={11}
        align="center"
        sx={{ padding: "16px", fontSize: 14, color: "#333" }}
      >
        {emptyMessageType === "notEnabled"
          ? f({ id: "teacherDashboard.table.notEnabled" })
          : emptyMessageType === "submission"
            ? f({ id: "teacherDashboard.table.emptySubmission" })
            : emptyMessageType === "pending"
              ? f({ id: "teacherDashboard.table.emptyPending" })
              : f({ id: "teacherDashboard.table.emptyFiltered" })}
      </TableCell>
    </TableRow>
  );

  const dataRowsJSX = rows.map((s) => (
    <TableRow
      key={s.id}
      sx={{
        height: 72,
        backgroundColor: isSelected(s.id)
          ? "rgba(0,153,204,0.08)"
          : "transparent",
      }}
    >
      <TableCell align="center" sx={cellStyle}>
        {s.status !== BaseWithdrawalStatus.OVERDUE && (
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
        title={s.studentName}
        sx={{
          ...cellStyle,
          fontSize: 14,
          color: "#333",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {s.studentName}
      </TableCell>
      <TableCell
        sx={{
          ...cellStyle,
          fontSize: 14,
          color: "#333",
          whiteSpace: "normal",
          wordBreak: "break-word",
          overflowWrap: "break-word",
        }}
      >
        {s.sectionName}
      </TableCell>
      <TableCell
        title={s.studentId}
        sx={{
          ...cellStyle,
          fontSize: 14,
          color: "#333",
          whiteSpace: "normal",
          wordBreak: "break-word",
          overflowWrap: "break-word",
        }}
      >
        {s.studentId}
      </TableCell>
      <TableCell sx={{ ...cellStyle, verticalAlign: "middle" }}>
        <DateTimeCell value={formatDate(s.submittedAt ?? "")} />
      </TableCell>
      <TableCell sx={{ ...cellStyle }}>
        <TruncatedReason text={s.reason} onReadMore={() => onReview(s)} />
      </TableCell>
      <TableCell sx={cellStyle}>
        <StatusChip status={s.status} isTeacher={true} />
      </TableCell>
      <TableCell sx={{ ...cellStyle, verticalAlign: "middle" }}>
        <DateTimeCell value={formatDate(s.reviewDeadline ?? "")} />
      </TableCell>
      <TableCell sx={{ ...cellStyle, verticalAlign: "middle" }}>
        <DateTimeCell value={formatDate(s.reviewedAt ?? "")} />
      </TableCell>
      <TableCell
        sx={{
          ...cellStyle,
          fontSize: 14,
          color: "#333",
          whiteSpace: "normal",
          wordBreak: "break-word",
          overflowWrap: "break-word",
        }}
      >
        {s.reviewerName || ""}
      </TableCell>
      <TableCell align="center" sx={{ ...cellStyle, verticalAlign: "middle" }}>
        <IconButton
          aria-label={f({ id: "teacherDashboard.field.action" })}
          onClick={() => onReview(s)}
          sx={{ color: "action.active" }}
        >
          <EditIcon fontSize="small" />
        </IconButton>
      </TableCell>
    </TableRow>
  ));

  return (
    <Box className="flex flex-col">
      <TableContainer
        sx={{
          border: "1px solid rgba(0,0,0,0.12)",
          borderBottom: "none",
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
                  disabled={isLoading}
                  checked={isAllSelected}
                  indeterminate={isSomeSelected}
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
                      ? { minWidth: col.width, width: col.width }
                      : { width: col.width }),
                  }}
                >
                  {f({ id: col.label })}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading
              ? skeletonRowsJSX
              : showEmptyMessage
                ? emptyMessageRowJSX
                : dataRowsJSX}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        disabled={disabled}
        component="div"
        count={total}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={pageSizeOptions}
        labelRowsPerPage={
          <Typography variant="body2" component="span" color="textSecondary">
            {f({ id: "teacherDashboard.table.rowsPerPage" })}
          </Typography>
        }
        slotProps={{
          select: {
            MenuProps: {
              sx: {
                "& .MuiMenuItem-root": { fontSize: 12 },
              },
            },
          },
        }}
        sx={{
          "& .MuiTablePagination-select": { fontSize: 12 },
          "& .MuiTablePagination-displayedRows": { fontSize: 12 },
        }}
      />
    </Box>
  );
};
