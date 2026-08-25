import { useIntl } from "react-intl";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { SelectField, type SelectOption } from "./SelectField";
import { BaseWithdrawalStatus } from "../../models";

export const WithdrawalStatusOption = {
  ALL: "all",
  ...BaseWithdrawalStatus,
} as const;

export type WithdrawalStatusOption =
  (typeof WithdrawalStatusOption)[keyof typeof WithdrawalStatusOption];

const hasInvalidCharacter = /[^一-鿿㐀-䶿豈-﫿ꀀ-꒏A-Za-z]/;

type FilterBarProps = {
  disabled?: boolean;
  searchName: string;
  searchErrorType: string | null;
  sectionFilter: string;
  sectionOptions: SelectOption[];
  statusFilter: WithdrawalStatusOption;
  statusOptions: SelectOption[];
  selectedCount: number;
  hasSelections: boolean;
  onSearchNameChange: (value: string) => void;
  onSearchErrorTypeChange: (errorType: string | null) => void;
  onSectionFilterChange: (value: string) => void;
  onStatusFilterChange: (value: WithdrawalStatusOption) => void;
  onExport: () => void;
  onApprove: () => void;
  onDecline: () => void;
};

export const FilterBar = ({
  disabled,
  searchName,
  searchErrorType,
  sectionFilter,
  sectionOptions,
  statusFilter,
  statusOptions,
  selectedCount,
  hasSelections,
  onSearchNameChange,
  onSearchErrorTypeChange,
  onSectionFilterChange,
  onStatusFilterChange,
  onExport,
  onApprove,
  onDecline,
}: FilterBarProps) => {
  const { formatMessage: f } = useIntl();

  return (
    <>
      <Box
        sx={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 1.5,
        }}
      >
        <Stack direction="row" spacing={3} sx={{ alignItems: "flex-start" }}>
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
              } else if (hasInvalidCharacter.test(val)) {
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
            sx={{ width: 220 }}
          />
          <SelectField
            disabled={disabled}
            label={f({ id: "teacherDashboard.field.section" })}
            value={sectionFilter}
            onChange={onSectionFilterChange}
            options={sectionOptions}
            width={220}
          />
          <SelectField
            disabled={disabled}
            label={f({ id: "teacherDashboard.field.decision" })}
            value={statusFilter}
            onChange={(value) =>
              onStatusFilterChange(value as WithdrawalStatusOption)
            }
            options={statusOptions}
            width={220}
          />
        </Stack>
        <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
          <Button variant="outlined" disabled={disabled} onClick={onExport}>
            {f({ id: "teacherDashboard.actions.exportAll" })}
          </Button>
        </Stack>
      </Box>

      <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
        <Typography sx={{ fontSize: 14, fontWeight: 500, color: "#333" }}>
          {f(
            { id: "teacherDashboard.selection.count" },
            { count: selectedCount },
          )}
        </Typography>
        <Button
          size="small"
          variant="outlined"
          color="success"
          disabled={!hasSelections}
          sx={{ fontWeight: 500 }}
          onClick={onApprove}
        >
          {f({ id: "teacherDashboard.withdrawal.approve" })}
        </Button>
        <Button
          size="small"
          variant="outlined"
          color="error"
          disabled={!hasSelections}
          sx={{ fontWeight: 500 }}
          onClick={onDecline}
        >
          {f({ id: "teacherDashboard.withdrawal.decline" })}
        </Button>
      </Stack>
    </>
  );
};
