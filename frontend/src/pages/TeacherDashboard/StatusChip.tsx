import Chip, { type ChipProps } from "@mui/material/Chip";
import { type SxProps, type Theme } from "@mui/material/styles";
import { BaseWithdrawalStatus } from "../../models";

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
      return { color: "default", sx: { color: "text.secondary" } };
    default:
      return { color: "default" };
  }
};

type StatusChipProps = {
  status: string;
  label?: string;
};

export const StatusChip = ({
  status,
  label: labelOverride,
}: StatusChipProps) => {
  const label = labelOverride ?? status;
  const style = getChipStyle(status);
  return (
    <Chip
      label={label}
      size="small"
      variant="outlined"
      color={style.color}
      sx={style.sx}
    />
  );
};

export default StatusChip;
