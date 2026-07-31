import { useIntl } from "react-intl";
import Chip, { type ChipProps } from "@mui/material/Chip";
import { type SxProps, type Theme } from "@mui/material/styles";
import { BaseWithdrawalStatus } from "../models";

type ChipStyle = {
  color: ChipProps["color"];
  sx?: SxProps<Theme>;
};

const getChipStyle = (status: string): ChipStyle => {
  switch (status) {
    case BaseWithdrawalStatus.PENDING:
      return { color: "primary" };
    case BaseWithdrawalStatus.APPROVED:
      return { color: "success" };
    case BaseWithdrawalStatus.DECLINED:
      return { color: "error" };
    case BaseWithdrawalStatus.OVERDUE:
    default:
      return { color: "default", sx: { color: "text.secondary" } };
  }
};

const getStatusI18nKey = (status: BaseWithdrawalStatus) => {
  const statusLabelIds: Record<BaseWithdrawalStatus | "notSubmitted", string> =
    {
      [BaseWithdrawalStatus.PENDING]: "teacherDashboard.status.pending",
      [BaseWithdrawalStatus.OVERDUE]: "teacherDashboard.status.overdue",
      [BaseWithdrawalStatus.APPROVED]: "teacherDashboard.status.approved",
      [BaseWithdrawalStatus.DECLINED]: "teacherDashboard.status.declined",
      [BaseWithdrawalStatus.NOTSUBMITTED]:
        "studentDashboard.status.notSubmitted",
    };
  return statusLabelIds[status] ?? status;
};

type StatusChipProps = {
  status: BaseWithdrawalStatus | "notSubmitted";
};

export const StatusChip = ({ status }: StatusChipProps) => {
  const { formatMessage: f } = useIntl();
  const i18nKey = getStatusI18nKey(status);
  const style = getChipStyle(status);

  return (
    <Chip
      label={f({ id: i18nKey })}
      size="medium"
      variant="outlined"
      color={style.color}
      sx={style.sx}
    />
  );
};

export default StatusChip;
