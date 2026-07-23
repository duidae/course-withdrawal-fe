import { useIntl } from "react-intl";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import RefreshIcon from "@mui/icons-material/Refresh";
import { SelectField } from "./SelectField";
import { type SelectOption, WithdrawalStatus } from "./types";

type FilterBarProps = {
  disabled?: boolean;
  searchName: string;
  searchErrorType: string | null;
  onSearchNameChange: (value: string) => void;
  onSearchErrorTypeChange: (errorType: string | null) => void;
  classFilter: string;
  onClassFilterChange: (value: string) => void;
  classOptions: SelectOption[];
  statusFilter: WithdrawalStatus;
  onStatusFilterChange: (value: WithdrawalStatus) => void;
  statusOptions: SelectOption[];
  showRefresh: boolean;
  onRefresh: () => void;
  onExport: () => void;
  selectedCount: number;
  hasSelections: boolean;
  onApprove: () => void;
  onDecline: () => void;
};

export const FilterBar = ({
  disabled,
  searchName,
  searchErrorType,
  onSearchNameChange,
  onSearchErrorTypeChange,
  classFilter,
  onClassFilterChange,
  classOptions,
  statusFilter,
  onStatusFilterChange,
  statusOptions,
  showRefresh,
  onRefresh,
  onExport,
  selectedCount,
  hasSelections,
  onApprove,
  onDecline,
}: FilterBarProps) => {
  const { formatMessage: f } = useIntl();

  return (
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
            disabled={disabled}
            label={f({ id: "teacherDashboard.filter.studentName" })}
            value={searchName}
            onChange={(e) => {
              const val = e.target.value;
              onSearchNameChange(val);
              if (val === "") {
                onSearchErrorTypeChange(null);
              } else if (val.length > 50) {
                onSearchErrorTypeChange("tooLong");
              } else if (/[^一-鿿㐀-䶿豈-﫿ꀀ-꒏A-Za-z]/.test(val)) {
                onSearchErrorTypeChange("invalidChars");
              } else {
                onSearchErrorTypeChange(null);
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
            disabled={disabled}
            label={f({ id: "teacherDashboard.field.section" })}
            value={classFilter}
            onChange={onClassFilterChange}
            options={classOptions}
            width={220}
          />
          <SelectField
            disabled={disabled}
            label={f({ id: "teacherDashboard.field.decision" })}
            value={statusFilter}
            onChange={(value) =>
              onStatusFilterChange(value as WithdrawalStatus)
            }
            options={statusOptions}
            width={220}
          />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {showRefresh && (
            <button
              onClick={onRefresh}
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
          <Button variant="outlined" disabled={disabled} onClick={onExport}>
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
            { count: selectedCount },
          )}
        </span>
        <Button
          size="small"
          variant="outlined"
          color="success"
          disabled={!hasSelections}
          onClick={onApprove}
        >
          {f({ id: "teacherDashboard.withdrawal.approve" })}
        </Button>
        <Button
          size="small"
          variant="outlined"
          color="error"
          disabled={!hasSelections}
          onClick={onDecline}
        >
          {f({ id: "teacherDashboard.withdrawal.decline" })}
        </Button>
      </div>
    </>
  );
};
