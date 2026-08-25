import { type Dayjs } from "dayjs";
import { useIntl } from "react-intl";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { datePickerLocale } from "./datePickerLocale";

// Shared validation rule for the three admin dialogs that let an operator
// pick a withdrawal window: start must be before end, and end must not be
// after the review deadline.
export const isTimeOrderInvalid = (
  startAt: Dayjs | null,
  endAt: Dayjs | null,
  reviewDeadline: Dayjs | null,
): boolean =>
  !!startAt &&
  !!endAt &&
  !!reviewDeadline &&
  !(startAt.isBefore(endAt) && !endAt.isAfter(reviewDeadline));

type WithdrawalPeriodFieldsProps = {
  startAt: Dayjs | null;
  endAt: Dayjs | null;
  reviewDeadline: Dayjs | null;
  onStartAtChange: (value: Dayjs | null) => void;
  onEndAtChange: (value: Dayjs | null) => void;
  onReviewDeadlineChange: (value: Dayjs | null) => void;
};

export const WithdrawalPeriodFields = ({
  startAt,
  endAt,
  reviewDeadline,
  onStartAtChange,
  onEndAtChange,
  onReviewDeadlineChange,
}: WithdrawalPeriodFieldsProps) => {
  const { formatMessage: f } = useIntl();
  const invalid = isTimeOrderInvalid(startAt, endAt, reviewDeadline);

  return (
    <>
      <LocalizationProvider
        dateAdapter={AdapterDayjs}
        adapterLocale={datePickerLocale.adapterLocale}
        localeText={datePickerLocale.localeText}
      >
        <Stack direction="row" spacing={2}>
          <DateTimePicker
            label={"申請開始時間"}
            value={startAt}
            onChange={onStartAtChange}
            slotProps={{
              textField: { error: invalid, fullWidth: true },
            }}
          />
          <DateTimePicker
            label={"申請截止時間"}
            value={endAt}
            onChange={onEndAtChange}
            slotProps={{
              textField: { error: invalid, fullWidth: true },
            }}
          />
          <DateTimePicker
            label={"教師審核期限"}
            value={reviewDeadline}
            onChange={onReviewDeadlineChange}
            slotProps={{
              textField: { error: invalid, fullWidth: true },
            }}
          />
        </Stack>
      </LocalizationProvider>
      {invalid && (
        <Typography variant="caption" color="error">
          {f({ id: "adminDashboard.timeOrderError" })}
        </Typography>
      )}
    </>
  );
};
