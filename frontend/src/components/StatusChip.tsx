import { useIntl } from "react-intl";
import Chip, { type ChipProps } from "@mui/material/Chip";
import { type SxProps, type Theme } from "@mui/material/styles";
import { BaseWithdrawalStatus } from "../models";

type ChipStyle = {
  color: ChipProps["color"];
  sx?: SxProps<Theme>;
};

const getChipStyle = (status: BaseWithdrawalStatus): ChipStyle => {
  switch (status) {
    case BaseWithdrawalStatus.PENDING:
      return { color: "primary" };
    case BaseWithdrawalStatus.APPROVED:
      return { color: "success" };
    case BaseWithdrawalStatus.DECLINED:
      return { color: "error" };
    case BaseWithdrawalStatus.NOTSUBMITTED:
      return { color: "default", sx: { color: "text.secondary" } };
    case BaseWithdrawalStatus.OVERDUE:
    default:
      return { color: "default", sx: { color: "text.secondary" } };
  }
};

const getStatusI18nKey = (status: BaseWithdrawalStatus, isTeacher: boolean = false) => {
  const statusLabelIds: Partial<Record<BaseWithdrawalStatus, string>> = {
    [BaseWithdrawalStatus.PENDING]: "teacherDashboard.status.pending",
    [BaseWithdrawalStatus.OVERDUE]: "teacherDashboard.status.overdue",
    [BaseWithdrawalStatus.APPROVED]: isTeacher ? "teacherDashboard.status.approved" : "studentDashboard.status.approved",
    [BaseWithdrawalStatus.DECLINED]: isTeacher ? "teacherDashboard.status.declined" : "studentDashboard.status.declined",
    [BaseWithdrawalStatus.NOTSUBMITTED]: "studentDashboard.status.notSubmitted",
  };
  return statusLabelIds[status] ?? status;
};

type StatusChipProps = {
  status: BaseWithdrawalStatus;
  isTeacher?: boolean;
};

export const StatusChip = ({ status, isTeacher }: StatusChipProps) => {
  const { formatMessage: f } = useIntl();
  const i18nKey = getStatusI18nKey(status, isTeacher);
  const style = getChipStyle(status);

  return (
    <Chip
      label={f({ id: i18nKey })}
      size="medium"
      variant={status === BaseWithdrawalStatus.NOTSUBMITTED ? "filled" : "outlined"}
      color={style.color}
      sx={style.sx}
    />
  );
};

export default StatusChip;
