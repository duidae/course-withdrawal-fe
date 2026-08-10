import { type ChangeEvent, useState } from "react";
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
import CircularProgress from "@mui/material/CircularProgress";
import EditIcon from "@mui/icons-material/Edit";
import { columns, cellSx } from "./constants";
import { DateTimeCell } from "./DateTimeCell";
import { TruncatedReason } from "./TruncatedReason";
import { StatusChip } from "../../components/StatusChip";
import { type StudentRow, WithdrawalStatus } from "./types";
import { defaultPageSize } from "../constants";

export type WithdrawalTableRow = StudentRow & {
  displayDeadline: string;
};

type WithdrawalTableProps = {
  rows: WithdrawalTableRow[];
  isLoading?: boolean;
  showEmptyPendingMessage: boolean;
  allSelected: boolean;
  someSelected: boolean;
  onSelectAll: (e: ChangeEvent<HTMLInputElement>) => void;
  isSelected: (id: number) => boolean;
  onToggleSelect: (id: number) => void;
  onReview: (withdrawal: StudentRow) => void;
};

export const WithdrawalTable = ({
  rows,
  isLoading,
  showEmptyPendingMessage,
  allSelected,
  someSelected,
  onSelectAll,
  isSelected,
  onToggleSelect,
  onReview,
}: WithdrawalTableProps) => {
  const { formatMessage: f } = useIntl();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(defaultPageSize);

  const pageCount = Math.max(1, Math.ceil(rows.length / rowsPerPage));
  const currentPage = Math.min(page, pageCount - 1);
  const pagedRows = rows.slice(
    currentPage * rowsPerPage,
    currentPage * rowsPerPage + rowsPerPage,
  );

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (e: ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(Number.parseInt(e.target.value, defaultPageSize));
    setPage(0);
  };

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
                  disabled={!!isLoading}
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
              pagedRows.map((s) => (
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
                    {s.status !== WithdrawalStatus.OVERDUE && (
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
                    {s.studentName}
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
                    {s.sectionName}
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
                    <DateTimeCell value={s.submittedAt} />
                  </TableCell>
                  <TableCell sx={{ ...cellSx }}>
                    <TruncatedReason
                      text={s.reason}
                      onReadMore={() => onReview(s)}
                    />
                  </TableCell>
                  <TableCell sx={cellSx}>
                    <StatusChip status={s.status} isTeacher={true} />
                  </TableCell>
                  <TableCell sx={{ ...cellSx, verticalAlign: "middle" }}>
                    <DateTimeCell value={s.displayDeadline} />
                  </TableCell>
                  <TableCell sx={{ ...cellSx, verticalAlign: "middle" }}>
                    <DateTimeCell value={s.reviewedAt || ""} />
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
                    {s.reviewerName || ""}
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{ ...cellSx, verticalAlign: "middle" }}
                  >
                    <IconButton
                      aria-label={f({ id: "teacherDashboard.field.action" })}
                      onClick={() => onReview(s)}
                      sx={{ color: "action.active" }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        count={rows.length}
        page={currentPage}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[10, 25, 50]} // TODO
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
